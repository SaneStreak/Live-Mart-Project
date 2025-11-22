import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, addProduct, getPendingWholesaleOrders, approveStockRequest } from '../utils/api'; 
import { Package, Plus, LogOut, Tag, Image as ImageIcon, DollarSign, Bell, CheckCircle } from 'lucide-react';

const WholesalerDashboard = () => {
    const { user, logout } = useAuth();
    
    const [products, setProducts] = useState([]);
    const [requests, setRequests] = useState([]); // 🟢 NEW: Store pending requests
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', category: '', description: '', basePrice: '', image: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchRequests(); // 🟢 NEW: Load requests on mount
        
        // Optional: Poll every 5 seconds for new requests
        const interval = setInterval(fetchRequests, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await getAllProducts();
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    // 🟢 NEW: Fetch pending orders
    const fetchRequests = async () => {
        try {
            const res = await getPendingWholesaleOrders();
            setRequests(res.data);
        } catch (err) { console.error(err); }
    };

    // 🟢 NEW: Handle Approval
    const handleApprove = async (orderId) => {
        if(!window.confirm("Approve this request and send stock?")) return;
        try {
            await approveStockRequest(orderId);
            alert("Request Approved! Inventory updated for Retailer.");
            fetchRequests(); // Refresh list
        } catch (err) {
            alert("Failed to approve");
        }
    };

    // ... (Existing Form Logic: handleChange, handleSubmit) ...
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, basePrice: parseFloat(formData.basePrice) };
            await addProduct(payload);
            alert("Product Added Successfully!");
            setFormData({ name: '', category: '', description: '', basePrice: '', image: '' });
            fetchProducts();
        } catch (err) { alert("Failed: " + err.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-purple-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    <h1 className="text-xl font-bold">LiveMART Wholesaler</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span>Admin: {user?.name}</span>
                    <button onClick={logout} className="flex items-center gap-1 bg-purple-800 px-3 py-1 rounded">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Add Product */}
                <div className="md:col-span-1 space-y-6">
                    {/* 🟢 NEW: PENDING REQUESTS WIDGET */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <Bell className="text-yellow-600" /> Pending Requests
                        </h2>
                        {requests.length === 0 ? (
                            <p className="text-gray-400 text-sm">No new requests.</p>
                        ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {requests.map(req => (
                                    <div key={req.id} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <p className="font-bold text-sm text-gray-800">{req.retailer.name} (ID: {req.retailer.id})</p>
                                        <p className="text-xs text-gray-600">Needs: <b>{req.quantity} x {req.product.name}</b></p>
                                        <button 
                                            onClick={() => handleApprove(req.id)}
                                            className="mt-2 w-full bg-green-600 text-white text-xs font-bold py-1 rounded hover:bg-green-700 flex justify-center items-center gap-1"
                                        >
                                            <CheckCircle className="w-3 h-3" /> Approve & Send
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6 border-t-4 border-purple-600">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-purple-600" /> Add Master Product
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ... (Keep your existing inputs here: Name, Category, Desc, Price, Image) ... */}
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Product Name" />
                            <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Category" />
                            <input type="number" name="basePrice" required value={formData.basePrice} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Base Price" />
                            <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Image URL" />
                            
                            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-2 rounded">
                                {loading ? 'Adding...' : 'Add to Catalog'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Master Catalog */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Master Catalog</h2>
                        {/* ... (Keep your existing Table code here) ... */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm"><th className="p-3">Name</th><th className="p-3">Price</th></tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.productId} className="border-b">
                                            <td className="p-3 font-bold">{p.name}</td>
                                            <td className="p-3">₹{p.basePrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesalerDashboard;