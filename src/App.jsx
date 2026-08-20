import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import VideosPage from './pages/VideosPage';
import BannersPage from './pages/BannersPage';
import OffersPage from './pages/OffersPage';
import PaymentsPage from './pages/PaymentsPage';
import OrdersPage from './pages/OrdersPage';
import PackingSummaryPage from './pages/PackingSummaryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/banners" element={<BannersPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/packing-summary" element={<PackingSummaryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;
