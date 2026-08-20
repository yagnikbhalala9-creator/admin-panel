const banners = [
    { title: 'Summer Offer', active: true, label: 'Fresh', date: '12 Aug 2026' },
    { title: 'Weekend Combo', active: false, label: 'Featured', date: '14 Aug 2026' },
    { title: 'Home Delivery', active: true, label: 'Delivery', date: '20 Aug 2026' },
];

const BannersPage = () => (
    <div className="p-8 text-slate-900 transition-colors dark:text-white">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Banners</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Promotional banners and hero campaigns.</p>
            </div>
            <button className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">+ Add Banner</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {banners.map((banner) => (
                <div key={banner.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-brand-500 via-cyan-500 to-violet-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold">{banner.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{banner.date}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${banner.active ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200'}`}>
                            {banner.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">{banner.label}</span>
                        <div className="flex gap-2">
                            <button className="rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300">Edit</button>
                            <button className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300">Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default BannersPage;
