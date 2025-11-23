import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const signup = (data) => API.post('/api/auth/signup', data);
export const login = (data) => API.post('/api/auth/login', data);

// Product
export const getAllProducts = () => API.get('/products');
export const getProductById = (id) => API.get(`/products/${id}`);
export const addProduct = (data) => API.post('/products/add', data);

// Inventory
export const addToInventory = (data) => API.post('/inventory/add', data);
export const updateInventory = (id, data) => API.put(`/inventory/update/${id}`, data);
export const getRetailerInventory = (retailerId) => API.get(`/inventory/retailer/${retailerId}`);

// Order
export const createOrder = (orderData) => API.post('/orders/create', orderData);
export const getCustomerOrders = (customerId) => API.get(`/orders/customer/${customerId}`);
export const getRetailerOrders = (retailerId) => API.get(`/orders/retailer/${retailerId}`);
export const updateOrderStatus = (orderId, status) => API.put(`/orders/update-status/${orderId}?status=${status}`);

// Wholesale
export const requestStock = (data) => API.post('/wholesale/request', data);
export const approveStockRequest = (orderId) => API.put(`/wholesale/approve/${orderId}`);
export const getPendingWholesaleOrders = () => API.get('/wholesale/pending');
export const getMyStockRequests = (retailerId) => API.get(`/wholesale/retailer/${retailerId}`);

// Feedback
export const addFeedback = (data) => API.post('/feedback/add', data);
export const getProductFeedback = (productId) => API.get(`/feedback/product/${productId}`);
// 🟢 NEW: Add this line!
export const getRetailerFeedback = (retailerId) => API.get(`/feedback/retailer/${retailerId}`);

// 🟢 NEW
export const sendOtp = (email) => API.post('/api/auth/send-otp', { email });
export const verifyOtp = (email, otp) => API.post('/api/auth/verify-otp', { email, otp });

export default API;