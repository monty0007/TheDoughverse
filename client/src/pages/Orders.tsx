import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Package, ArrowLeft, Clock, Check, X } from 'lucide-react';
import { useFirebaseAuth } from '../store/useFirebaseAuth';
import { getFirebaseAuth } from '../lib/firebase';
import { API_BASE } from '../lib/api';

const BLUE = '#1A4FE8';
const CREAM = '#FFFCDC';

interface Order {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  items: { id: string; name: string; price: number; quantity: number; image: string }[];
  shipping: { name: string; address: string; city: string; zip: string; phone: string } | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Check; color: string; label: string }> = {
  paid: { icon: Check, color: '#2ECC71', label: 'Paid' },
  created: { icon: Clock, color: '#F39C12', label: 'Pending' },
  failed: { icon: X, color: '#E74C3C', label: 'Failed' },
};

export function Orders() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const auth = await getFirebaseAuth();
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${API_BASE}/api/orders/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setOrders(await res.json());
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 border-3 border-[#1A4FE8]/20 border-t-[#1A4FE8] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pt-28 sm:pt-28 pb-20 px-4" style={{ backgroundColor: CREAM }}>
      <div className="max-w-3xl mx-auto">
        <Link
          to="/profile"
          className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: BLUE, fontFamily: '"Nunito", sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" /> Profile
        </Link>

        <h1
          className="text-4xl sm:text-5xl font-bold mb-10"
          style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
        >
          Order History
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: BLUE, opacity: 0.15 }} />
            <p className="text-xl font-bold mb-2" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
              No orders yet
            </p>
            <p className="text-sm mb-6" style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}>
              Once you place an order, it will appear here.
            </p>
            <Link
              to="/cookies"
              className="inline-block px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: BLUE, fontFamily: '"Nunito", sans-serif' }}
            >
              Browse Cookies
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.created;
              const StatusIcon = cfg.icon;
              const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl p-6 sm:p-8"
                  style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5" style={{ color: BLUE }} />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BLUE, opacity: 0.4 }}>
                          {date}
                        </p>
                        <p className="text-xs font-mono" style={{ color: BLUE, opacity: 0.3 }}>
                          {order.razorpay_order_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}15` }}>
                      <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-ink/5 rounded-xl px-3 py-2">
                        <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-bold" style={{ color: BLUE }}>{item.name}</p>
                          <p className="text-[10px]" style={{ color: BLUE, opacity: 0.4 }}>×{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(26,79,232,0.08)' }}>
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BLUE, opacity: 0.4 }}>
                      Total
                    </span>
                    <span className="text-xl font-bold" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                      ₹{(order.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
