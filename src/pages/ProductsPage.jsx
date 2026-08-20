import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const createEmptySize = (index = 0) => ({
    sizeLabel: index === 0 ? '500' : '1',
    unit: index === 0 ? 'ml' : 'Litre',
    sku: `SKU-${Date.now()}-${index + 1}`,
    price: index === 0 ? 30 : 60,
    discountPercent: 0,
    discountPrice: index === 0 ? 30 : 60,
    offerPrice: index === 0 ? 30 : 60,
    stock: index === 0 ? 50 : 100,
    isActive: true,
});

const emptyForm = {
    name: '',
    description: '',
    category: '',
    images: '',
    videoUrl: '',
    isActive: true,
    sizes: [createEmptySize(0), createEmptySize(1)],
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const fetchProducts = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.data || []);
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.data || []);
    };

    useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([fetchProducts(), fetchCategories()]);
            } catch (err) {
                console.error('Load products page failed:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const updateSize = (index, field, value) => {
        setForm((prev) => {
            const nextSizes = [...prev.sizes];
            nextSizes[index] = {
                ...nextSizes[index],
                [field]: value,
            };
            return { ...prev, sizes: nextSizes };
        });
    };

    const addSize = () => {
        setForm((prev) => ({
            ...prev,
            sizes: [
                ...prev.sizes,
                createEmptySize(prev.sizes.length),
            ],
        }));
    };

    const removeSize = (index) => {
        setForm((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const sanitizedSizes = form.sizes
                .filter((size) => size.sizeLabel && size.unit)
                .map((size, index) => {
                    const offerValue = Number(size.offerPrice ?? size.discountPrice ?? size.price ?? 0);
                    const discountValue = Number(size.discountPrice ?? size.offerPrice ?? 0);
                    const normalizedPrice = Number(size.price ?? 0);

                    return {
                        sizeLabel: String(size.sizeLabel),
                        unit: String(size.unit),
                        sku: size.sku || `SKU-${index + 1}`,
                        price: normalizedPrice,
                        discountPercent: Number(size.discountPercent ?? 0),
                        discountPrice: discountValue,
                        offerPrice: offerValue,
                        stock: Number(size.stock ?? 0),
                        isActive: typeof size.isActive === 'boolean' ? size.isActive : true,
                    };
                });

            if (sanitizedSizes.length === 0) {
                throw new Error('At least one product size is required');
            }

            const payload = {
                ...form,
                images: form.images ? form.images.split(',').map((url) => url.trim()).filter(Boolean) : [],
                sizes: sanitizedSizes,
            };

            if (editingId) {
                const response = await axios.patch(`${API_URL}/api/products/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    setMessage('Product updated successfully');
                    resetForm();
                    await fetchProducts();
                }
                return;
            }

            const response = await axios.post(`${API_URL}/api/products`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setMessage('Product added successfully');
                resetForm();
                await fetchProducts();
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Failed to save product';
            setMessage(errMsg);
            console.error('Product save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        const confirmed = window.confirm('આ product ડિલીટ કરવો છે?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.delete(`${API_URL}/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setMessage('Product deleted successfully');
                if (editingId === productId) resetForm();
                await fetchProducts();
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to delete product';
            setMessage(errMsg);
            console.error('Product delete failed:', error);
        }
    };

    const handleToggleProductStatus = async (product) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.patch(`${API_URL}/api/products/${product._id}`, {
                isActive: !product.isActive,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setMessage(`Product ${response.data.data.isActive ? 'activated' : 'deactivated'} successfully`);
                await fetchProducts();
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to update status';
            setMessage(errMsg);
            console.error('Toggle product status failed:', error);
        }
    };

    const handleEditProduct = (product) => {
        setEditingId(product._id);
        setForm({
            name: product.name || '',
            description: product.description || '',
            category: product.category?._id || product.category || '',
            images: (product.images || []).join(', '),
            videoUrl: product.videoUrl || '',
            isActive: typeof product.isActive === 'boolean' ? product.isActive : true,
            sizes: (product.sizes || []).map((size) => ({
                sizeLabel: size.sizeLabel || '',
                unit: size.unit || 'Litre',
                sku: size.sku || '',
                price: Number(size.price ?? 0),
                discountPercent: Number(size.discountPercent ?? 0),
                discountPrice: Number(size.discountPrice ?? size.offerPrice ?? size.price ?? 0),
                offerPrice: Number(size.offerPrice ?? size.discountPrice ?? size.price ?? 0),
                stock: Number(size.stock ?? 0),
                isActive: typeof size.isActive === 'boolean' ? size.isActive : true,
            })),
        });
    };

    const toggleSizeStatus = (index, value) => {
        setForm((prev) => {
            const nextSizes = [...prev.sizes];
            nextSizes[index] = { ...nextSizes[index], isActive: value };
            return { ...prev, sizes: nextSizes };
        });
    };

    const renderSizeCard = (size, index) => (
        <div key={`${size.sizeLabel}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-300">Size {index + 1}</span>
                <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30"
                >
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input
                    value={size.sizeLabel}
                    onChange={(e) => updateSize(index, 'sizeLabel', e.target.value)}
                    className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
                    placeholder="500"
                />
                <select
                    value={size.unit}
                    onChange={(e) => updateSize(index, 'unit', e.target.value)}
                    className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
                >
                    <option value="ml">ml</option>
                    <option value="Litre">Litre</option>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                </select>
                <input
                    value={size.price}
                    onChange={(e) => updateSize(index, 'price', Number(e.target.value))}
                    className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
                    placeholder="Price"
                    type="number"
                />
                <input
                    value={size.discountPrice}
                    onChange={(e) => updateSize(index, 'discountPrice', Number(e.target.value))}
                    className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
                    placeholder="Discount Price"
                    type="number"
                />
                <input
                    value={size.stock}
                    onChange={(e) => updateSize(index, 'stock', Number(e.target.value))}
                    className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
                    placeholder="Stock"
                    type="number"
                />
                <div className="flex items-center justify-center rounded border border-slate-600 bg-slate-800 px-2 py-1">
                    <input
                        type="checkbox"
                        checked={size.isActive}
                        onChange={(e) => updateSize(index, 'isActive', e.target.checked)}
                    />
                    <span className="ml-2 text-xs">Active</span>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${size.isActive ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>
                    {size.isActive ? 'In Stock' : 'Out of Stock'}
                </span>
                <button
                    type="button"
                    onClick={() => toggleSizeStatus(index, !size.isActive)}
                    className="rounded bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-600"
                >
                    {size.isActive ? 'Set Out of Stock' : 'Set In Stock'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Product Management</h1>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-xl font-semibold">Products</h2>

                    {loading ? (
                        <p className="text-slate-500 dark:text-slate-400">Loading products...</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-100 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm">Name</th>
                                        <th className="px-4 py-3 text-left text-sm">Category</th>
                                        <th className="px-4 py-3 text-left text-sm">Sizes</th>
                                        <th className="px-4 py-3 text-left text-sm">Status</th>
                                        <th className="px-4 py-3 text-left text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No products yet</td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="px-4 py-3 font-medium">{product.name}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{product.category?.name || '—'}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                    {(product.sizes || []).map((size) => `${size.sizeLabel} ${size.unit} @ ₹${size.price}`).join(', ')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${product.isActive ? 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-200' : 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-200'}`}>
                                                        <span className={`h-2 w-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button type="button" onClick={() => handleToggleProductStatus(product)} className="rounded bg-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                                                            {product.isActive ? 'Disable' : 'Enable'}
                                                        </button>
                                                        <button type="button" onClick={() => handleEditProduct(product)} className="rounded bg-cyan-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-cyan-400">
                                                            Edit
                                                        </button>
                                                        <button type="button" onClick={() => handleDeleteProduct(product._id)} className="rounded bg-red-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-400">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white">
                                Cancel
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Product Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" required />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" rows="3" required />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Category</label>
                            <select name="category" value={form.category} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" required>
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Image URLs (comma separated)</label>
                            <input name="images" value={form.images} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" placeholder="https://... , https://..." />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Video URL</label>
                            <input name="videoUrl" value={form.videoUrl} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" placeholder="https://..." />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <input id="isActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            <label htmlFor="isActive">Active</label>
                        </div>

                        <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Packaging Sizes</h3>
                                <button type="button" onClick={addSize} className="rounded bg-cyan-500 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-400">
                                    + Add Size
                                </button>
                            </div>
                            <div className="space-y-3">
                                {form.sizes.map(renderSizeCard)}
                            </div>
                        </div>

                        {message && <p className="text-sm text-cyan-600 dark:text-cyan-300">{message}</p>}

                        <button type="submit" disabled={saving} className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-white hover:bg-cyan-400 disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
