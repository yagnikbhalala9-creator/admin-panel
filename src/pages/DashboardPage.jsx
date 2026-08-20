import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        axios
            .get(`${API_URL}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setStats(res.data.data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-slate-700 dark:text-white">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
            <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} accent="blue" icon="◌" />
                <StatCard title="Pending Orders" value={stats?.pendingOrders ?? 0} accent="amber" icon="•" />
                <StatCard title="Completed Orders" value={stats?.completedOrders ?? 0} accent="green" icon="✓" />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="Customers" value={stats?.totalCustomers ?? 0} accent="purple" icon="◎" />
                <StatCard title="Cancelled" value={stats?.cancelledOrders ?? 0} accent="red" icon="!" />
                <StatCard title="Sales" value={`₹${stats?.totalSales ?? 0}`} accent="teal" icon="₹" />
            </div>
        </div>
    );
};

const accentMap = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    purple: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200',
    red: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
    teal: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200',
};

const StatCard = ({ title, value, accent, icon }) => (
    <div className={`rounded-2xl border p-5 shadow-soft ${accentMap[accent] || accentMap.blue}`}>
        <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-lg font-bold shadow-sm dark:bg-slate-900/40">{icon}</span>
        </div>
        <h3 className="text-3xl font-extrabold tracking-tight">{value}</h3>
    </div>
);

export default DashboardPage;
