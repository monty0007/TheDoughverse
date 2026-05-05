import { AdminLayout } from './AdminLayout';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check, X, Package, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import toast from 'react-hot-toast';

const BLUE = '#1A4FE8';
const CREAM = '#F5F0D8';

type AdminStatus = 'pending' | 'accepted' | 'rejected' | 'fulfilled';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Shipping {
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

interface Order {
  id: number;
  order_number: string | null;
  firebase_uid: string | null;
  amount: number;
  currency: string;
  status: string;
  admin_status: AdminStatus;
  items: OrderItem[];
  shipping: Shipping | null;
  created_at: string;
}

const STATUS_CONFIG: Record<AdminStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: '#B45309', bg: 'rgba(180,83,9,0.1)',    icon: <Clock className="w-3.5 h-3.5" /> },
  accepted:  { label: 'Accepted',  color: '#065F46', bg: 'rgba(6,95,70,0.1)',     icon: <Check className="w-3.5 h-3.5" /> },
  rejected:  { label: 'Rejected',  color: '#991B1B', bg: 'rgba(153,27,27,0.1)',   icon: <X className="w-3.5 h-3.5" /> },
  fulfilled: { label: 'Fulfilled', color: BLUE,      bg: 'rgba(26,79,232,0.1)',   icon: <Package className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: AdminStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: '"Nunito", sans-serif' }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<AdminStatus | 'all'>('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/all`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, admin_status: AdminStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_status }),
      });
      if (!res.ok) throw new Error('Failed');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, admin_status } : o));
      toast.success(`Order marked as ${admin_status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.admin_status === filter);
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.admin_status === 'pending').length,
    accepted: orders.filter(o => o.admin_status === 'accepted').length,
    rejected: orders.filter(o => o.admin_status === 'rejected').length,
    fulfilled: orders.filter(o => o.admin_status === 'fulfilled').length,
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              Orders
            </h1>
            <p
              className="text-xs uppercase tracking-widest mt-1"
              style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              {counts.all} total · {counts.pending} pending
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(26,79,232,0.08)', color: BLUE, fontFamily: '"Nunito", sans-serif' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {(['all', 'pending', 'accepted', 'rejected', 'fulfilled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                backgroundColor: filter === f ? BLUE : 'rgba(26,79,232,0.07)',
                color: filter === f ? '#fff' : BLUE,
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              {f === 'all' ? 'All' : f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-3xl animate-pulse" style={{ backgroundColor: 'rgba(26,79,232,0.06)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: BLUE, opacity: 0.15 }} />
            <p className="text-sm font-bold" style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}>
              No orders yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {filtered.map(order => {
                const isOpen = expanded === order.id;
                const cfg = STATUS_CONFIG[order.admin_status] ?? STATUS_CONFIG.pending;
                const total = (order.amount / 100).toFixed(0);
                const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-3xl overflow-hidden"
                    style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
                  >
                    {/* Row */}
                    <button
                      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-blue-50/30"
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-bold"
                            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                          >
                            {order.order_number ?? `#${order.id}`}
                          </span>
                          <StatusBadge status={order.admin_status} />
                        </div>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}>
                          {order.shipping?.name ?? 'Guest'} · {date}
                        </p>
                      </div>
                      <span className="font-bold text-lg shrink-0" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                        ₹{total}
                      </span>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: BLUE, opacity: 0.4 }} />
                        : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: BLUE, opacity: 0.4 }} />
                      }
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(26,79,232,0.07)' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                              {/* Items */}
                              <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}>Items</p>
                                <div className="flex flex-col gap-2">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                      {item.image && (
                                        <img src={item.image} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate" style={{ color: BLUE, fontFamily: '"Nunito", sans-serif' }}>{item.name}</p>
                                        <p className="text-[10px]" style={{ color: BLUE, opacity: 0.45 }}>×{item.quantity} · ₹{(item.price * item.quantity).toFixed(0)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping */}
                              {order.shipping && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}>Shipping</p>
                                  <div className="flex flex-col gap-1 text-xs" style={{ color: BLUE, fontFamily: '"Nunito", sans-serif' }}>
                                    <p className="font-bold">{order.shipping.name}</p>
                                    <p style={{ opacity: 0.65 }}>{order.shipping.phone}</p>
                                    <p style={{ opacity: 0.65 }}>{order.shipping.address}, {order.shipping.city} — {order.shipping.zip}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-wrap mt-5 pt-4" style={{ borderTop: '1px solid rgba(26,79,232,0.07)' }}>
                              {(['pending', 'accepted', 'rejected', 'fulfilled'] as AdminStatus[]).map(s => (
                                <button
                                  key={s}
                                  disabled={order.admin_status === s || updating === order.id}
                                  onClick={() => updateStatus(order.id, s)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40"
                                  style={{
                                    backgroundColor: order.admin_status === s ? STATUS_CONFIG[s].color : STATUS_CONFIG[s].bg,
                                    color: order.admin_status === s ? '#fff' : STATUS_CONFIG[s].color,
                                    fontFamily: '"Nunito", sans-serif',
                                  }}
                                >
                                  {STATUS_CONFIG[s].icon}
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
