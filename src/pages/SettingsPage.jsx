import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLE_PERMISSIONS = {
    super_admin: ['all'],
    order_manager: ['orders:view', 'orders:edit', 'customers:view', 'notifications:send'],
    product_manager: ['products:view', 'products:edit', 'categories:view', 'products:manage'],
    delivery_manager: ['orders:view', 'delivery:manage', 'customers:view'],
};

const TABS = [
    'General',
    'App',
    'Delivery',
    'Payment',
    'Notifications',
    'Legal',
    'Tax',
    'Admins',
    'Backup',
];

const defaultSettings = {
    companyName: 'Milk Dairy',
    companyLogo: '',
    contactNumber: '',
    whatsappNumber: '',
    email: 'hello@milkdairy.in',
    address: '',
    appVersion: { android: '1.0.0', ios: '1.0.0' },
    maintenanceMode: false,
    pushNotificationsEnabled: true,
    deliveryCharge: 30,
    freeDeliveryMinimum: 499,
    minimumOrderAmount: 99,
    deliveryAreas: ['Bengaluru', 'Hyderabad'],
    deliveryTimeSlots: ['6 AM - 9 AM', '5 PM - 7 PM'],
    paymentSettings: {
        codEnabled: true,
        upiEnabled: false,
        upiId: '',
        onlineGatewayEnabled: false,
        apiKey: '',
        apiSecret: '',
    },
    notificationTemplates: {
        orderConfirmation: 'Your order has been confirmed. We will keep you updated on the delivery status.',
        orderStatusUpdate: 'Your order status has been updated. Please check the app for the latest update.',
        newOffer: 'New offers are live! Visit the app to enjoy fresh dairy deals today.',
    },
    legalPolicies: {
        privacyPolicy: '<p>Privacy policy content coming soon.</p>',
        termsConditions: '<p>Terms & conditions content coming soon.</p>',
        refundPolicy: '<p>Refund policy content coming soon.</p>',
    },
    taxSettings: {
        gstNumber: '',
        taxPercentage: 0,
        invoicePrefix: 'MD-',
    },
    backup: {
        lastBackupAt: null,
        lastBackupType: 'json',
    },
};

const normalizeSettings = (data = {}) => ({
    ...defaultSettings,
    ...data,
    appVersion: { ...defaultSettings.appVersion, ...(data.appVersion || {}) },
    paymentSettings: { ...defaultSettings.paymentSettings, ...(data.paymentSettings || {}) },
    notificationTemplates: { ...defaultSettings.notificationTemplates, ...(data.notificationTemplates || {}) },
    legalPolicies: { ...defaultSettings.legalPolicies, ...(data.legalPolicies || {}) },
    taxSettings: { ...defaultSettings.taxSettings, ...(data.taxSettings || {}) },
    backup: { ...defaultSettings.backup, ...(data.backup || {}) },
    deliveryAreas: Array.isArray(data.deliveryAreas) ? data.deliveryAreas : defaultSettings.deliveryAreas,
    deliveryTimeSlots: Array.isArray(data.deliveryTimeSlots) ? data.deliveryTimeSlots : defaultSettings.deliveryTimeSlots,
});

const getToken = () => localStorage.getItem('adminToken');

const Toggle = ({ enabled, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${enabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
        aria-label={label}
    >
        <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

const RichTextField = ({ title, value, onChange }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{title}</label>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => onChange(event.currentTarget.innerHTML)}
                className="min-h-40 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
        </div>
    );
};

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('General');
    const [settings, setSettings] = useState(defaultSettings);
    const [adminUsers, setAdminUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [newArea, setNewArea] = useState('');
    const [newSlot, setNewSlot] = useState('');
    const [adminForm, setAdminForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'product_manager',
    });
    const [editingAdminId, setEditingAdminId] = useState(null);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/settings`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setSettings(normalizeSettings(response.data.data));
        } catch (error) {
            console.error('Failed to load settings', error);
            setMessage('Unable to load settings. Please check your admin session.');
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/settings/admins`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setAdminUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to load admin users', error);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchSettings(), fetchAdmins()]);
            setLoading(false);
        };
        load();
    }, []);

    const updateSettings = (updater) => {
        setSettings((prev) => updater(prev));
    };

    const saveSettings = async (sectionPayload) => {
        try {
            setSaving(true);
            setMessage('');
            const payload = sectionPayload || settings;
            const response = await axios.put(`${API_URL}/api/admin/settings`, payload, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setSettings(normalizeSettings(response.data.data));
            setMessage('Settings saved successfully.');
        } catch (error) {
            console.error('Error saving settings', error);
            setMessage(error.response?.data?.message || 'Settings could not be saved.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/api/uploads/image`, formData, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const url = response.data.data.url;
            updateSettings((prev) => ({ ...prev, companyLogo: url }));
            setMessage('Logo uploaded successfully.');
        } catch (error) {
            console.error('Logo upload failed', error);
            setMessage('Logo upload failed.');
        }
    };

    const addArea = () => {
        const value = newArea.trim();
        if (!value) return;
        updateSettings((prev) => ({
            ...prev,
            deliveryAreas: [...new Set([...(prev.deliveryAreas || []), value])],
        }));
        setNewArea('');
    };

    const removeArea = (area) => {
        updateSettings((prev) => ({
            ...prev,
            deliveryAreas: (prev.deliveryAreas || []).filter((item) => item !== area),
        }));
    };

    const addSlot = () => {
        const value = newSlot.trim();
        if (!value) return;
        updateSettings((prev) => ({
            ...prev,
            deliveryTimeSlots: [...new Set([...(prev.deliveryTimeSlots || []), value])],
        }));
        setNewSlot('');
    };

    const removeSlot = (slot) => {
        updateSettings((prev) => ({
            ...prev,
            deliveryTimeSlots: (prev.deliveryTimeSlots || []).filter((item) => item !== slot),
        }));
    };

    const handleAdminSubmit = async (event) => {
        event.preventDefault();
        try {
            const payload = { ...adminForm };
            if (editingAdminId) {
                await axios.patch(`${API_URL}/api/admin/settings/admins/${editingAdminId}`, payload, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
            } else {
                await axios.post(`${API_URL}/api/admin/settings/admins`, payload, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
            }

            setAdminForm({ name: '', email: '', password: '', role: 'product_manager' });
            setEditingAdminId(null);
            await fetchAdmins();
            setMessage('Admin user saved successfully.');
        } catch (error) {
            console.error('Admin user save failed', error);
            setMessage(error.response?.data?.message || 'Failed to save admin user.');
        }
    };

    const handleAdminToggle = async (adminId, isActive) => {
        try {
            await axios.patch(`${API_URL}/api/admin/settings/admins/${adminId}`, { isActive }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            await fetchAdmins();
            setMessage('Admin status updated.');
        } catch (error) {
            console.error('Status change failed', error);
            setMessage('Unable to update admin status.');
        }
    };

    const handleEditAdmin = (admin) => {
        setEditingAdminId(admin._id);
        setAdminForm({
            name: admin.name,
            email: admin.email,
            password: '',
            role: admin.role,
        });
    };

    const handleTestNotification = async () => {
        try {
            await axios.post(`${API_URL}/api/admin/settings/test-notification`, { message: settings.notificationTemplates.orderConfirmation }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setMessage('Test notification sent successfully.');
        } catch (error) {
            console.error('Test notification failed', error);
            setMessage('Test notification failed.');
        }
    };

    const handleExportData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/settings/export-data`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'milk-dairy-export.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setMessage('Data export downloaded successfully.');
        } catch (error) {
            console.error('Export failed', error);
            setMessage('Unable to export data.');
        }
    };

    const tabContent = useMemo(() => {
        switch (activeTab) {
            case 'General':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Company Name">
                                <input value={settings.companyName} onChange={(e) => updateSettings((prev) => ({ ...prev, companyName: e.target.value }))} className="input" />
                            </Field>
                            <Field label="Email">
                                <input type="email" value={settings.email} onChange={(e) => updateSettings((prev) => ({ ...prev, email: e.target.value }))} className="input" />
                            </Field>
                            <Field label="Contact Number">
                                <input value={settings.contactNumber} onChange={(e) => updateSettings((prev) => ({ ...prev, contactNumber: e.target.value }))} className="input" />
                            </Field>
                            <Field label="WhatsApp Number">
                                <input value={settings.whatsappNumber} onChange={(e) => updateSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))} className="input" />
                            </Field>
                        </div>

                        <Field label="Company Address">
                            <textarea value={settings.address} onChange={(e) => updateSettings((prev) => ({ ...prev, address: e.target.value }))} className="input min-h-28" />
                        </Field>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Company Logo</label>
                            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
                                {settings.companyLogo ? (
                                    <img src={settings.companyLogo} alt="Company logo" className="h-16 w-16 rounded-xl object-cover" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">Logo</div>
                                )}
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="block text-sm text-slate-600 dark:text-slate-300" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save General Settings'}
                            </button>
                        </div>
                    </div>
                );
            case 'App':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Android App Version">
                                <input value={settings.appVersion.android} onChange={(e) => updateSettings((prev) => ({ ...prev, appVersion: { ...prev.appVersion, android: e.target.value } }))} className="input" />
                            </Field>
                            <Field label="iOS App Version">
                                <input value={settings.appVersion.ios} onChange={(e) => updateSettings((prev) => ({ ...prev, appVersion: { ...prev.appVersion, ios: e.target.value } }))} className="input" />
                            </Field>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between gap-4 py-2">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">Maintenance Mode</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">When enabled, customer app shows a maintenance message.</p>
                                </div>
                                <Toggle enabled={settings.maintenanceMode} onChange={(value) => updateSettings((prev) => ({ ...prev, maintenanceMode: value }))} label="Maintenance mode" />
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-4 py-2">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">Push Notifications</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Enable or disable push notification delivery.</p>
                                </div>
                                <Toggle enabled={settings.pushNotificationsEnabled} onChange={(value) => updateSettings((prev) => ({ ...prev, pushNotificationsEnabled: value }))} label="Push notifications" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save App Settings'}
                            </button>
                        </div>
                    </div>
                );
            case 'Delivery':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Delivery Charge (₹)">
                                <input type="number" value={settings.deliveryCharge} onChange={(e) => updateSettings((prev) => ({ ...prev, deliveryCharge: Number(e.target.value) }))} className="input" />
                            </Field>
                            <Field label="Free Delivery Minimum (₹)">
                                <input type="number" value={settings.freeDeliveryMinimum} onChange={(e) => updateSettings((prev) => ({ ...prev, freeDeliveryMinimum: Number(e.target.value) }))} className="input" />
                            </Field>
                            <Field label="Minimum Order Amount (₹)">
                                <input type="number" value={settings.minimumOrderAmount} onChange={(e) => updateSettings((prev) => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))} className="input" />
                            </Field>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Delivery Areas / Pincodes</label>
                            <div className="mb-3 flex gap-2">
                                <input value={newArea} onChange={(e) => setNewArea(e.target.value)} className="input flex-1" placeholder="Add area or pincode" />
                                <button type="button" onClick={addArea} className="btn-secondary">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(settings.deliveryAreas || []).map((area) => (
                                    <span key={area} className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                                        {area}
                                        <button type="button" onClick={() => removeArea(area)} className="text-xs font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Delivery Time Slots</label>
                            <div className="mb-3 flex gap-2">
                                <input value={newSlot} onChange={(e) => setNewSlot(e.target.value)} className="input flex-1" placeholder="e.g. 6 AM - 9 AM" />
                                <button type="button" onClick={addSlot} className="btn-secondary">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(settings.deliveryTimeSlots || []).map((slot) => (
                                    <span key={slot} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        {slot}
                                        <button type="button" onClick={() => removeSlot(slot)} className="text-xs font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Delivery Settings'}
                            </button>
                        </div>
                    </div>
                );
            case 'Payment':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800 dark:text-slate-100">Cash on Delivery</span>
                                <Toggle enabled={settings.paymentSettings.codEnabled} onChange={(value) => updateSettings((prev) => ({ ...prev, paymentSettings: { ...prev.paymentSettings, codEnabled: value } }))} label="Cash on delivery" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800 dark:text-slate-100">UPI Payment</span>
                                <Toggle enabled={settings.paymentSettings.upiEnabled} onChange={(value) => updateSettings((prev) => ({ ...prev, paymentSettings: { ...prev.paymentSettings, upiEnabled: value } }))} label="UPI payment" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="UPI ID">
                                    <input value={settings.paymentSettings.upiId} onChange={(e) => updateSettings((prev) => ({ ...prev, paymentSettings: { ...prev.paymentSettings, upiId: e.target.value } }))} className="input" placeholder="yourupi@upi" />
                                </Field>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800 dark:text-slate-100">Online Payment Gateway</span>
                                <Toggle enabled={settings.paymentSettings.onlineGatewayEnabled} onChange={(value) => updateSettings((prev) => ({ ...prev, paymentSettings: { ...prev.paymentSettings, onlineGatewayEnabled: value } }))} label="Online payment gateway" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="API Key">
                                    <input type="password" value={settings.paymentSettings.apiKey} onChange={(e) => updateSettings((prev) => ({ ...prev, paymentSettings: { ...prev.paymentSettings, apiKey: e.target.value } }))} className="input" placeholder="••••••••" />
                                </Field>
                                <Field label="API Secret">
                                    <input type="password" value={settings.paymentSettings.apiSecret} onChange={(e) => updateSettings((prev) => ({ ...prev, paymentSettings: { ...prev.paymentSettings, apiSecret: e.target.value } }))} className="input" placeholder="••••••••" />
                                </Field>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Payment Settings'}
                            </button>
                        </div>
                    </div>
                );
            case 'Notifications':
                return (
                    <div className="space-y-6">
                        <Field label="Order Confirmation Template">
                            <textarea value={settings.notificationTemplates.orderConfirmation} onChange={(e) => updateSettings((prev) => ({ ...prev, notificationTemplates: { ...prev.notificationTemplates, orderConfirmation: e.target.value } }))} className="input min-h-24" />
                        </Field>
                        <Field label="Order Status Update Template">
                            <textarea value={settings.notificationTemplates.orderStatusUpdate} onChange={(e) => updateSettings((prev) => ({ ...prev, notificationTemplates: { ...prev.notificationTemplates, orderStatusUpdate: e.target.value } }))} className="input min-h-24" />
                        </Field>
                        <Field label="New Offer Template">
                            <textarea value={settings.notificationTemplates.newOffer} onChange={(e) => updateSettings((prev) => ({ ...prev, notificationTemplates: { ...prev.notificationTemplates, newOffer: e.target.value } }))} className="input min-h-24" />
                        </Field>

                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <div>
                                <p className="font-medium text-slate-800 dark:text-slate-100">Send test notification</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Queue a sample push message for admin testing.</p>
                            </div>
                            <button type="button" onClick={handleTestNotification} className="btn-secondary">
                                Test Notification
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Notification Settings'}
                            </button>
                        </div>
                    </div>
                );
            case 'Legal':
                return (
                    <div className="space-y-6">
                        <RichTextField title="Privacy Policy" value={settings.legalPolicies.privacyPolicy} onChange={(value) => updateSettings((prev) => ({ ...prev, legalPolicies: { ...prev.legalPolicies, privacyPolicy: value } }))} />
                        <RichTextField title="Terms & Conditions" value={settings.legalPolicies.termsConditions} onChange={(value) => updateSettings((prev) => ({ ...prev, legalPolicies: { ...prev.legalPolicies, termsConditions: value } }))} />
                        <RichTextField title="Refund Policy" value={settings.legalPolicies.refundPolicy} onChange={(value) => updateSettings((prev) => ({ ...prev, legalPolicies: { ...prev.legalPolicies, refundPolicy: value } }))} />

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Legal Policies'}
                            </button>
                        </div>
                    </div>
                );
            case 'Tax':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="GST Number">
                                <input value={settings.taxSettings.gstNumber} onChange={(e) => updateSettings((prev) => ({ ...prev, taxSettings: { ...prev.taxSettings, gstNumber: e.target.value } }))} className="input" />
                            </Field>
                            <Field label="Tax Percentage (%)">
                                <input type="number" value={settings.taxSettings.taxPercentage} onChange={(e) => updateSettings((prev) => ({ ...prev, taxSettings: { ...prev.taxSettings, taxPercentage: Number(e.target.value) } }))} className="input" />
                            </Field>
                            <Field label="Invoice Prefix">
                                <input value={settings.taxSettings.invoicePrefix} onChange={(e) => updateSettings((prev) => ({ ...prev, taxSettings: { ...prev.taxSettings, invoicePrefix: e.target.value } }))} className="input" />
                            </Field>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => saveSettings({ ...settings })} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Tax Settings'}
                            </button>
                        </div>
                    </div>
                );
            case 'Admins':
                return (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Current Admin Users</h3>
                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Name</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Email</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Role</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Status</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Permissions</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-950">
                                        {adminUsers.map((admin) => (
                                            <tr key={admin._id}>
                                                <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{admin.name}</td>
                                                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{admin.email}</td>
                                                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{admin.role}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${admin.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200'}`}>
                                                        {admin.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{(admin.permissions || ROLE_PERMISSIONS[admin.role] || []).join(', ')}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => handleEditAdmin(admin)} className="btn-secondary">Edit</button>
                                                        <button type="button" onClick={() => handleAdminToggle(admin._id, !admin.isActive)} className="btn-secondary">
                                                            {admin.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <form onSubmit={handleAdminSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{editingAdminId ? 'Edit Admin User' : 'Add New Admin'}</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Name">
                                    <input value={adminForm.name} onChange={(e) => setAdminForm((prev) => ({ ...prev, name: e.target.value }))} className="input" required />
                                </Field>
                                <Field label="Email">
                                    <input type="email" value={adminForm.email} onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))} className="input" required />
                                </Field>
                                <Field label="Password">
                                    <input type="password" value={adminForm.password} onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))} className="input" placeholder={editingAdminId ? 'Leave blank to keep current password' : ''} />
                                </Field>
                                <Field label="Role">
                                    <select value={adminForm.role} onChange={(e) => setAdminForm((prev) => ({ ...prev, role: e.target.value }))} className="input">
                                        <option value="super_admin">Super Admin</option>
                                        <option value="order_manager">Order Manager</option>
                                        <option value="product_manager">Product Manager</option>
                                        <option value="delivery_manager">Delivery Manager</option>
                                    </select>
                                </Field>
                            </div>
                            <div className="mt-4 flex justify-end gap-3">
                                {editingAdminId && (
                                    <button type="button" onClick={() => {
                                        setEditingAdminId(null);
                                        setAdminForm({ name: '', email: '', password: '', role: 'product_manager' });
                                    }} className="btn-secondary">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="btn-primary">{editingAdminId ? 'Update Admin' : 'Add Admin'}</button>
                            </div>
                        </form>
                    </div>
                );
            case 'Backup':
                return (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Backup & Export</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Last backup: {settings.backup?.lastBackupAt ? new Date(settings.backup.lastBackupAt).toLocaleString() : 'Not yet created'}
                                    </p>
                                </div>
                                <button type="button" onClick={handleExportData} className="btn-primary">Export All Data</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }, [activeTab, settings, adminUsers, adminForm, editingAdminId, saving, newArea, newSlot]);

    if (loading) {
        return <div className="p-8 text-slate-700 dark:text-white">Loading settings...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">System</p>
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>
                <div className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
                    {settings.companyName}
                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {message && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    {message}
                </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/80">
                {tabContent}
            </div>
        </div>
    );
};

const Field = ({ label, children }) => (
    <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        {children}
    </label>
);

export default SettingsPage;
