import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const PaymentsPage = () => {
    const [customers, setCustomers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        axios
            .get(`${API_URL}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const data = Array.isArray(res.data.data?.customers) ? res.data.data.customers : [];
                setCustomers(data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = customers.filter((customer) => {
        const matchesSearch = (
            customer.name?.toLowerCase().includes(search.toLowerCase()) ||
            customer.phone?.includes(search)
        );

        const pending = Number(customer.pendingAmount || 0);
        const isPendingOnly = pending > 0;
        const isFullyPaid = pending === 0;

        const matchesFilter =
            filter === 'all' ||
            (filter === 'pending' && isPendingOnly) ||
            (filter === 'paid' && isFullyPaid);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Payments</h1>
            </div>

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'All', tone: 'slate' },
                        { id: 'pending', label: 'Pending', tone: 'red' },
                        { id: 'paid', label: 'Settled', tone: 'green' },
                    ].map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setFilter(option.id)}
                            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${filter === option.id
                                ? option.tone === 'red' ? 'bg-red-500 text-white shadow-sm' : option.tone === 'green' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-700 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or mobile"
                    className="w-full max-w-md rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Customer</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Mobile</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Billed</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Paid</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Pending</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">Loading payment summary...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No payment records</td>
                            </tr>
                        ) : (
                            filtered.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{customer.phone}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">₹{Number(customer.totalBilled || 0)}</td>
                                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">₹{Number(customer.totalPaid || 0)}</td>
                                    <td className={`px-4 py-3 font-semibold ${Number(customer.pendingAmount || 0) > 0 ? 'text-red-600 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                        ₹{Number(customer.pendingAmount || 0)}
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

export default PaymentsPage;
