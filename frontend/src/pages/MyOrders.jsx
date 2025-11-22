import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders, addFeedback } from '../utils/api';
import { Package, Star, MessageSquare, X } from 'lucide-react';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State for Feedback
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await getCustomerOrders(user.id);
            // Sort orders by newest first (assuming Order ID increments)
            const sorted = res.data.sort((a, b) => b.orderId - a.orderId);
            setOrders(sorted);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const openFeedbackModal = (orderId, item) => {
        setSelectedItem({ ...item, orderId });
        setRating(5);
        setComment('');
        setShowModal(true);
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        try {
            const payload = {
                customerId: user.id,
                // FIXED: Changed .productId to .id (Matches your Java Entity)
                productId: selectedItem.product.id, 
                orderId: selectedItem.orderId,
                rating: parseInt(rating),
                comment: comment
            };

            await addFeedback(payload);
            alert("Feedback submitted! Thank you. ⭐");
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert("Failed to submit feedback: " + (err.response?.data || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Package className="text-blue-600" /> My Orders
                </h1>

                {loading ? (
                    <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                        You haven't placed any orders yet.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                                {/* Order Header */}
                                <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-b">
                                    <div>
                                        <span className="font-bold text-gray-700">Order #{order.orderId}</span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            • Total: ₹{order.totalAmount}
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                                        {order.orderStatus || 'Placed'}
                                    </span>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-gray-200 w-12 h-12 rounded flex items-center justify-center text-gray-400 text-xs">
                                                    Img
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.product.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Qty: {item.quantity} | Price: ₹{item.priceAtPurchase}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => openFeedbackModal(order.orderId, item)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
                                            >
                                                <Star className="w-4 h-4" /> Rate Item
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="text-blue-600" /> Write Review
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Reviewing: <span className="font-bold text-gray-800">{selectedItem?.product.name}</span>
                        </p>

                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-2xl focus:outline-none transition transform hover:scale-110 ${
                                                star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                <textarea 
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or dislike?"
                                    required
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
                            >
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;