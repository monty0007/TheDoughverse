import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowLeft, Plus, Check } from 'lucide-react';
import { useFirebaseAuth } from '../store/useFirebaseAuth';
import { getFirebaseAuth } from '../lib/firebase';
import { API_BASE } from '../lib/api';
import { COOKIE_PRODUCTS, type CookieProduct } from '../data/products';
import { useCartStore } from '../store/useCartStore';

const BLUE = '#1A4FE8';
const CREAM = '#FFFCDC';

export function Favourites() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const addItem = useCartStore((s) => s.addItem);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const auth = await getFirebaseAuth();
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${API_BASE}/api/favourites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setFavIds(await res.json());
      } catch (err) {
        console.error('Failed to fetch favourites:', err);
      }
      setLoading(false);
    })();
  }, [user]);

  const removeFav = async (productId: string) => {
    setFavIds((prev) => prev.filter((id) => id !== productId));
    try {
      const auth = await getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_BASE}/api/favourites/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Revert on failure
      setFavIds((prev) => [...prev, productId]);
    }
  };

  const handleAdd = (product: CookieProduct) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 border-3 border-[#1A4FE8]/20 border-t-[#1A4FE8] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const favouriteProducts = COOKIE_PRODUCTS.filter((p) => favIds.includes(p.id));

  return (
    <div className="min-h-screen pt-28 sm:pt-28 pb-20 px-4" style={{ backgroundColor: CREAM }}>
      <div className="max-w-4xl mx-auto">
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
          Favourites
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : favouriteProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: BLUE, opacity: 0.15 }} />
            <p className="text-xl font-bold mb-2" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
              No favourites yet
            </p>
            <p className="text-sm mb-6" style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}>
              Browse cookies and tap the heart to save your favourites here.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {favouriteProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFav(product.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3
                      className="text-lg font-bold leading-snug mb-1"
                      style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}>
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                        ₹{product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAdd(product)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95"
                        style={{
                          backgroundColor: addedId === product.id ? '#2ECC71' : BLUE,
                          fontFamily: '"Nunito", sans-serif',
                        }}
                      >
                        {addedId === product.id ? (
                          <><Check className="w-3.5 h-3.5" /> Added</>
                        ) : (
                          <><Plus className="w-3.5 h-3.5" /> Add</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
