const customerRows = [
    { name: 'Nisha Patel', phone: '+91 98765 43210', status: 'Active', total: '₹12,480', plan: 'Gold' },
    { name: 'Kiran Shah', phone: '+91 99887 66554', status: 'Blocked', total: '₹8,240', plan: 'Standard' },
    { name: 'Mehul Joshi', phone: '+91 91234 56789', status: 'Active', total: '₹18,970', plan: 'Premium' },
];

const CustomersPage = () => (
    <div className="p-8 text-slate-900 transition-colors dark:text-white">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Customer Management</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Track loyalty, purchase value, and account health.</p>
            </div>
            <button className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">+ Add Customer</button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Total Customers" value="2,540" tone="purple" />
            <StatCard label="Active Accounts" value="2,184" tone="green" />
            <StatCard label="Blocked" value="128" tone="red" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Plan</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Total Purchase</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {customerRows.map((customer) => (
                        <tr key={customer.phone} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="px-4 py-3 font-medium">{customer.name}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{customer.phone}</td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${customer.status === 'Active' ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-200'}`}>
                                    {customer.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{customer.plan}</td>
                            <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-300">{customer.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const StatCard = ({ label, value, tone }) => {
    const map = {
        purple: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200',
        green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
        red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
    };

    return (
        <div className={`rounded-2xl border p-5 shadow-soft ${map[tone]}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <h3 className="mt-3 text-3xl font-extrabold">{value}</h3>
        </div>
    );
};

export default CustomersPage;
