import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, KeyRound } from 'lucide-react'; 
import { login, sendOtp, verifyOtp } from '../utils/api'; 
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google'; 
import axios from 'axios'; // 🟢 1. Added Axios for Google Request

function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [loginMethod, setLoginMethod] = useState('PASSWORD'); 
    const [otpSent, setOtpSent] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // 🟢 2. REAL BACKEND GOOGLE LOGIN
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            // Send the token to your Spring Boot Backend
            // The key "token" matches your Java DTO: GoogleLoginRequest
            const res = await axios.post('http://localhost:8080/api/auth/google-login', {
                token: credentialResponse.credential,
                role: "CUSTOMER" // Optional: Backend defaults to CUSTOMER anyway
            });

            const user = res.data;
            
            // Log user in via Context
            loginUser(user);
            
            alert(`Welcome ${user.name}!`);

            // Redirect based on role
            if (user.role === 'CUSTOMER') navigate('/customer/dashboard');
            else if (user.role === 'RETAILER') navigate('/retailer/dashboard');
            else if (user.role === 'WHOLESALER') navigate('/wholesaler/dashboard');

        } catch (err) {
            console.error("Google Login Error:", err);
            setError("Google Login Failed. Backend rejected the token.");
        } finally {
            setLoading(false);
        }
    };

    // 🟢 REAL OTP LOGIC (Via Email)
    const handleSendOTP = async () => {
        if (!formData.email) {
            setError("Please enter your email address");
            return;
        }
        setLoading(true);
        try {
            await sendOtp(formData.email); 
            setOtpSent(true);
            alert(`OTP sent to ${formData.email}. Check your inbox!`);
        } catch (err) {
            setError(err.response?.data || "Failed to send OTP. Email might not exist.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!formData.otp) return setError("Enter OTP");
        setLoading(true);
        try {
            const res = await verifyOtp(formData.email, formData.otp); 
            const user = res.data;
            loginUser(user);
            
            alert("Login Successful!");
            if (user.role === 'CUSTOMER') navigate('/customer/dashboard');
            else if (user.role === 'RETAILER') navigate('/retailer/dashboard');
            else if (user.role === 'WHOLESALER') navigate('/wholesaler/dashboard');
        } catch (err) {
            setError("Invalid OTP or Expired.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // OTP Flow
        if (loginMethod === 'OTP') {
            if (!otpSent) handleSendOTP();
            else handleVerifyOTP();
            return;
        }

        // Password Flow
        setLoading(true);
        try {
            const response = await login({ email: formData.email, password: formData.password });
            const user = response.data; 
            loginUser(user); 
            if (user.role === 'CUSTOMER') navigate('/customer/dashboard');
            else if (user.role === 'RETAILER') navigate('/retailer/dashboard');
            else if (user.role === 'WHOLESALER') navigate('/wholesaler/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                        <LogIn className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">LiveMART</h1>
                    <p className="text-blue-100">Your Local Online Marketplace</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Login Method Tabs */}
                    <div className="flex mb-6 border-b">
                        <button type="button" className={`flex-1 pb-2 text-sm font-bold transition ${loginMethod === 'PASSWORD' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`} onClick={() => { setLoginMethod('PASSWORD'); setError(''); }}>Password Login</button>
                        <button type="button" className={`flex-1 pb-2 text-sm font-bold transition ${loginMethod === 'OTP' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`} onClick={() => { setLoginMethod('OTP'); setError(''); }}>OTP Login (Email)</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* EMAIL FIELD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={otpSent && loginMethod === 'OTP'} required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition" placeholder="you@example.com" />
                            </div>
                        </div>

                        {/* PASSWORD FIELD */}
                        {loginMethod === 'PASSWORD' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition" placeholder="••••••••" />
                                </div>
                            </div>
                        )}

                        {/* OTP FIELD */}
                        {loginMethod === 'OTP' && otpSent && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP (Check Email)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                                    <input type="text" name="otp" value={formData.otp} onChange={handleChange} required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition" placeholder="123456" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right cursor-pointer hover:text-purple-600" onClick={() => setOtpSent(false)}>Resend OTP?</p>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50">
                            {loading ? 'Processing...' : (loginMethod === 'OTP' && !otpSent ? 'Send OTP' : 'Sign In')}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign in with</span></div>
                    </div>

                    <div className="flex justify-center mb-6">
                        {/* 🟢 3. GOOGLE LOGIN BUTTON */}
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => { 
                                console.log('Login Failed'); 
                                setError("Google Sign-In Failed"); 
                            }} 
                            useOneTap
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600">Don't have an account? <Link to="/signup" className="text-purple-600 font-semibold hover:text-purple-700">Create Account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;