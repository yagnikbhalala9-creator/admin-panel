import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const emptyForm = {
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    displayOrder: 0,
    isActive: true,
};

const VideosPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchVideos = async () => {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/api/videos`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setVideos(res.data.data || []);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    useEffect(() => {
        fetchVideos()
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const endpoint = editingId ? `${API_URL}/api/videos/${editingId}` : `${API_URL}/api/videos`;
            const method = editingId ? 'patch' : 'post';
            const res = await axios({
                method,
                url: endpoint,
                data: form,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage(editingId ? 'Video updated successfully' : 'Video added successfully');
                resetForm();
                await fetchVideos();
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to save video';
            setMessage(errMsg);
            console.error('Video save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditVideo = (video) => {
        setEditingId(video._id);
        setForm({
            title: video.title || '',
            description: video.description || '',
            url: video.url || '',
            thumbnail: video.thumbnail || '',
            displayOrder: video.displayOrder ?? 0,
            isActive: typeof video.isActive === 'boolean' ? video.isActive : true,
        });
        setShowForm(true);
    };

    const handleDeleteVideo = async (videoId) => {
        const confirmed = window.confirm('આ video delete કરવું છે?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.delete(`${API_URL}/api/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage('Video deleted successfully');
                await fetchVideos();
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to delete video');
            console.error('Delete video failed:', error);
        }
    };

    return (
        <div className="p-8 text-slate-900 transition-colors dark:text-white">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Video Management</h1>
                <button type="button" onClick={() => (showForm ? resetForm() : setShowForm(true))} className="rounded-xl bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
                    {showForm ? 'Close' : '+ Add Video'}
                </button>
            </div>

            {showForm && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-xl font-semibold">{editingId ? 'Edit Video' : 'Add Video'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Title</label>
                            <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" rows="3" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Video URL</label>
                            <input name="url" value={form.url} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" placeholder="https://...mp4" required />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Thumbnail</label>
                            <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20" placeholder="https://...jpg" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <input id="videoIsActive" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            <label htmlFor="videoIsActive">Active</label>
                        </div>
                        {message && <p className="text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                                {saving ? 'Saving...' : editingId ? 'Save Video' : 'Add Video'}
                            </button>
                            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-4 text-xl font-semibold">Videos</h2>
                {loading ? (
                    <p className="text-slate-400">Loading videos...</p>
                ) : (
                    <div className="space-y-3">
                        {videos.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">No videos yet</p>
                        ) : (
                            videos.map((video) => (
                                <div key={video._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{video.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{video.url}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${video.isActive ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/30' : 'bg-slate-500/15 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-200 dark:ring-slate-500/30'}`}>
                                            {video.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button type="button" onClick={() => handleEditVideo(video)} className="rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300">Edit</button>
                                        <button type="button" onClick={() => handleDeleteVideo(video._id)} className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideosPage;
