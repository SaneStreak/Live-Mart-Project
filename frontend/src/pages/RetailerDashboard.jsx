import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRetailerInventory, getRetailerOrders, updateOrderStatus, getAllProducts, requestStock, getMyStockRequests } from '../utils/api'; // 🟢 Added new imports
import { Store, Package, Plus, LogOut, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const RetailerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'requests'
    
    // Data State
    const [inventory, setInventory] = useState([]);
    const [masterCatalog, setMasterCatalog] = useState([]);
    const [orders, setOrders] = useState([]);
    const [myRequests, setMyRequests] = useState([]); // 🟢 NEW: Store B2B requests

    // Form State
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            const [invRes, catRes, ordRes, reqRes] = await Promise.all([
                getRetailerInventory(user.id),
                getAllProducts(),
                getRetailerOrders(user.id),
                getMyStockRequests(user.id) // 🟢 NEW: Fetch requests
            ]);

            setInventory(invRes.data);
            setMasterCatalog(catRes.data);
            setOrders(ordRes.data.sort((a, b) => b.orderId - a.orderId));
            setMyRequests(reqRes.data.reverse());
        } catch (err) { console.error("Load Error", err); }
    };

    // 🟢 NEW: Handle Stock Request (B2B)
    const handleRequestStock = async (e) => {
        e.preventDefault();
        if(!selectedProduct || !quantity) return alert("Please fill all fields");

        try {
            await requestStock({
                retailerId: user.id,
                productId: selectedProduct,
                quantity: parseInt(quantity)
            });
            alert("Restock Request Sent to Wholesaler! 🚚");
            setQuantity('');
            loadData(); // Refresh lists
        } catch (err) { 
            alert("Request Failed: " + (err.response?.data || err.message)); 
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus); 
            loadData(); 
        } catch (err) { alert("Update failed"); }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Store className="w-6 h-6" />
                    <h1 className="text-xl font-bold">Retailer Portal</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span>Shop ID: {user.id}</span>
                    <button onClick={logout} className="flex items-center gap-1 bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded transition">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">
                {/* Tab Switcher */}
                <div className="flex gap-4 mb-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-600'}`}>
                        <Package className="w-5 h-5" /> My Inventory
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-600'}`}>
                        <Truck className="w-5 h-5" /> Customer Orders
                    </button>
                    <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-600'}`}>
                        <Clock className="w-5 h-5" /> Restock Requests
                    </button>
                </div>

                {/* --- TAB 1: INVENTORY & REQUEST FORM --- */}
                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Request Stock Form */}
                        <div className="bg-white p-6 rounded-xl shadow md:col-span-1 h-fit border-t-4 border-indigo-500">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <Plus className="text-indigo-600" /> Request Stock
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Ask Wholesaler for more items.</p>
                            <form onSubmit={handleRequestStock} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Product</label>
                                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="">-- Master Catalog --</option>
                                        {masterCatalog.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Needed</label>
                                    <input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full p-2 border rounded" required placeholder="e.g. 50" />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700">Send Request</button>
                            </form>
                        </div>

                        {/* Inventory List */}
                        <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
                            <h2 className="text-lg font-bold mb-4 text-gray-800">Current Shelf Stock</h2>
                            {inventory.length === 0 ? <p className="text-gray-400">No items in stock. Request some!</p> : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 text-gray-600 uppercase">
                                        <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th></tr>
                                    </thead>
                                    <tbody>
                                        {inventory.map(item => (
                                            <tr key={item.inventoryId} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{item.product.name}</td>
                                                <td className="p-3">₹{item.price}</td>
                                                <td className="p-3 font-bold">{item.stock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB 2: CUSTOMER ORDERS --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <Clock className="text-indigo-600" /> Incoming Customer Orders
                        </h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-500 py-8 text-center">No orders received yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.orderId} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 hover:bg-white transition shadow-sm">
                                        <div className="mb-4 md:mb-0 w-full">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-lg text-indigo-800">Order #{order.orderId}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                    order.orderStatus === 'DELIVERED' ? 'bg-green-200 text-green-800' : 
                                                    order.orderStatus === 'PACKED' ? 'bg-blue-200 text-blue-800' :
                                                    'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-auto md:ml-2">
                                                    Total: ₹{order.totalAmount}
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-2">
                                                Customer: <span className="font-semibold">{order.customer?.name || "Unknown"}</span> (ID: {order.customer?.id})
                                            </p>

                                            {/* 🟢 NEW: Display Order Items List */}
                                            <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Items Ordered:</p>
                                                <ul className="space-y-1">
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.map((item) => (
                                                            <li key={item.id} className="flex justify-between">
                                                                <span>• <b>{item.product.name}</b></span>
                                                                <span className="text-gray-600">x {item.quantity}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-red-500 text-xs">No items found in order data.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                                            {order.orderStatus === 'placed' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.orderId, 'PACKED')}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-bold shadow"
                                                >
                                                    Mark Packed
                                                </button>
                                            )}
                                            {order.orderStatus === 'PACKED' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.orderId, 'DELIVERED')}
                                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-bold flex items-center gap-1 shadow"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Deliver
                                                </button>
                                            )}
                                            {order.orderStatus === 'DELIVERED' && (
                                                <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded cursor-not-allowed text-sm font-bold flex items-center gap-1 border border-gray-300">
                                                    <CheckCircle className="w-4 h-4" /> Completed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* --- TAB 3: MY REQUESTS (B2B) --- */}
                {activeTab === 'requests' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4">My Restock Requests</h2>
                        {myRequests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-yellow-50 text-yellow-800 uppercase">
                                    <tr><th className="p-3">ID</th><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3">Status</th></tr>
                                </thead>
                                <tbody>
                                    {myRequests.map(req => (
                                        <tr key={req.id} className="border-b">
                                            <td className="p-3">#{req.id}</td>
                                            <td className="p-3 font-bold">{req.product.name}</td>
                                            <td className="p-3">{req.quantity}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
                {/* 🟢 TAB 4: FEEDBACK */}
                {activeTab === 'feedback' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <MessageSquare className="text-indigo-600" /> Customer Reviews
                        </h2>
                        {feedbacks.length === 0 ? (
                            <p className="text-gray-500 py-8 text-center">No reviews yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {feedbacks.map((fb) => (
                                    <div key={fb.feedbackId} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800">{fb.product.name}</h3>
                                            <span className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {renderStars(fb.rating)}
                                        </div>
                                        <p className="text-gray-600 text-sm italic">"{fb.comment}"</p>
                                        <p className="text-xs text-indigo-600 mt-2 font-semibold">- {fb.customer.name}</p>
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