import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        // We can skip token check for now since backend doesn't send one yet
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    // --- 🔴 FIX: Adjusted to handle User object only ---
    const loginUser = (userData) => {
        // Since backend doesn't send a token yet, we just store the user.
        // When you add JWT later, you can add localStorage.setItem('token', token); back.
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};