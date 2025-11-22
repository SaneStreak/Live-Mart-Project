import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRetailerInventory, addToInventory, getRetailerOrders, updateOrderStatus, getAllProducts } from '../utils/api';
import { Store, Package, Plus, LogOut, Truck, CheckCircle, Clock } from 'lucide-react';

const RetailerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'orders'
    
    // Inventory State
    const [inventory, setInventory] = useState([]);
    const [masterCatalog, setMasterCatalog] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    // Orders State
    const [orders, setOrders] = useState([]);

    // --- LOAD DATA ---
    useEffect(() => {
        loadInventory();
        loadCatalog();
        loadOrders();
    }, [user.id]);

    const loadInventory = async () => {
        try {
            const res = await getRetailerInventory(user.id);
            setInventory(res.data);
        } catch (err) { console.error("Inv Error", err); }
    };

    const loadCatalog = async () => {
        try {
            const res = await getAllProducts();
            setMasterCatalog(res.data);
        } catch (err) { console.error("Catalog Error", err); }
    };

    const loadOrders = async () => {
        try {
            const res = await getRetailerOrders(user.id);
            // Sort by newest first
            setOrders(res.data.sort((a, b) => b.orderId - a.orderId));
        } catch (err) { console.error("Orders Error", err); }
    };

    // --- ACTIONS ---
    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            await addToInventory({
                retailerId: user.id,
                productId: selectedProduct,
                price: parseFloat(price),
                stock: parseInt(stock)
            });
            alert("Stock Updated!");
            loadInventory();
            setPrice(''); setStock('');
        } catch (err) { alert("Failed to update stock"); }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus); // Needs backend support (String body)
            loadOrders(); // Refresh UI
        } catch (err) { 
            alert("Status update failed. ensure backend supports simple string body or adjust API call."); 
        }
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
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Package className="w-5 h-5" /> My Inventory
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Truck className="w-5 h-5" /> Incoming Orders
                    </button>
                </div>

                {/* --- TAB 1: INVENTORY --- */}
                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Add Stock Form */}
                        <div className="bg-white p-6 rounded-xl shadow md:col-span-1 h-fit">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <Plus className="text-indigo-600" /> Update Stock
                            </h2>
                            <form onSubmit={handleAddStock} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Product</label>
                                    <select 
                                        value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" required
                                    >
                                        <option value="">-- Choose from Master Catalog --</option>
                                        {masterCatalog.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                                        <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full p-2 border rounded" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Qty</label>
                                        <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-full p-2 border rounded" required />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">Update Inventory</button>
                            </form>
                        </div>

                        {/* Inventory List */}
                        <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
                            <h2 className="text-lg font-bold mb-4 text-gray-800">Current Stock</h2>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 uppercase">
                                    <tr>
                                        <th className="p-3">Product</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3">Stock</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => (
                                        <tr key={item.inventoryId} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">{item.product.name}</td>
                                            <td className="p-3">₹{item.price}</td>
                                            <td className="p-3 font-bold">{item.stock}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${item.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {item.stock < 5 ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: ORDERS --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <Clock className="text-indigo-600" /> Order Queue
                        </h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-500 py-8 text-center">No orders received yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.orderId} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 hover:bg-white transition shadow-sm">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-indigo-800">Order #{order.orderId}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                    order.orderStatus === 'DELIVERED' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">Customer ID: {order.customer.id} | Name: {order.customer.name}</p>
                                            <div className="mt-2 text-sm">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="text-gray-800">
                                                        • <b>{item.product.name}</b> (x{item.quantity})
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-2 font-bold text-indigo-600">Total: ₹{order.totalAmount}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {order.orderStatus === 'placed' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.orderId, 'PACKED')}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-bold"
                                                >
                                                    Mark Packed
                                                </button>
                                            )}
                                            {order.orderStatus === 'PACKED' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.orderId, 'DELIVERED')}
                                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-bold flex items-center gap-1"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Deliver
                                                </button>
                                            )}
                                            {order.orderStatus === 'DELIVERED' && (
                                                <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed text-sm font-bold">
                                                    Completed
                                                </button>
                                            )}
                                        </div>
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