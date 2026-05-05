import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Plus, Check } from 'lucide-react';
import { useMenuStore } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';
import { COOKIE_PRODUCTS } from '../data/products';
import { getProductImage } from '../lib/productImages';

// ─── Palette ────────────────────────────────────────────────────────────────
const BLUE  = '#1A4FE8';
const CREAM = '#F5F0D8';
const DOT   = '#c8c29a';

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  BESTSELLER: { bg: '#1A4FE8', color: '#fff' },
  NEW:        { bg: '#2ECC71', color: '#fff' },
  SEASONAL:   { bg: '#E67E22', color: '#fff' },
  LIMITED:    { bg: '#E74C3C', color: '#fff' },
};

// ─── Spring config ───────────────────────────────────────────────────────────
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 28 };

// ─── Menu panel (slides in from right) ──────────────────────────────────────
function MenuPanel({ onClose }: { onClose: () => void }) {
  const { totalItems, addItem, items } = useCartStore();
  const navigate = useNavigate();
  const cartCount = totalItems();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAdd = (product: (typeof COOKIE_PRODUCTS)[0]) => {
    addItem(product);
    setJustAdded(product.id);
    setTimeout(() => setJustAdded(null), 1200);
  };

  return (
    <motion.div
      className="fixed top-0 right-0 h-full w-full md:w-[56vw] lg:w-[48vw] z-[70] overflow-y-auto"
      style={{
        backgroundColor: CREAM,
        backgroundImage: `radial-gradient(circle, ${DOT} 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={SPRING}
      role="dialog"
      aria-modal="true"
      aria-label="Menu card"
    >
      <div className="p-6 sm:p-10 min-h-full flex flex-col">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-4xl sm:text-5xl font-bold leading-none"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              Our Cookies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs mt-1 uppercase tracking-widest font-bold"
              style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              Eggless · Baked fresh on order
            </motion.p>
          </div>

          <div className="flex items-center gap-2 mt-1 shrink-0">
            <button
              onClick={() => { onClose(); navigate('/cart'); }}
              className="relative p-2.5 rounded-full text-white transition-all hover:scale-105"
              style={{ backgroundColor: BLUE }}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
                  style={{ backgroundColor: '#E8B4D8', color: BLUE }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-white transition-all hover:scale-105"
              style={{ backgroundColor: BLUE }}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Product list ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {COOKIE_PRODUCTS.map((product, i) => {
            const inCart = items.some(ci => ci.product.id === product.id);
            const added = justAdded === product.id;
            const badge = product.badge ? BADGE_STYLE[product.badge] : null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.05, duration: 0.35 }}
                className="flex items-center gap-4 rounded-2xl p-3 pr-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.65)', border: '1px solid rgba(26,79,232,0.08)' }}
              >
                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold truncate" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                      {product.name}
                    </p>
                    {badge && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}>
                    {product.description}
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                    ₹{product.price}
                  </p>
                </div>

                {/* Add button */}
                <motion.button
                  onClick={() => handleAdd(product)}
                  whileTap={{ scale: 0.88 }}
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors"
                  style={{ backgroundColor: added ? '#2ECC71' : inCart ? `${BLUE}cc` : BLUE }}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer CTA ───────────────────────────────────────────────── */}
        <motion.div
          className="mt-8 flex gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => { onClose(); navigate('/cookies'); }}
            className="flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: BLUE, color: '#fff', fontFamily: '"Nunito", sans-serif' }}
          >
            See all cookies →
          </button>
          {cartCount > 0 && (
            <button
              onClick={() => { onClose(); navigate('/cart'); }}
              className="flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: '#2ECC71', color: '#fff', fontFamily: '"Nunito", sans-serif' }}
            >
              View cart ({cartCount})
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────
export function MenuOverlay() {
  const { isOpen, close } = useMenuStore();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dim backdrop — clicking closes */}
          <motion.div
            className="fixed inset-0 z-[60] cursor-pointer"
            style={{ backgroundColor: 'rgba(10,10,10,0.45)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            aria-hidden="true"
          />
          <MenuPanel onClose={close} />
        </>
      )}
    </AnimatePresence>
  );
}
