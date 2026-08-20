import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = () => {
    const [form, setForm] = useState({ email: 'admin@milkdairy.com', password: 'Admin@123' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/api/auth/admin/login`, form);
            localStorage.setItem('adminToken', response.data.token);
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Admin login failed:', {
                url: `${API_URL}/api/auth/admin/login`,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            setMessage(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 dark:bg-slate-900">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <h1 className="mb-2 text-2xl font-bold text-brand-600 dark:text-brand-400">Milk Dairy Admin</h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Sign in to manage products, orders and customers</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                        />
                    </div>

                    {message && <p className="text-sm text-red-600 dark:text-red-300">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
