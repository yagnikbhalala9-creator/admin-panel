import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusColors = {
    placed: 'bg-blue-500/15 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:ring-blue-500/30',
    confirmed: 'bg-violet-500/15 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-500/30',
    preparing: 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-500/30',
    out_for_delivery: 'bg-yellow-500/15 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:ring-yellow-500/30',
    modified: 'bg-cyan-500/15 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-200 dark:ring-cyan-500/30',
    delivered: 'bg-green-500/15 text-green-700 ring-1 ring-green-200 dark:bg-green-500/20 dark:text-green-200 dark:ring-green-500/30',
    cancelled: 'bg-red-500/15 text-red-700 ring-1 ring-red-200 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-500/30',
    rejected: 'bg-red-700/15 text-red-700 ring-1 ring-red-300 dark:bg-red-700/20 dark:text-red-100 dark:ring-red-500/30',
};

const paymentColors = {
    paid: 'bg-green-500/15 text-green-700 ring-1 ring-green-200 dark:bg-green-500/20 dark:text-green-200 dark:ring-green-500/30',
    pending: 'bg-red-500/15 text-red-700 ring-1 ring-red-200 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-500/30',
    partial: 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-500/30',
    failed: 'bg-slate-500/15 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-200 dark:ring-slate-500/30',
};

const statusBorder = {
    placed: 'border-l-blue-500',
    confirmed: 'border-l-violet-500',
    preparing: 'border-l-amber-500',
    out_for_delivery: 'border-l-yellow-500',
    modified: 'border-l-cyan-500',
    delivered: 'border-l-green-500',
    cancelled: 'border-l-red-500',
    rejected: 'border-l-red-700',
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fetchOrders = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.data || []);
        if (res.data.data?.[0]) setSelectedOrder(res.data.data[0]);
    };

    useEffect(() => {
        fetchOrders()
            .catch((err) => console.error('Load orders failed:', err))
            .finally(() => setLoading(false));
    }, []);

    const canEdit = (order) => ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'modified'].includes(order.orderStatus);

    const handleSaveOrder = async () => {
        if (!selectedOrder) return;
        setSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const payload = {
                items: selectedOrder.items.map((item) => ({
                    product: item.product?._id || item.product,
                    selectedSize: item.selectedSize,
                    quantity: Number(item.quantity || 1),
                    unitPrice: Number(item.unitPrice || 0),
                    discount: Number(item.discount || 0),
                })),
                deliveryCharge: Number(selectedOrder.deliveryCharge || 0),
                packingCharge: Number(selectedOrder.packingCharge || 0),
                discountAmount: Number(selectedOrder.discountAmount || 0),
                orderStatus: selectedOrder.orderStatus,
                notes: selectedOrder.notes,
            };

            const res = await axios.patch(`${API_URL}/api/admin/orders/${selectedOrder._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedOrder(res.data.data);
            setEditing(false);
            setMessage('Order updated successfully');
            await fetchOrders();
        } catch (error) {
            console.error('Order update failed:', error);
            setMessage(error.response?.data?.message || 'Failed to update order');
        } finally {
            setSaving(false);
        }
    };

    const updateItemQuantity = (index, value) => {
        setSelectedOrder((prev) => {
            if (!prev) return prev;
            const nextItems = [...prev.items];
            nextItems[index] = {
                ...nextItems[index],
                quantity: Math.max(1, Number(value || 1)),
            };
            return { ...prev, items: nextItems };
        });
    };

    const removeItem = (index) => {
        setSelectedOrder((prev) => {
            if (!prev) return prev;
            return { ...prev, items: prev.items.filter((_, i) => i !== index) };
        });
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Order Management</h1>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-xl font-semibold">Orders</h2>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-slate-500 dark:text-slate-400">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">No orders found</p>
                        ) : (
                            orders.map((order) => (
                                <button
                                    key={order._id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`w-full rounded-xl border border-l-4 p-3 text-left ${statusBorder[order.orderStatus] || 'border-l-slate-400'} ${selectedOrder?._id === order._id ? 'border-slate-300 bg-cyan-50 shadow-sm dark:border-slate-600 dark:bg-slate-700' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{order.orderNumber}</span>
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.orderStatus] || 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">{order.user?.name || 'Customer'}</span>
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${paymentColors[order.paymentStatus] || 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200'}`}>
                                            {order.paymentStatus || 'pending'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">₹{order.totalAmount}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    {selectedOrder ? (
                        <>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedOrder.orderNumber}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedOrder.user?.name || 'Customer'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[selectedOrder.orderStatus] || 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200'}`}>
                                        {selectedOrder.orderStatus}
                                    </span>
                                    <button
                                        disabled={!canEdit(selectedOrder)}
                                        onClick={() => setEditing((prev) => !prev)}
                                        className={`rounded-lg px-3 py-2 text-sm ${canEdit(selectedOrder) ? 'bg-cyan-500 text-white hover:bg-cyan-400' : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-300'}`}
                                    >
                                        {editing ? 'Cancel Edit' : 'Edit Order'}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-5 grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                                    <p className="mt-1 font-medium">{selectedOrder.orderStatus}</p>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                                    <p className="mt-1 font-medium">₹{selectedOrder.totalAmount}</p>
                                </div>
                            </div>

                            {!editing ? (
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={`${item.product?._id || item.product}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">{item.product?.name || 'Product'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.selectedSize}</p>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={`${item.product?._id || item.product}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="font-medium">{item.product?.name || 'Product'}</p>
                                                <button onClick={() => removeItem(idx)} className="text-xs text-red-500">Remove</button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm text-slate-600 dark:text-slate-300">Qty</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItemQuantity(idx, e.target.value)}
                                                    className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Delivery Charge</label>
                                                <input
                                                    type="number"
                                                    value={selectedOrder.deliveryCharge || 0}
                                                    onChange={(e) => setSelectedOrder((prev) => ({ ...prev, deliveryCharge: Number(e.target.value) }))}
                                                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Discount Amount</label>
                                                <input
                                                    type="number"
                                                    value={selectedOrder.discountAmount || 0}
                                                    onChange={(e) => setSelectedOrder((prev) => ({ ...prev, discountAmount: Number(e.target.value) }))}
                                                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveOrder}
                                        disabled={saving}
                                        className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-white hover:bg-cyan-400 disabled:opacity-60"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {message && <p className="mt-4 text-sm text-cyan-600 dark:text-cyan-300">{message}</p>}
                        </>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">Select an order</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
