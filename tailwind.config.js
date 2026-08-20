/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#0EA5E9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    DEFAULT: '#0EA5E9'
                },
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#22C55E',
                    600: '#16a34a',
                    DEFAULT: '#22C55E'
                },
                warning: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    500: '#F59E0B',
                    600: '#d97706',
                    DEFAULT: '#F59E0B'
                },
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    500: '#EF4444',
                    600: '#dc2626',
                    DEFAULT: '#EF4444'
                },
                info: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3B82F6',
                    600: '#2563eb',
                    DEFAULT: '#3B82F6'
                },
                premium: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    500: '#A855F7',
                    600: '#9333ea',
                    DEFAULT: '#A855F7'
                },
                neutral: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    DEFAULT: '#0F172A'
                },
                milk: { 50: '#eff6ff', 500: '#3b82f6', DEFAULT: '#3b82f6' },
                curd: { 50: '#fefce8', 500: '#facc15', DEFAULT: '#facc15' },
                ghee: { 50: '#fff7ed', 500: '#f59e0b', DEFAULT: '#f59e0b' },
                paneer: { 50: '#fdf2f8', 500: '#ec4899', DEFAULT: '#ec4899' },
                cheese: { 50: '#fff7ed', 500: '#f97316', DEFAULT: '#f97316' },
                butter: { 50: '#faf5ff', 500: '#a855f7', DEFAULT: '#a855f7' },
            },
            boxShadow: {
                soft: '0 10px 25px -12px rgba(15, 23, 42, 0.35)',
            },
            borderRadius: {
                panel: '1rem',
            },
        },
    },
    plugins: [],
};
