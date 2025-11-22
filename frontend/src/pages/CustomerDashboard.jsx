import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRetailerInventory, createOrder } from '../utils/api';
import { ShoppingCart, Store, Search, Plus, Minus, LogOut, CreditCard, MapPin, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // --- State ---
    const [shopId, setShopId] = useState('1');
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState({}); 
    const [loading, setLoading] = useState(false);

    // --- Location State ---
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyShops, setNearbyShops] = useState([]);

    // --- Mock Data for "Innovation" Marks ---
    // These simulate real shops at specific coordinates
    // --- Mock Data: Real Hyderabad Locations ---
    const MOCK_RETAILERS = [
        { id: 1, name: "Ratnadeep Supermarket (Hitech City)", lat: 17.4435, lng: 78.3772 }, 
        { id: 2, name: "Vijetha Supermarket (Jubilee Hills)", lat: 17.4326, lng: 78.4071 },
        { id: 3, name: "Campus Mart (BITS Hyderabad)", lat: 17.5449, lng: 78.5718 } 
    ];

    // --- 1. Get Location on Load ---
    useEffect(() => {
        // Load default shop
        fetchShop();

        // Get GPS Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    calculateDistances(position.coords.latitude, position.coords.longitude);
                },
                (error) => console.log("Location permission denied")
            );
        }
    }, []);

    // --- 2. Calculate Distance (Haversine Formula) ---
    const calculateDistances = (userLat, userLng) => {
        const updatedShops = MOCK_RETAILERS.map(shop => {
            const R = 6371; // Radius of earth in km
            const dLat = deg2rad(shop.lat - userLat);
            const dLon = deg2rad(shop.lng - userLng);
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(shop.lat)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const d = R * c; // Distance in km
            return { ...shop, distance: d.toFixed(1) };
        });
        // Sort by nearest
        updatedShops.sort((a, b) => a.distance - b.distance);
        setNearbyShops(updatedShops);
    };
    const simulateLocation = () => {
        // Coordinates for BITS Hyderabad Audi
        const audiLat = 17.5455; 
        const audiLng = 78.5715;
        
        console.log("Simulating Location: BITS Audi");
        setUserLocation({ lat: audiLat, lng: audiLng });
        calculateDistances(audiLat, audiLng);
    };

    const deg2rad = (deg) => deg * (Math.PI/180);

    // --- 3. Fetch Inventory ---
    const fetchShop = async () => {
        setLoading(true);
        try {
            const res = await getRetailerInventory(shopId);
            setInventory(res.data);
        } catch (err) {
            // alert("Shop not found"); // Commented out to avoid annoyances during typing
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Cart Logic ---
    const addToCart = (item) => {
        setCart(prev => {
            const current = prev[item.product.id] || { qty: 0, price: item.price, name: item.product.name };
            if (current.qty + 1 > item.stock) {
                alert("Not enough stock!");
                return prev;
            }
            return { ...prev, [item.product.id]: { ...current, qty: current.qty + 1 } };
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => {
            const newState = { ...prev };
            if (newState[productId].qty > 1) newState[productId].qty -= 1;
            else delete newState[productId];
            return newState;
        });
    };

    const calculateTotal = () => Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleCheckout = () => {
        if (Object.keys(cart).length === 0) return alert("Cart is empty!");
        const cartItemsForPayment = Object.entries(cart).map(([pid, details]) => ({
            id: parseInt(pid),
            quantity: details.qty,
            price: details.price,
            name: details.name
        }));
        navigate('/payment', { 
            state: { cartItems: cartItemsForPayment, totalAmount: calculateTotal(), retailerId: shopId } 
        });
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    <h1 className="text-xl font-bold">LiveMART Customer</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/customer/orders" className="hover:underline font-medium">My Orders</Link>
                    <span>Hello, {user.name}</span>
                    <button onClick={logout} className="flex items-center gap-1 bg-blue-800 px-3 py-1 rounded-lg">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Browser */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* 📍 LOCATION MODULE (New Feature) */}
                    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
                       <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                <Navigation className="text-blue-600" /> Nearby Shops
                            </h2>
    
                        {/* Only show this button if location is missing */}
                        {!userLocation && (
                            <button 
                                onClick={simulateLocation}
                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-600 border border-gray-300"
                            >
                                📍 Demo: Force Location
                            </button>
                        )}
                    </div>
                        {!userLocation ? (
                            <p className="text-sm text-gray-500">📍 Please allow location access to see nearest stores.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {nearbyShops.map(shop => (
                                    <div 
                                        key={shop.id} 
                                        onClick={() => { setShopId(shop.id.toString()); fetchShop(); }}
                                        className={`p-3 border rounded cursor-pointer transition ${shopId === shop.id.toString() ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sm">{shop.name}</h3>
                                            <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                                {shop.distance} km
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Click to Visit</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Shop Search Manual */}
                    <div className="bg-white p-4 rounded-xl shadow flex gap-2 items-center">
                        <Store className="text-gray-400" />
                        <input 
                            type="number" value={shopId} onChange={(e) => setShopId(e.target.value)}
                            className="border rounded p-2 flex-grow outline-none" placeholder="Or Enter Retailer ID manually"
                        />
                        <button onClick={fetchShop} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Visit
                        </button>
                    </div>

                    {/* Inventory Grid */}
                    {loading ? <p className="text-center py-10">Loading...</p> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {inventory.length === 0 ? (
                                <p className="col-span-2 text-center text-gray-500 py-10">No items found in this shop.</p>
                            ) : (
                                inventory.map((item) => (
                                    <div key={item.inventoryId} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between border">
                                        <div className="flex gap-4">
                                            <img src={item.product.image || 'https://via.placeholder.com/100'} alt={item.product.name} className="w-20 h-20 object-cover rounded bg-gray-200" />
                                            <div>
                                                <h3 className="font-bold text-gray-800">{item.product.name}</h3>
                                                <p className="text-sm text-gray-500">{item.product.category}</p>
                                                <p className={`text-xs mt-1 font-bold ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-end">
                                            <span className="text-xl font-bold text-blue-700">₹{item.price}</span>
                                            <button onClick={() => addToCart(item)} disabled={item.stock === 0} className="bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
                                                <Plus className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Cart */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24 border">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-4">
                            <ShoppingCart className="text-blue-600" /> Cart
                        </h2>
                        {Object.keys(cart).length === 0 ? (
                            <p className="text-gray-400 text-center py-4">Cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(cart).map(([pid, item]) => (
                                    <div key={pid} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <div>
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">₹{item.price} x {item.qty}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => removeFromCart(pid)} className="text-red-500"><Minus className="w-4 h-4"/></button>
                                            <span className="text-sm font-bold">{item.qty}</span>
                                            <button onClick={() => addToCart({product: {id: pid}, price: item.price, stock: 999})} className="text-green-600"><Plus className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between font-bold text-lg mb-4">
                                        <span>Total</span><span>₹{calculateTotal()}</span>
                                    </div>
                                    <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
                                        <CreditCard className="w-5 h-5" /> Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;