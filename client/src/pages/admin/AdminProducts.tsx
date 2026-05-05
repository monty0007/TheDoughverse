import { AdminLayout } from './AdminLayout';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Plus, Trash2, Pencil, X, Search,
  ToggleLeft, ToggleRight, Upload, Loader2,
  Image as ImageIcon, Eye, EyeOff, Heart, Cookie,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../../lib/api';
import { getFallbackProductImage, getProductImage } from '../../lib/productImages';
import toast from 'react-hot-toast';

const CATEGORIES = ['Classic', 'Chocolate', 'Specialty'];
const BADGES = ['', 'NEW', 'BESTSELLER', 'SEASONAL', 'LIMITED'];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  is_limited: boolean;
  quantity: number | null;
}

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  model: string;
  is_published: boolean;
  like_count: number;
  copy_count: number;
}

interface Stats {
  total_images: string | number;
  total_published: string | number;
  total_likes: string | number;
  total_copies: string | number;
  uploads_this_week: string | number;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: 'Classic',
  badge: '',
  sort_order: '0',
  is_limited: false,
  quantity: '',
};

const BADGE_COLOR: Record<string, string> = {
  NEW: '#1A4FE8',
  BESTSELLER: '#C4752A',
  SEASONAL: '#E8B4D8',
  LIMITED: '#5C3317',
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/products`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));

    setLoadingImages(true);
    fetch(`${API_BASE}/api/admin/images?limit=50`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setImages(Array.isArray(d.images) ? d.images : []); setLoadingImages(false); })
      .catch(() => setLoadingImages(false));

    fetch(`${API_BASE}/api/admin/stats`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      image: p.image || getFallbackProductImage(p), category: p.category, badge: p.badge ?? '',
      sort_order: String(p.sort_order),
      is_limited: Boolean(p.is_limited),
      quantity: p.quantity != null ? String(p.quantity) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/api/admin/upload`, { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), description: form.description.trim(),
      price: parseFloat(form.price), image: form.image.trim(),
      category: form.category, badge: form.badge || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_limited: form.is_limited,
      quantity: form.is_limited && form.quantity ? parseInt(form.quantity) : null,
    };
    try {
      const url = editing
        ? `${API_BASE}/api/admin/products/${editing.id}`
        : `${API_BASE}/api/admin/products`;
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Product updated' : 'Product created');
      closeModal();
      fetchAll();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Product deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      await fetch(`${API_BASE}/api/admin/products/${p.id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !p.is_active }),
      });
      toast.success(p.is_active ? 'Product hidden' : 'Product visible');
      fetchAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleTogglePublish = async (img: GalleryImage) => {
    try {
      await fetch(`${API_BASE}/api/admin/images/${img.id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !img.is_published }),
      });
      toast.success(img.is_published ? 'Image hidden' : 'Image published');
      fetchAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Products', value: products.length, sub: `${products.filter(p => p.is_active).length} active`, Icon: Cookie },
            { label: 'Images', value: stats ? Number(stats.total_images) : '—', sub: `${stats ? stats.total_published : 0} published`, Icon: ImageIcon },
            { label: 'Total Likes', value: stats ? Number(stats.total_likes) : '—', sub: 'all time', Icon: Heart },
            { label: 'Prompt Copies', value: stats ? Number(stats.total_copies) : '—', sub: `${stats ? stats.uploads_this_week : 0} this week`, Icon: Upload },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 flex flex-col gap-2 bg-surface border border-ink/10">
              <s.Icon className="w-4 h-4 text-ink/30" />
              <p className="text-3xl font-bold font-serif text-ink leading-none">
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </p>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink">{s.label}</p>
                <p className="font-mono text-[10px] text-ink/40">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Products ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-ink">Cookie Products</h2>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest rounded-xl hover:bg-ink/80 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/30" />
            <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/30 transition-colors" />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 rounded-2xl bg-ink/5 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-ink/30 bg-surface border border-ink/10 rounded-2xl">
              <ShoppingBag className="w-8 h-8 mb-2" />
              <p className="font-mono text-[11px] uppercase tracking-widest">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(p => (
                <motion.div key={p.id} layout className="flex flex-col rounded-2xl overflow-hidden bg-surface border border-ink/10 group">
                  {/* Image — 3:2 rectangle */}
                  <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
                    <div className="absolute inset-0 bg-ink/5">
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                          const fallback = getFallbackProductImage(p);
                          if (event.currentTarget.getAttribute('src') !== fallback) {
                            event.currentTarget.src = fallback;
                          }
                        }}
                      />
                    </div>
                    {p.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold text-white"
                        style={{ backgroundColor: BADGE_COLOR[p.badge] ?? '#666' }}>
                        {p.badge}
                      </span>
                    )}
                    {p.is_limited && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold"
                        style={{ backgroundColor: '#5C3317', color: '#F5E6D3' }}>
                        {p.quantity != null ? `${p.quantity} left` : 'Limited'}
                      </span>
                    )}
                    {!p.is_active && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="px-2 py-0.5 bg-black/70 text-white font-mono text-[9px] uppercase tracking-wider rounded-full">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col flex-1 p-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-sm text-ink leading-snug line-clamp-1">{p.name}</p>
                      <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mt-0.5">{p.category}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-ink">₹{Number(p.price).toFixed(0)}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => handleToggleActive(p)} title={p.is_active ? 'Hide' : 'Show'}
                          className="p-1.5 rounded-lg hover:bg-ink/10 transition-colors">
                          {p.is_active
                            ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                            : <ToggleLeft className="w-4 h-4 text-ink/30" />}
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
                          style={{ backgroundColor: '#1A4FE8', color: '#fff', fontFamily: '"Nunito", sans-serif' }}>
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400/50 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Gallery Images ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-ink">Gallery Images</h2>
            <span className="font-mono text-[11px] text-ink/40 uppercase tracking-widest">
              {images.filter(i => i.is_published).length} / {images.length} published
            </span>
          </div>

          {loadingImages ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-2xl bg-ink/5 animate-pulse" style={{ paddingBottom: '66.67%', position: 'relative' }} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-ink/30 bg-surface border border-ink/10 rounded-2xl">
              <ImageIcon className="w-8 h-8 mb-2" />
              <p className="font-mono text-[11px] uppercase tracking-widest">No images yet</p>
              <p className="font-mono text-[10px] text-ink/30 mt-1">Upload via the Images page</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(img => (
                <motion.div key={img.id} layout
                  className="relative group rounded-2xl overflow-hidden border border-ink/10"
                  style={{ paddingBottom: '66.67%' }}>
                  <div className="absolute inset-0 bg-ink/5">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
                    {!img.is_published && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white font-mono text-[9px] uppercase tracking-wider rounded-full">
                        Hidden
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white font-serif text-xs font-bold line-clamp-2 flex-1">{img.title}</p>
                        <button onClick={() => handleTogglePublish(img)}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors text-white shrink-0"
                          title={img.is_published ? 'Hide' : 'Publish'}>
                          {img.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-white/70 uppercase tracking-wider">{img.model}</span>
                        <span className="font-mono text-[9px] text-white/60 flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5" />{img.like_count ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </motion.div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="w-full max-w-lg bg-surface border border-ink/10 rounded-2xl overflow-hidden shadow-2xl">

              <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
                <h3 className="font-serif text-lg font-bold">{editing ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-ink/10 rounded-lg transition-colors text-ink/40 hover:text-ink">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Name *</label>
                  <input type="text" placeholder="Classic Chocolate Chip" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink/30 transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Description</label>
                  <textarea placeholder="Short description…" rows={2} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink/30 transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Price (₹) *</label>
                    <input type="number" min="0" step="0.01" placeholder="150" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="px-4 py-2.5 bg-bg border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink/30 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Sort Order</label>
                    <input type="number" min="0" placeholder="0" value={form.sort_order}
                      onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                      className="px-4 py-2.5 bg-bg border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink/30 transition-colors" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-xl font-mono text-sm text-ink focus:outline-none focus:border-ink/30 transition-colors">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Tag / Label</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.map(b => {
                      const active = form.badge === b;
                      const colors: Record<string, { bg: string; text: string }> = {
                        NEW: { bg: '#1A4FE8', text: '#fff' },
                        BESTSELLER: { bg: '#C4752A', text: '#fff' },
                        SEASONAL: { bg: '#c85fa8', text: '#fff' },
                        LIMITED: { bg: '#5C3317', text: '#F5E6D3' },
                      };
                      const col = colors[b];
                      return (
                        <button key={b} type="button"
                          onClick={() => setForm(f => ({ ...f, badge: b }))}
                          className="px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold border transition-all"
                          style={active && col
                            ? { backgroundColor: col.bg, color: col.text, borderColor: col.bg }
                            : active
                            ? { backgroundColor: 'var(--theme-ink)', color: 'var(--theme-bg)', borderColor: 'var(--theme-ink)' }
                            : { backgroundColor: 'transparent', color: 'var(--theme-ink)', opacity: 0.4, borderColor: 'rgba(0,0,0,0.12)' }
                          }>
                          {b || 'None'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Product Image</label>
                  {form.image && (
                    <div className="relative rounded-xl overflow-hidden border border-ink/10">
                      <img src={form.image} alt="Current product image" className="w-full h-44 object-cover" />
                      <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-black/40 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Current image</span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                          className="p-1 bg-black/50 rounded-full text-white hover:bg-red-500/80 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink/15 rounded-xl cursor-pointer hover:border-ink/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}>
                    {uploading
                      ? <Loader2 className="w-4 h-4 animate-spin text-ink/30" />
                      : <Upload className="w-4 h-4 text-ink/30" />}
                    <span className="font-mono text-xs text-ink/35">{uploading ? 'Uploading…' : form.image ? 'Click to replace' : 'Click to upload'}</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                  <input type="url" placeholder="Or paste image URL…" value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink/30 transition-colors" />
                </div>

                <div className="flex flex-col gap-3 p-4 rounded-xl border border-ink/10 bg-bg">
                  <label className="flex items-center justify-between cursor-pointer"
                    onClick={() => setForm(f => ({ ...f, is_limited: !f.is_limited, quantity: '' }))}>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-0.5">Limited Quantity</p>
                      <p className="font-mono text-[10px] text-ink/35">&quot;Only X left!&quot; hype indicator</p>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_limited ? 'bg-amber-500' : 'bg-ink/15'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_limited ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>
                  {form.is_limited && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Stock Quantity</label>
                      <input type="number" min="0" placeholder="e.g. 12" value={form.quantity}
                        onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                        className="px-4 py-2.5 bg-surface border border-ink/10 rounded-xl font-mono text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber-400/60 transition-colors" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 px-6 pb-6 pt-2">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 border border-ink/15 rounded-xl font-mono text-[11px] uppercase tracking-widest text-ink/50 hover:bg-ink/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price}
                  className="flex-1 py-2.5 bg-ink text-bg rounded-xl font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-ink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    : editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
