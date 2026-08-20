import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const emptyForm = {
    offerName: '',
    description: '',
    scope: 'all',
    targetId: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
};

const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const fetchProducts = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.data || []);
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.data || []);
    };

    const fetchOffers = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/offers`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setOffers(res.data.data || []);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([fetchCategories(), fetchProducts(), fetchOffers()]);
            } catch (error) {
                console.error('Failed to load offers page:', error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const payload = {
                offerName: form.offerName,
                description: form.description,
                scope: form.scope,
                targetId: form.scope === 'all' ? null : form.targetId,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                startDate: form.startDate,
                endDate: form.endDate,
                isActive: form.isActive,
            };

            if (form.scope !== 'all' && !form.targetId) {
                throw new Error('Please select a product or category for this offer');
            }

            const endpoint = editingId
                ? `${API_URL}/api/admin/offers/${editingId}`
                : `${API_URL}/api/admin/offers`;
            const method = editingId ? 'patch' : 'post';

            const res = await axios({
                method,
                url: endpoint,
                data: payload,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage(editingId ? 'Offer updated successfully' : 'Offer added successfully');
                resetForm();
                await fetchOffers();
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Failed to save offer';
            setMessage(errMsg);
            console.error('Offer save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOffer = async (offerId) => {
        const confirmed = window.confirm('આ offer delete કરવું છે?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.delete(`${API_URL}/api/admin/offers/${offerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage('Offer deleted successfully');
                await fetchOffers();
            }
        } catch (error) {
            console.error('Delete offer failed:', error);
            setMessage(error.response?.data?.message || 'Failed to delete offer');
        }
    };

    const handleEditOffer = (offer) => {
        setEditingId(offer._id);
        setForm({
            offerName: offer.title || '',
            description: offer.description || '',
            scope: offer.scope || 'all',
            targetId: offer.targetId?._id || offer.targetId || '',
            discountType: offer.type || 'percentage',
            discountValue: offer.value || 0,
            startDate: formatDateForInput(offer.startDate),
            endDate: formatDateForInput(offer.endDate),
            isActive: typeof offer.isActive === 'boolean' ? offer.isActive : true,
        });
        setShowForm(true);
    };

    const renderDiscountValue = (offer) => {
        if (offer.type === 'flat') {
            return `₹${Number(offer.value || 0)}`;
        }
        return `${Number(offer.value || 0)}%`;
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Offers</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Campaign deals and promotional discounts.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setShowForm((prev) => !prev);
                        if (showForm) resetForm();
                    }}
                    className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
                >
                    {showForm ? 'Close' : '+ Add Offer'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Offer Name</label>
                            <input
                                name="offerName"
                                value={form.offerName}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Discount Type</label>
                            <select
                                name="discountType"
                                value={form.discountType}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Discount Value</label>
                            <input
                                type="number"
                                name="discountValue"
                                value={form.discountValue}
                                onChange={handleChange}
                                min="0"
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Applies To</label>
                            <select
                                name="scope"
                                value={form.scope}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                            >
                                <option value="all">All Products</option>
                                <option value="product">Specific Product</option>
                                <option value="category">Specific Category</option>
                            </select>
                        </div>

                        {form.scope !== 'all' && (
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                                    {form.scope === 'product' ? 'Select Product' : 'Select Category'}
                                </label>
                                <select
                                    name="targetId"
                                    value={form.targetId}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                    required={form.scope !== 'all'}
                                >
                                    <option value="">Choose one</option>
                                    {(form.scope === 'product' ? products : categories).map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name || item.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm md:col-span-2">
                            <input id="offerActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            <label htmlFor="offerActive">Active</label>
                        </div>
                    </div>

                    {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}

                    <div className="mt-4 flex gap-3">
                        <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Save Offer' : 'Add Offer'}
                        </button>
                        <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Loading offers...
                </div>
            ) : !offers.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    No offers found.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {offers.map((offer) => (
                        <div key={offer._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{offer.title || 'Offer'}</h3>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${offer.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200'}`}>
                                    {offer.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <div><span className="font-medium">Target:</span> {offer.scope === 'all' ? 'All products' : offer.scope === 'product' ? 'Product' : 'Category'}</div>
                                <div><span className="font-medium">Discount:</span> {renderDiscountValue(offer)}</div>
                                <div><span className="font-medium">Period:</span> {formatDateForInput(offer.startDate)} to {formatDateForInput(offer.endDate)}</div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditOffer(offer)}
                                    className="rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteOffer(offer._id)}
                                    className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OffersPage;
