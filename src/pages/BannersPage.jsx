import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const emptyForm = {
    title: '',
    image: '',
    linkType: 'none',
    linkTarget: '',
    startDate: '',
    endDate: '',
    displayOrder: 0,
    isActive: true,
};

const BannersPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(emptyForm);

    const fetchBanners = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/banners`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setBanners(res.data.data || []);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    useEffect(() => {
        fetchBanners()
            .catch((err) => console.error('Fetch banners failed:', err))
            .finally(() => setLoading(false));
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
            const endpoint = editingId ? `${API_URL}/api/admin/banners/${editingId}` : `${API_URL}/api/admin/banners`;
            const method = editingId ? 'patch' : 'post';
            const res = await axios({
                method,
                url: endpoint,
                data: form,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage(editingId ? 'Banner updated successfully' : 'Banner added successfully');
                resetForm();
                await fetchBanners();
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to save banner');
            console.error('Banner save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditBanner = (banner) => {
        setEditingId(banner._id);
        setForm({
            title: banner.title || '',
            image: banner.image || '',
            linkType: banner.linkType || 'none',
            linkTarget: banner.linkTarget || '',
            startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 10) : '',
            endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 10) : '',
            displayOrder: banner.displayOrder ?? 0,
            isActive: typeof banner.isActive === 'boolean' ? banner.isActive : true,
        });
        setShowForm(true);
    };

    const handleDeleteBanner = async (bannerId) => {
        const confirmed = window.confirm('આ banner delete કરવું છે?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.delete(`${API_URL}/api/admin/banners/${bannerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage('Banner deleted successfully');
                await fetchBanners();
            }
        } catch (error) {
            console.error('Banner delete failed:', error);
            setMessage(error.response?.data?.message || 'Failed to delete banner');
        }
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Banners</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Promotional banners and hero campaigns.</p>
                </div>
                <button type="button" onClick={() => (showForm ? resetForm() : setShowForm(true))} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">{showForm ? 'Close' : '+ Add Banner'}</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Title</label>
                            <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Display Order</label>
                            <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Image URL</label>
                            <input name="image" value={form.image} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Link Type</label>
                            <select name="linkType" value={form.linkType} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20">
                                <option value="none">None</option>
                                <option value="product">Product</option>
                                <option value="category">Category</option>
                                <option value="external">External</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Link Target</label>
                            <input name="linkTarget" value={form.linkTarget} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" placeholder="/products or https://" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Start Date</label>
                            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">End Date</label>
                            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" />
                        </div>
                        <div className="flex items-center gap-2 text-sm md:col-span-2">
                            <input id="bannerActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            <label htmlFor="bannerActive">Active</label>
                        </div>
                    </div>

                    {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}

                    <div className="mt-4 flex gap-3">
                        <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Save Banner' : 'Add Banner'}
                        </button>
                        <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-slate-500 dark:text-slate-400">Loading banners...</div>
                ) : banners.length === 0 ? (
                    <div className="col-span-full text-slate-500 dark:text-slate-400">No banners found.</div>
                ) : (
                    banners.map((banner) => (
                        <div key={banner._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                            <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-brand-500 via-cyan-500 to-violet-500" style={{ backgroundImage: banner.image ? `url(${banner.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold">{banner.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'No start date'} to {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'No end date'}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${banner.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200'}`}>
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">{banner.linkType || 'none'}</span>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleEditBanner(banner)} className="rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300">Edit</button>
                                    <button type="button" onClick={() => handleDeleteBanner(banner._id)} className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BannersPage;
