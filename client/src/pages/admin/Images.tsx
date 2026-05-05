import { AdminLayout } from './AdminLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Plus, Trash2, Pencil, X, Upload, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../../lib/api';
import toast from 'react-hot-toast';

interface AdminImage {
  id: string;
  title: string;
  prompt: string;
  model: string;
  url: string;
  is_published: boolean;
  like_count: number;
  copy_count: number;
  created_at: string;
}

const EMPTY_FORM = {
  title: '',
  prompt: '',
  model: 'Midjourney',
  tags: '',
  is_published: true,
};

const MODELS = ['Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Firefly', 'Ideogram', 'Flux'];

export function AdminImages() {
  const [images, setImages] = useState<AdminImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminImage | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/images`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setImages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview('');
    setShowModal(true);
  };

  const openEdit = (img: AdminImage) => {
    setEditing(img);
    setForm({ title: img.title, prompt: img.prompt, model: img.model, tags: '', is_published: img.is_published });
    setFile(null);
    setPreview(img.url);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setFile(null); setPreview(''); };

  const handleFileChange = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.prompt.trim()) { toast.error('Title and prompt are required'); return; }
    if (!editing && !file) { toast.error('Please select an image file'); return; }
    setSaving(true);
    try {
      if (editing) {
        // Update metadata only
        const res = await fetch(`${API_BASE}/api/admin/images/${editing.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            prompt: form.prompt.trim(),
            model: form.model,
            tags: form.tags.trim(),
            is_published: form.is_published,
          }),
        });
        if (!res.ok) throw new Error('Failed');
        toast.success('Image updated');
      } else {
        // Upload new image
        const fd = new FormData();
        fd.append('image', file!);
        fd.append('title', form.title.trim());
        fd.append('prompt', form.prompt.trim());
        fd.append('model', form.model);
        fd.append('tags', form.tags.trim());
        fd.append('is_published', String(form.is_published));
        setUploading(true);
        const res = await fetch(`${API_BASE}/api/admin/images`, { method: 'POST', credentials: 'include', body: fd });
        setUploading(false);
        if (!res.ok) throw new Error('Failed');
        toast.success('Image uploaded');
      }
      closeModal();
      fetchImages();
    } catch {
      toast.error('Failed to save image');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/images/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      toast.success('Image deleted');
      fetchImages();
    } catch { toast.error('Failed to delete'); }
  };

  const handleTogglePublish = async (img: AdminImage) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/images/${img.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !img.is_published }),
      });
      if (!res.ok) throw new Error();
      toast.success(img.is_published ? 'Image hidden' : 'Image published');
      fetchImages();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-1">Gallery Images</h2>
            <p className="text-ink/60 font-mono text-xs uppercase tracking-widest">
              {images.length} total · {images.filter(i => i.is_published).length} published
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-bg font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-ink/80 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Image</span>
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-square rounded-xl bg-ink/10 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-ink/30">
            <ImageIcon className="w-10 h-10 mb-3" />
            <p className="font-mono text-xs uppercase tracking-widest">No images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <motion.div key={img.id} layout className="relative group rounded-xl overflow-hidden bg-ink/5 border border-ink/10 aspect-square">
                <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {!img.is_published && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[9px] uppercase tracking-widest rounded">
                    Hidden
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
                  <p className="text-white font-serif text-sm font-bold line-clamp-2 flex-1 pr-2">{img.title}</p>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handleTogglePublish(img)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors text-white" title={img.is_published ? 'Hide' : 'Publish'}>
                      {img.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(img)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors text-white">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(img.id)}
                      className="p-1.5 bg-red-500/60 hover:bg-red-500 rounded-lg transition-colors text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-surface border border-ink/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-ink/10">
                <h3 className="font-serif text-xl font-bold">{editing ? 'Edit Image' : 'Upload Image'}</h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-ink/10 rounded-lg transition-colors text-ink/50 hover:text-ink">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

                {/* Image picker (only for new) */}
                {!editing && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Image File *</label>
                    <div
                      className="relative flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-ink/20 rounded-lg cursor-pointer hover:border-ink/40 transition-colors overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {preview ? (
                        <>
                          <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                          <span className="relative font-mono text-xs text-ink/60">Click to change</span>
                        </>
                      ) : (
                        <>
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-ink/40" /> : <Upload className="w-5 h-5 text-ink/40" />}
                          <span className="font-mono text-xs text-ink/40">Click to select image</span>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); e.target.value = ''; }} />
                  </div>
                )}

                {editing && preview && (
                  <img src={preview} alt="current" className="w-full h-40 object-cover rounded-lg border border-ink/10" />
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Title *</label>
                  <input type="text" placeholder="Neon Tokyo Street" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-lg font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Prompt *</label>
                  <textarea placeholder="Describe the prompt used to generate this image..." rows={3} value={form.prompt}
                    onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-lg font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Model</label>
                    <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                      className="px-4 py-2.5 bg-bg border border-ink/10 rounded-lg font-mono text-sm text-ink focus:outline-none focus:border-ink/40 transition-colors">
                      {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Tags</label>
                    <input type="text" placeholder="neon, japan, night" value={form.tags}
                      onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="px-4 py-2.5 bg-bg border border-ink/10 rounded-lg font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors" />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_published ? 'bg-emerald-500' : 'bg-ink/20'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="font-mono text-xs text-ink/60 uppercase tracking-widest">
                    {form.is_published ? 'Published (visible in gallery)' : 'Hidden (draft)'}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 p-6 border-t border-ink/10">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 border border-ink/15 rounded-lg font-mono text-xs uppercase tracking-widest text-ink/60 hover:bg-ink/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || uploading || !form.title.trim() || !form.prompt.trim() || (!editing && !file)}
                  className="flex-1 py-2.5 bg-ink text-bg rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:bg-ink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {(saving || uploading)
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? 'Uploading...' : 'Saving...'}</>
                    : editing ? 'Save Changes' : 'Upload'
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
