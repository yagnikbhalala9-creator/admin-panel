import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const emptyForm = {
    name: '',
    phone: '',
    email: '',
    isActive: true,
};

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(emptyForm);

    const fetchCustomers = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/customers`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(res.data.data || []);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    useEffect(() => {
        fetchCustomers()
            .catch((err) => console.error('Load customers failed:', err))
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
            const res = await axios.patch(`${API_URL}/api/admin/customers/${editingId}`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage('Customer updated successfully');
                resetForm();
                await fetchCustomers();
            }
        } catch (error) {
            console.error('Update customer failed:', error);
            setMessage(error.response?.data?.message || 'Failed to update customer');
        } finally {
            setSaving(false);
        }
    };

    const handleEditCustomer = (customer) => {
        setEditingId(customer._id);
        setForm({
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            isActive: typeof customer.isActive === 'boolean' ? customer.isActive : true,
        });
        setShowForm(true);
    };

    const handleDeleteCustomer = async (customerId) => {
        const confirmed = window.confirm('આ customer delete કરવું છે?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.delete(`${API_URL}/api/admin/customers/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage('Customer deleted successfully');
                await fetchCustomers();
            }
        } catch (error) {
            console.error('Delete customer failed:', error);
            setMessage(error.response?.data?.message || 'Failed to delete customer');
        }
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Customer Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track loyalty, purchase value, and account health.</p>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" />
                        </div>
                        <div className="flex items-center gap-2 text-sm md:col-span-2">
                            <input id="customerActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            <label htmlFor="customerActive">Active</label>
                        </div>
                    </div>

                    {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}

                    <div className="mt-4 flex gap-3">
                        <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save Customer'}
                        </button>
                        <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Customer</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Phone</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">Loading customers...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No customers found.</td></tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{customer.phone}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{customer.email || '—'}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${customer.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-200'}`}>{customer.isActive ? 'Active' : 'Blocked'}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => handleEditCustomer(customer)} className="rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300">Edit</button>
                                            <button type="button" onClick={() => handleDeleteCustomer(customer._id)} className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersPage;
