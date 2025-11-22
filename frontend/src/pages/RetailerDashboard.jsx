import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRetailerInventory, getRetailerOrders, updateOrderStatus, getAllProducts, requestStock, getMyStockRequests, getRetailerFeedback } from '../utils/api';
import { Store, Package, Plus, LogOut, Truck, CheckCircle, Clock, MessageSquare, Star } from 'lucide-react';

const RetailerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory'); 
    
    const [inventory, setInventory] = useState([]);
    const [masterCatalog, setMasterCatalog] = useState([]);
    const [orders, setOrders] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]); // Stores reviews

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if(user && user.id) loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            const [invRes, catRes, ordRes, reqRes, feedRes] = await Promise.all([
                getRetailerInventory(user.id),
                getAllProducts(),
                getRetailerOrders(user.id),
                getMyStockRequests(user.id),
                getRetailerFeedback(user.id) // This calls the API we just fixed
            ]);

            setInventory(invRes.data);
            setMasterCatalog(catRes.data);
            setOrders(ordRes.data.sort((a, b) => b.orderId - a.orderId));
            setMyRequests(reqRes.data.reverse());
            setFeedbacks(feedRes.data.reverse()); 
        } catch (err) { console.error("Load Error", err); }
    };

    const handleRequestStock = async (e) => {
        e.preventDefault();
        if(!selectedProduct || !quantity) return alert("Please fill all fields");
        try {
            await requestStock({ retailerId: user.id, productId: selectedProduct, quantity: parseInt(quantity) });
            alert("Restock Request Sent!");
            setQuantity(''); loadData();
        } catch (err) { alert("Request Failed: " + err.message); }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try { await updateOrderStatus(orderId, newStatus); loadData(); } 
        catch (err) { alert("Update failed"); }
    };

    const renderStars = (count) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2"><Store className="w-6 h-6" /><h1 className="text-xl font-bold">Retailer Portal</h1></div>
                <div className="flex items-center gap-4">
                    <span>Shop ID: {user.id}</span>
                    <button onClick={logout} className="flex items-center gap-1 bg-indigo-800 px-3 py-1 rounded"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex gap-4 mb-6 overflow-x-auto">
                    {['inventory', 'orders', 'requests', 'feedback'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 capitalize transition ${activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-600'}`}
                        >
                            {tab === 'inventory' && <Package className="w-5 h-5" />}
                            {tab === 'orders' && <Truck className="w-5 h-5" />}
                            {tab === 'requests' && <Clock className="w-5 h-5" />}
                            {tab === 'feedback' && <MessageSquare className="w-5 h-5" />}
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow md:col-span-1 h-fit border-t-4 border-indigo-500">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Plus className="text-indigo-600" /> Request Stock</h2>
                            <form onSubmit={handleRequestStock} className="space-y-4">
                                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full p-2 border rounded" required>
                                    <option value="">-- Master Catalog --</option>
                                    {masterCatalog.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full p-2 border rounded" required placeholder="Qty" />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded">Send Request</button>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
                            <h2 className="text-lg font-bold mb-4">Current Stock</h2>
                            {inventory.length === 0 ? <p className="text-gray-400">No stock.</p> : (
                                <table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th></tr></thead>
                                    <tbody>{inventory.map(item => (<tr key={item.inventoryId} className="border-b"><td className="p-3 font-medium">{item.product.name}</td><td className="p-3">₹{item.price}</td><td className="p-3 font-bold">{item.stock}</td></tr>))}</tbody></table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4">Incoming Orders</h2>
                        {orders.length === 0 ? <p className="text-gray-500">No orders yet.</p> : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.orderId} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-indigo-700">Order #{order.orderId}</span>
                                                <span className="text-xs text-gray-500">Total: ₹{order.totalAmount}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                    order.orderStatus === 'DELIVERED' ? 'bg-green-200 text-green-800' : 
                                                    order.orderStatus === 'PACKED' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
                                                }`}>{order.orderStatus}</span>
                                            </div>
                                            <div className="text-sm mt-2 bg-gray-50 p-2 rounded border">
                                                {order.items && order.items.map(i => (
                                                    <div key={i.id}>• {i.product.name} (x{i.quantity})</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {order.orderStatus === 'placed' && <button onClick={() => handleStatusUpdate(order.orderId, 'PACKED')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Pack</button>}
                                            {order.orderStatus === 'PACKED' && <button onClick={() => handleStatusUpdate(order.orderId, 'DELIVERED')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Deliver</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4">Restock Requests</h2>
                        {myRequests.length === 0 ? <p className="text-gray-500">No requests.</p> : (
                            <table className="w-full text-left text-sm"><thead className="bg-yellow-50 text-yellow-800"><tr><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3">Status</th></tr></thead>
                                <tbody>{myRequests.map(req => (<tr key={req.id} className="border-b"><td className="p-3 font-bold">{req.product.name}</td><td className="p-3">{req.quantity}</td><td className="p-3">{req.status}</td></tr>))}</tbody></table>
                        )}
                    </div>
                )}

                {/* 🟢 Feedback Tab */}
                {activeTab === 'feedback' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <MessageSquare className="text-indigo-600" /> Customer Reviews
                        </h2>
                        {feedbacks.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-2">No reviews found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {feedbacks.map((fb) => (
                                    <div key={fb.feedbackId} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800">{fb.product ? fb.product.name : "Unknown Item"}</h3>
                                            <span className="text-xs text-gray-500">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ""}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {renderStars(fb.rating)}
                                        </div>
                                        <p className="text-gray-600 text-sm italic">"{fb.comment}"</p>
                                        <p className="text-xs text-indigo-600 mt-2 font-semibold">
                                            - {fb.customer ? fb.customer.name : "Customer"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default RetailerDashboard;