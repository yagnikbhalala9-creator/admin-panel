const barData = [
    { label: 'Jan', value: 42, color: 'bg-brand-500' },
    { label: 'Feb', value: 58, color: 'bg-blue-500' },
    { label: 'Mar', value: 66, color: 'bg-violet-500' },
    { label: 'Apr', value: 74, color: 'bg-amber-500' },
    { label: 'May', value: 81, color: 'bg-emerald-500' },
];

const ReportsPage = () => (
    <div className="p-8 text-slate-900 transition-colors dark:text-white">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sales trends and operational analytics.</p>
            </div>
            <div className="flex gap-2">
                <button className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600">Excel</button>
                <button className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600">PDF</button>
                <button className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600">CSV</button>
            </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-4 text-lg font-semibold">Monthly Sales</h2>
                <div className="flex h-52 items-end gap-3">
                    {barData.map((item) => (
                        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                            <div className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-blue-400" style={{ height: `${item.value}%` }} />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-4 text-lg font-semibold">Performance Metrics</h2>
                <div className="space-y-4">
                    {[
                        { label: 'Revenue', value: '₹84.3K', color: 'bg-brand-500' },
                        { label: 'Orders', value: '1,420', color: 'bg-violet-500' },
                        { label: 'Returns', value: '2.1%', color: 'bg-amber-500' },
                        { label: 'Repeat Buyers', value: '46%', color: 'bg-emerald-500' },
                    ].map((metric) => (
                        <div key={metric.label}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-300">{metric.label}</span>
                                <span className="font-semibold">{metric.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                                <div className={`h-2 rounded-full ${metric.color}`} style={{ width: metric.label === 'Revenue' ? '78%' : metric.label === 'Orders' ? '66%' : metric.label === 'Returns' ? '18%' : '46%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default ReportsPage;
