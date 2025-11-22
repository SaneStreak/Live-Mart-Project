import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, addProduct } from '../utils/api'; // Ensure these exist in api.js
import { Package, Plus, LogOut, Tag, Image as ImageIcon, DollarSign } from 'lucide-react';

const WholesalerDashboard = () => {
    const { user, logout } = useAuth();
    
    // State for List
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // State for Form
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        basePrice: '',
        image: ''
    });

    // Fetch Products on Load
    const fetchProducts = async () => {
        try {
            const res = await getAllProducts();
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert basePrice to number
            const payload = { 
                ...formData, 
                basePrice: parseFloat(formData.basePrice) 
            };
            
            await addProduct(payload);
            
            alert("Product Added Successfully!");
            setFormData({ name: '', category: '', description: '', basePrice: '', image: '' }); // Reset form
            fetchProducts(); // Refresh list
        } catch (err) {
            alert("Failed to add product: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-purple-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    <h1 className="text-xl font-bold">LiveMART Wholesaler</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span>Admin: {user.name}</span>
                    <button onClick={logout} className="flex items-center gap-1 bg-purple-800 hover:bg-purple-900 px-3 py-1 rounded transition">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Add Product Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6 border-t-4 border-purple-600">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-purple-600" /> Add New Product
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                <input 
                                    type="text" name="name" required 
                                    value={formData.name} onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="e.g. Amul Butter 500g"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text" name="category" required 
                                        value={formData.category} onChange={handleChange}
                                        className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Dairy"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea 
                                    name="description" rows="2" required 
                                    value={formData.description} onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Product details..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (₹)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="number" name="basePrice" required step="0.01"
                                        value={formData.basePrice} onChange={handleChange}
                                        className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text" name="image" 
                                        value={formData.image} onChange={handleChange}
                                        className="w-full pl-8 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="http://..."
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 transition"
                            >
                                {loading ? 'Adding...' : 'Add to Catalog'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Product List */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Master Catalog ({products.length})</h2>
                        
                        {products.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">No products in the system yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                            <th className="p-3 border-b">Image</th>
                                            <th className="p-3 border-b">Name</th>
                                            <th className="p-3 border-b">Category</th>
                                            <th className="p-3 border-b">Base Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => (
                                            <tr key={p.productId} className="hover:bg-gray-50 transition border-b last:border-0">
                                                <td className="p-3">
                                                    <img 
                                                        src={p.image || "https://via.placeholder.com/40"} 
                                                        alt={p.name} 
                                                        className="w-10 h-10 rounded object-cover bg-gray-200"
                                                    />
                                                </td>
                                                <td className="p-3 font-semibold text-gray-800">{p.name}</td>
                                                <td className="p-3">
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-bold text-gray-600">₹{p.basePrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WholesalerDashboard;