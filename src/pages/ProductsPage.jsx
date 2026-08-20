import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

const emptyForm = () => ({
    name: '',
    description: '',
    category: '',
    images: [],
    videoUrl: '',
    isActive: true,
    sizes: [createEmptySize(0), createEmptySize(1)],
});

const normalizeImageEntry = (entry, index = 0) => {
    if (typeof entry === 'string') {
        const url = entry.trim();
        return url ? { url, isMain: index === 0 } : null;
    }

    if (entry && typeof entry === 'object') {
        const url = String(entry.url || '').trim();
        if (!url) return null;
        return {
            url,
            isMain: typeof entry.isMain === 'boolean' ? entry.isMain : index === 0,
        };
    }

    return null;
};

const toImageEntries = (images = []) => {
    const normalized = (Array.isArray(images) ? images : []).map((entry, index) => normalizeImageEntry(entry, index)).filter(Boolean);
    if (!normalized.length) return [];
    const hasMain = normalized.some((entry) => entry.isMain);
    if (!hasMain) normalized[0].isMain = true;
    return normalized;
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [pendingPreviews, setPendingPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const resetForm = () => {
        setForm(emptyForm());
        setEditingId(null);
        setUploadError('');
        setPendingPreviews([]);
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
            nextSizes[index] = { ...nextSizes[index], [field]: value };
            return { ...prev, sizes: nextSizes };
        });
    };

    const addSize = () => {
        setForm((prev) => ({
            ...prev,
            sizes: [...prev.sizes, createEmptySize(prev.sizes.length)],
        }));
    };

    const removeSize = (index) => {
        setForm((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index),
        }));
    };

    const processFiles = (files) => {
        const validFiles = [];
        const issues = [];

        files.forEach((file) => {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                issues.push(`${file.name}: JPG, PNG, and WebP only.`);
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                issues.push(`${file.name}: max 5MB allowed.`);
                return;
            }

            validFiles.push(file);
        });

        if (issues.length > 0) {
            setUploadError(issues.join(' '));
        } else {
            setUploadError('');
        }

        if (validFiles.length === 0) return;

        const previews = validFiles.map((file) => ({
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            name: file.name,
            preview: URL.createObjectURL(file),
            isLocal: true,
        }));

        setPendingPreviews((prev) => [...prev, ...previews]);
        return validFiles;
    };

    const uploadFiles = async (incomingFiles) => {
        if (!incomingFiles || incomingFiles.length === 0) return;

        const token = localStorage.getItem('adminToken');
        const formData = new FormData();

        incomingFiles.forEach((file) => formData.append('files', file));

        try {
            setUploading(true);
            setUploadError('');
            setUploadProgress(0);

            const response = await axios.post(`${API_URL}/api/uploads/images`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (event) => {
                    const percentage = Math.round((event.loaded * 100) / (event.total || 1));
                    setUploadProgress(percentage);
                },
            });

            const uploaded = (response.data.data || []).map((item) => ({
                url: item.url,
                isMain: form.images.length === 0 && form.images.length + 1 === 1,
            }));

            setForm((prev) => {
                const nextImages = [...(prev.images || [])];
                const newEntries = uploaded.map((item, index) => ({
                    url: item.url,
                    isMain: nextImages.length === 0 && index === 0,
                }));
                const merged = [...nextImages, ...newEntries];
                if (!merged.some((image) => image.isMain)) merged[0].isMain = true;
                return { ...prev, images: merged };
            });

            setPendingPreviews((prev) => prev.slice(0, Math.max(prev.length - incomingFiles.length, 0)));
            setUploadProgress(100);
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Image upload failed');
            setPendingPreviews((prev) => prev.filter((preview) => !incomingFiles.some((file) => file.name === preview.name && file.size === preview.size)));
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files || []);
        const validFiles = processFiles(files);
        if (!validFiles || validFiles.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        await uploadFiles(validFiles);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (imageIndex) => {
        setForm((prev) => {
            const images = [...(prev.images || [])];
            images.splice(imageIndex, 1);
            if (images.length > 0 && !images.some((image) => image.isMain)) images[0].isMain = true;
            return { ...prev, images };
        });
    };

    const removePendingPreview = (previewId) => {
        setPendingPreviews((prev) => prev.filter((preview) => preview.id !== previewId));
    };

    const handleSetMainImage = (index) => {
        setForm((prev) => ({
            ...prev,
            images: (prev.images || []).map((image, imageIndex) => ({
                ...image,
                isMain: imageIndex === index,
            })),
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
                images: toImageEntries(form.images),
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
            images: toImageEntries(product.images || []),
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
        setPendingPreviews([]);
    };

    const toggleSizeStatus = (index, value) => {
        setForm((prev) => {
            const nextSizes = [...prev.sizes];
            nextSizes[index] = { ...nextSizes[index], isActive: value };
            return { ...prev, sizes: nextSizes };
        });
    };

    const mainImage = useMemo(() => {
        const currentImages = form.images || [];
        return currentImages.find((image) => image.isMain)?.url || currentImages[0]?.url || '';
    }, [form.images]);

    const renderSizeCard = (size, index) => (
        <div key={`${size.sizeLabel}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-300">Size {index + 1}</span>
                <button type="button" onClick={() => removeSize(index)} className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30">
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input value={size.sizeLabel} onChange={(e) => updateSize(index, 'sizeLabel', e.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-1" placeholder="500" />
                <select value={size.unit} onChange={(e) => updateSize(index, 'unit', e.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-1">
                    <option value="ml">ml</option>
                    <option value="Litre">Litre</option>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                </select>
                <input value={size.price} onChange={(e) => updateSize(index, 'price', Number(e.target.value))} className="rounded border border-slate-600 bg-slate-800 px-2 py-1" placeholder="Price" type="number" />
                <input value={size.discountPrice} onChange={(e) => updateSize(index, 'discountPrice', Number(e.target.value))} className="rounded border border-slate-600 bg-slate-800 px-2 py-1" placeholder="Discount Price" type="number" />
                <input value={size.stock} onChange={(e) => updateSize(index, 'stock', Number(e.target.value))} className="rounded border border-slate-600 bg-slate-800 px-2 py-1" placeholder="Stock" type="number" />
                <div className="flex items-center justify-center rounded border border-slate-600 bg-slate-800 px-2 py-1">
                    <input type="checkbox" checked={size.isActive} onChange={(e) => updateSize(index, 'isActive', e.target.checked)} />
                    <span className="ml-2 text-xs">Active</span>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${size.isActive ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>
                    {size.isActive ? 'In Stock' : 'Out of Stock'}
                </span>
                <button type="button" onClick={() => toggleSizeStatus(index, !size.isActive)} className="rounded bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-600">
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
                                        <th className="px-4 py-3 text-left text-sm">Image</th>
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
                                            <td colSpan="6" className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No products yet</td>
                                        </tr>
                                    ) : (
                                        products.map((product) => {
                                            const productMainImage = (product.images || []).find((image) => image.isMain)?.url || (product.images || [])[0]?.url || '';
                                            const expanded = expandedProductId === product._id;
                                            return (
                                                <>
                                                    <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" onClick={() => setExpandedProductId(expanded ? null : product._id)}>
                                                        <td className="px-4 py-3">
                                                            {productMainImage ? (
                                                                <img src={productMainImage} alt={product.name} className="h-12 w-12 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
                                                            ) : (
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] text-slate-400">No Img</div>
                                                            )}
                                                        </td>
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
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleProductStatus(product); }} className="rounded bg-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                                                                    {product.isActive ? 'Disable' : 'Enable'}
                                                                </button>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }} className="rounded bg-cyan-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-cyan-400">
                                                                    Edit
                                                                </button>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }} className="rounded bg-red-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-400">
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expanded && (
                                                        <tr>
                                                            <td colSpan="6" className="bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                                                                <div className="space-y-3">
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Gallery</p>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {(product.images || []).length === 0 ? (
                                                                            <p className="text-sm text-slate-500 dark:text-slate-400">No product photos uploaded yet.</p>
                                                                        ) : (
                                                                            (product.images || []).map((image, index) => (
                                                                                <div key={`${product._id}-${index}`} className="flex flex-col items-center gap-1">
                                                                                    <img src={image.url} alt={`${product.name}-${index + 1}`} className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
                                                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{image.isMain ? 'Main' : 'Photo ' + (index + 1)}</span>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })
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
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Product Photos</label>
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/70">
                                <div className="flex items-center justify-center">
                                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Choose Files'}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, or WebP only • max 5MB each • up to 5 images</p>
                                {uploading && (
                                    <div className="mt-3">
                                        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                            <span>Uploading photos</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}

                            {(form.images || []).length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected Product Photos</p>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {(form.images || []).map((image, index) => (
                                            <div key={`${image.url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
                                                <img src={image.url} alt={`product-${index + 1}`} className="h-20 w-full rounded-md object-cover" />
                                                <div className="mt-2 flex items-center justify-between gap-2">
                                                    <label className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
                                                        <input type="radio" checked={!!image.isMain} onChange={() => handleSetMainImage(index)} name="main-image" />
                                                        Main
                                                    </label>
                                                    <button type="button" onClick={() => removeImage(index)} className="rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-500 hover:bg-red-500/20">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pendingPreviews.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Preview before upload</p>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {pendingPreviews.map((preview) => (
                                            <div key={preview.id} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
                                                <img src={preview.preview} alt={preview.name} className="h-20 w-full rounded-md object-cover" />
                                                <button type="button" onClick={() => removePendingPreview(preview.id)} className="absolute right-2 top-2 rounded-full bg-slate-900/70 px-1.5 py-0.5 text-[9px] text-white">X</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {mainImage && (
                            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-xs text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                                Main cover image: <span className="font-semibold">{mainImage}</span>
                            </div>
                        )}

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

                        <button type="submit" disabled={saving || uploading} className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-white hover:bg-cyan-400 disabled:opacity-60">
                            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
