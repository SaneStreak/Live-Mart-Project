import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../utils/api'; // <--- FIXED PATH
import { useAuth } from '../context/AuthContext'; // <--- Need this for user.id

const Payment = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Retrieve all data passed from CustomerDashboard
    const { cartItems, totalAmount, retailerId } = location.state || { 
        cartItems: [], 
        totalAmount: 0, 
        retailerId: null 
    };

    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '', expiry: '', cvv: '', name: ''
    });

    // Redirect if missing data
    useEffect(() => {
        if (!cartItems || cartItems.length === 0 || !retailerId) {
            alert("Invalid session. returning to dashboard.");
            navigate('/customer/dashboard');
        }
    }, [cartItems, retailerId, navigate]);

    const handleInputChange = (e) => {
        setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate Processing Delay
        setTimeout(async () => {
            try {
                // 2. Prepare the exact payload your Backend expects
                // Note: This matches the structure used in CustomerDashboard previously
                const orderData = {
                    customerId: user.id,
                    retailerId: parseInt(retailerId),
                    totalAmount: totalAmount,
                    paymentMode: "CREDIT_CARD",
                    items: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        priceAtPurchase: item.price
                    }))
                };

                // 3. Call Backend
                await createOrder(orderData);

                alert("Payment Successful! Order Placed. 🚚");
                navigate('/customer/dashboard'); 
                
            } catch (error) {
                console.error("Order failed", error);
                alert("Payment processed, but Order Creation failed: " + (error.response?.data || error.message));
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Secure Payment</h2>
                
                <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200 flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">Total to Pay:</span>
                    <span className="text-2xl font-bold text-blue-800">₹{totalAmount?.toFixed(2)}</span>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Card Number</label>
                        <input type="text" name="cardNumber" required placeholder="0000 0000 0000 0000"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleInputChange} />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Expiry</label>
                            <input type="text" name="expiry" required placeholder="MM/YY"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={handleInputChange} />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">CVV</label>
                            <input type="password" name="cvv" required placeholder="123"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={handleInputChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name on Card</label>
                        <input type="text" name="name" required placeholder="John Doe"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleInputChange} />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full font-bold py-3 px-4 rounded transition duration-300 text-white ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}>
                        {loading ? 'Processing Payment...' : `Pay Now`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Payment;