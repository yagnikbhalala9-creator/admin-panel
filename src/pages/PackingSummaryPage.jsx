import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const todayString = () => new Date().toISOString().slice(0, 10);

const PackingSummaryPage = () => {
    const [rangeType, setRangeType] = useState('today');
    const [fromDate, setFromDate] = useState(todayString());
    const [toDate, setToDate] = useState(todayString());
    const [includeDelivered, setIncludeDelivered] = useState(false);
    const [data, setData] = useState({ rows: [], grandTotal: 0, categoryTotals: {} });
    const [loading, setLoading] = useState(true);

    const queryString = useMemo(() => {
        const from = rangeType === 'custom' ? fromDate : (rangeType === 'tomorrow' ? new Date(Date.now() + 86400000).toISOString().slice(0, 10) : todayString());
        const to = rangeType === 'custom' ? toDate : from;
        return `?from=${from}&to=${to}&includeDelivered=${includeDelivered}`;
    }, [rangeType, fromDate, toDate, includeDelivered]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        setLoading(true);
        axios
            .get(`${API_URL}/api/admin/packing-summary${queryString}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setData(res.data.data || { rows: [], grandTotal: 0, categoryTotals: {} }))
            .catch((err) => console.error('Packing summary failed:', err))
            .finally(() => setLoading(false));
    }, [queryString]);

    const printReport = () => {
        window.print();
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Packing Summary</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Daily production and packing plan</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={printReport} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
                        Print / Export
                    </button>
                </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                    {['today', 'tomorrow', 'custom'].map((option) => (
                        <button
                            key={option}
                            onClick={() => setRangeType(option)}
                            className={`rounded-xl px-3 py-2 text-sm font-medium ${rangeType === option ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}`}
                        >
                            {option === 'today' ? 'Today' : option === 'tomorrow' ? 'Tomorrow' : 'Custom Range'}
                        </button>
                    ))}

                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input type="checkbox" checked={includeDelivered} onChange={(e) => setIncludeDelivered(e.target.checked)} />
                        Include Delivered
                    </label>
                </div>

                {rangeType === 'custom' && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-300">From</label>
                            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-300">To</label>
                            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2" />
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800">
                {loading ? (
                    <div className="p-6 text-slate-400">Loading packing summary...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-100 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Product</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Size</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Total Quantity</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Total Orders</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {data.rows.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No packing data for this range</td>
                                        </tr>
                                    ) : (
                                        data.rows.map((row, idx) => (
                                            <tr key={`${row.product}-${row.size}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="px-4 py-3 font-medium">{row.product}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.size}</td>
                                                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{row.totalQuantity} packets</td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{row.totalOrders}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-brand-50 dark:bg-brand-500/10">
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Grand Total</td>
                                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">—</td>
                                        <td className="px-4 py-3 font-bold text-brand-700 dark:text-brand-300">{data.grandTotal} packets</td>
                                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">—</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {Object.keys(data.categoryTotals || {}).length > 0 && (
                            <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                                <h3 className="mb-3 text-lg font-semibold">Category-wise Summary</h3>
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {Object.entries(data.categoryTotals).map(([category, total]) => (
                                        <div key={category} className="rounded-xl border border-brand-100 bg-brand-50 p-3 dark:border-brand-500/20 dark:bg-brand-500/10">
                                            <p className="text-sm text-slate-500 dark:text-slate-300">{category}</p>
                                            <p className="mt-1 text-xl font-bold text-brand-700 dark:text-brand-300">{total} packets</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PackingSummaryPage;
