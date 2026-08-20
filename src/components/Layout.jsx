import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', path: '/dashboard', accent: 'blue' },
    { label: 'Orders', path: '/orders', accent: 'orange' },
    { label: 'Products', path: '/products', accent: 'green' },
    { label: 'Categories', path: '/categories', accent: 'purple' },
    { label: 'Customers', path: '/customers', accent: 'pink' },
    { label: 'Videos', path: '/videos', accent: 'indigo' },
    { label: 'Banners', path: '/banners', accent: 'cyan' },
    { label: 'Offers', path: '/offers', accent: 'amber' },
    { label: 'Payments', path: '/payments', accent: 'teal' },
    { label: 'Packing Summary', path: '/packing-summary', accent: 'emerald' },
    { label: 'Reports', path: '/reports', accent: 'violet' },
    { label: 'Settings', path: '/settings', accent: 'slate' },
];

const accentClasses = {
    blue: 'text-blue-500',
    orange: 'text-orange-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    indigo: 'text-indigo-500',
    cyan: 'text-cyan-500',
    amber: 'text-amber-500',
    teal: 'text-teal-500',
    emerald: 'text-emerald-500',
    violet: 'text-violet-500',
    slate: 'text-slate-500',
};

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('milkDairyTheme') || 'dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('milkDairyTheme', theme);
    }, [theme]);

    return (
        <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
            <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
        </button>
    );
};

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
            <div className="flex min-h-screen">
                <aside className="w-72 border-r border-slate-300 bg-slate-200/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
                    <div className="mb-8 flex items-center justify-between px-2">
                        <div>
                            <h1 className="text-xl font-bold">Milk Dairy</h1>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Admin Panel</p>
                        </div>
                        <ThemeToggle />
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
                                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 ring-1 ring-brand-300'
                                        : 'text-slate-700 hover:bg-slate-300/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <div className="flex items-center gap-3">
                                        <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white' : `bg-current ${accentClasses[item.accent]}`}`} />
                                        <span>{item.label}</span>
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center justify-end border-b border-slate-200 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
                        <ThemeToggle />
                    </div>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
