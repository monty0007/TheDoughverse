import { AdminLayout } from './AdminLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Tags as TagsIcon, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE } from '../../lib/api';
import toast from 'react-hot-toast';

interface Tag {
  id: string;
  name: string;
  slug: string;
  image_count?: number;
}

export function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTags = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/tags`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setTags(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTags(); }, []);

  const openAdd = () => { setEditing(null); setName(''); setShowModal(true); };
  const openEdit = (t: Tag) => { setEditing(t); setName(t.name); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setName(''); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Tag name is required'); return; }
    setSaving(true);
    try {
      const url = editing
        ? `${API_BASE}/api/admin/tags/${editing.id}`
        : `${API_BASE}/api/admin/tags`;
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
      toast.success(editing ? 'Tag renamed' : 'Tag created');
      closeModal();
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Tag) => {
    if (!confirm(`Delete tag "${t.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/tags/${t.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
      toast.success('Tag deleted');
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete tag');
    }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-1">Tags</h2>
            <p className="text-ink/60 font-mono text-xs uppercase tracking-widest">{tags.length} tags</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-bg font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-ink/80 transition-colors shadow-lg">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Tag</span>
          </button>
        </div>

        {/* Tag list */}
        <div className="bg-surface border border-ink/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-ink/5">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="h-4 bg-ink/10 rounded w-24" />
                  <div className="h-3 bg-ink/5 rounded w-12 ml-auto" />
                </div>
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-ink/30">
              <TagsIcon className="w-10 h-10 mb-3" />
              <p className="font-mono text-xs uppercase tracking-widest">No tags yet</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {tags.map(t => (
                <motion.div key={t.id} layout className="flex items-center gap-4 px-4 py-3 hover:bg-ink/[0.03] transition-colors">
                  <TagsIcon className="w-4 h-4 text-ink/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold truncate">{t.name}</p>
                    <p className="font-mono text-[10px] text-ink/30 uppercase tracking-widest">{t.slug}</p>
                  </div>
                  {t.image_count != null && (
                    <span className="font-mono text-[10px] text-ink/40 uppercase tracking-widest shrink-0">
                      {t.image_count} {t.image_count === 1 ? 'image' : 'images'}
                    </span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-ink/10 transition-colors text-ink/40 hover:text-ink">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400/60 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-surface border border-ink/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-ink/10">
                <h3 className="font-serif text-xl font-bold">{editing ? 'Rename Tag' : 'New Tag'}</h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-ink/10 rounded-lg transition-colors text-ink/50 hover:text-ink">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Tag Name *</label>
                  <input type="text" placeholder="e.g. cyberpunk" value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                    autoFocus
                    className="px-4 py-2.5 bg-bg border border-ink/10 rounded-lg font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 border border-ink/15 rounded-lg font-mono text-xs uppercase tracking-widest text-ink/60 hover:bg-ink/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !name.trim()}
                  className="flex-1 py-2.5 bg-ink text-bg rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:bg-ink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    : editing ? 'Rename' : 'Create'
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
