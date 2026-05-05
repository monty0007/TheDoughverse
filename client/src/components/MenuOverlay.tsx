import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart } from 'lucide-react';
import { useMenuStore } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';
import { OrynLogo } from './OrynLogo';

// ─── Palette ────────────────────────────────────────────────────────────────
const BLUE  = '#1A4FE8';
const CREAM = '#F5F0D8';
const PINK  = '#E8B4D8';
const DOT   = '#c8c29a';

// ─── Menu data ──────────────────────────────────────────────────────────────
const CLASIC = [
  { name: 'Chocochip',  sub: 'con chispas de chocolate' },
  { name: 'Red Velvet', sub: 'con chispas de chocolate blanco' },
  { name: 'Chocolate',  sub: 'con chispas de chocolate' },
  { name: 'Zanahoria',  sub: 'con chispas de chocolate blanco' },
];

const PREMIUM = [
  { name: 'Party',       sub: 'con lentejas de colores' },
  { name: 'Oreo',        sub: 'con trozos de galleta oreo' },
  { name: 'Marshmallow', sub: 'con los clásicos marshmallows' },
  { name: 'Nutella',     sub: 'relleno de nutella y chispas de chocolate' },
];

const BUNDLES = [
  { label: 'Mr. Dúo',      price: '$10' },
  { label: 'Mr. Box',      price: '$25' },
  { label: 'Super Cookie', price: '$45' },
];

// ─── Spring config for the push-slide ───────────────────────────────────────
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 28 };

// ─── Menu panel (slides in from right) ──────────────────────────────────────
function MenuPanel({ onClose }: { onClose: () => void }) {
  const { totalItems } = useCartStore();
  const navigate = useNavigate();
  const cartCount = totalItems();

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

  return (
    <motion.div
      className="fixed top-0 right-0 h-full w-full md:w-[60vw] z-[70] overflow-y-auto"
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
      <div className="p-7 sm:p-12 min-h-full flex flex-col">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-10 gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold leading-none"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            CARTA
          </motion.h1>

          <div className="flex items-center gap-2 mt-2 shrink-0">
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
                  style={{ backgroundColor: PINK, color: BLUE }}
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

        {/* ── Two-column body ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1">

          {/* LEFT — Classic */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
          >
            <p
              className="text-center tracking-[0.25em] text-sm mb-6"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              · CLASIC ·
            </p>
            <div className="space-y-5">
              {CLASIC.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.35 }}
                >
                  <p
                    className="text-2xl font-bold leading-tight"
                    style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                  >
                    {item.name.toUpperCase()}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: BLUE, opacity: 0.55 }}>
                    {item.sub}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Pricing + Premium */}
          <motion.div
            className="flex flex-col gap-7"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.45 }}
          >
            {/* Pink blob pricing badge */}
            <div
              className="px-6 py-5 text-center"
              style={{
                backgroundColor: PINK,
                borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%',
              }}
            >
              <p
                className="text-xs italic mb-3 leading-snug"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                Baking with love · MR.
              </p>
              <div className="space-y-1">
                {BUNDLES.map(({ label, price }) => (
                  <div key={label} className="flex items-baseline justify-center gap-2">
                    <span className="text-sm" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                      {label}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                      {price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium */}
            <div>
              <p
                className="text-center tracking-[0.25em] text-sm mb-6"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                · PREMIUM ·
              </p>
              <div className="space-y-5">
                {PREMIUM.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
                  >
                    <p
                      className="text-2xl font-bold leading-tight"
                      style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                    >
                      {item.name.toUpperCase()}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: BLUE, opacity: 0.55 }}>
                      {item.sub}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Mascot ───────────────────────────────────────────────────── */}
        <motion.div
          className="flex justify-start mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="w-24 h-28" style={{ color: BLUE }}>
            <OrynLogo />
          </div>
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
