import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const categoryColors = {
    milk: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/30',
    curd: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-200 dark:ring-yellow-500/30',
    ghee: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30',
    paneer: 'bg-pink-100 text-pink-700 ring-1 ring-pink-200 dark:bg-pink-500/15 dark:text-pink-200 dark:ring-pink-500/30',
    cheese: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-500/30',
    butter: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-500/15 dark:text-purple-200 dark:ring-purple-500/30',
    default: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-600/30 dark:text-slate-200 dark:ring-slate-500/30',
};

const emptyForm = {
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true,
};

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(emptyForm);

    const fetchCategories = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.data || []);
    };

    useEffect(() => {
        fetchCategories()
            .catch((err) => console.error('Fetch categories failed:', err))
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
            const response = await axios.post(`${API_URL}/api/admin/categories`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setMessage('Category added successfully');
                setForm(emptyForm);
                setShowForm(false);
                await fetchCategories();
            }
        } catch (error) {
            console.error('Create category failed:', error);
            setMessage(error.response?.data?.message || 'Failed to add category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage product categories and display order</p>
                </div>
                <button
                    onClick={() => setShowForm((prev) => !prev)}
                    className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white shadow-soft hover:bg-brand-600"
                >
                    {showForm ? 'Close' : '+ Add Category'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Category Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Display Order</label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={form.displayOrder}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
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

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Image URL</label>
                            <input
                                name="image"
                                value={form.image}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                                placeholder="https://example.com/category.jpg"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm md:col-span-2">
                            <input id="categoryActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            <label htmlFor="categoryActive">Active</label>
                        </div>
                    </div>

                    {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}

                    <div className="mt-4 flex gap-3">
                        <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save Category'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Slug</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Display Order</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                                    Loading categories...
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => {
                                const categoryKey = String(category.name || '').toLowerCase();
                                const paletteClass = categoryColors[categoryKey] || categoryColors.default;
                                return (
                                    <tr key={category._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paletteClass}`}>
                                                {category.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{category.slug}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{category.displayOrder ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${category.isActive ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/30' : 'bg-slate-500/15 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-200 dark:ring-slate-500/30'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesPage;
