import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Check } from 'lucide-react';
import { COOKIE_PRODUCTS, type CookieProduct } from '../data/products';
import { useCartStore } from '../store/useCartStore';
import { API_BASE } from '../lib/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getFallbackProductImage, getProductImage } from '../lib/productImages';

const BLUE = 'var(--theme-accent)';
const PINK = '#E8B4D8';
const PAGE_DOT = 'color-mix(in srgb, var(--theme-ink) 18%, transparent)';
const CARD_BORDER = 'color-mix(in srgb, var(--theme-accent) 14%, transparent)';

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  NEW: { bg: BLUE, text: '#fff' },
  BESTSELLER: { bg: '#C4752A', text: '#fff' },
  SEASONAL: { bg: PINK, text: BLUE },
  LIMITED: { bg: '#5C3317', text: '#F5E6D3' },
};

function ProductCard({ product }: { product: CookieProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const quantity = useCartStore((s) => s.items.find((item) => item.product.id === product.id)?.quantity ?? 0);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const imageSrc = imgError ? getFallbackProductImage(product) : getProductImage(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group flex flex-col rounded-3xl overflow-hidden"
      style={{ backgroundColor: 'var(--theme-surface)', border: `1px solid ${CARD_BORDER}` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-ink) 7%, transparent)' }}>
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {product.badge && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: BADGE_COLORS[product.badge]?.bg,
              color: BADGE_COLORS[product.badge]?.text,
            }}
          >
            {product.badge}
          </span>
        )}
        {product.is_limited && product.quantity != null && product.quantity > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#5C3317', color: '#F5E6D3' }}
          >
            Only {product.quantity} left!
          </div>
        )}
        {product.is_limited && product.quantity === 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#333', color: '#aaa' }}
          >
            Sold Out
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5">
        <p
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}
        >
          {product.category}
        </p>
        <h3
          className="text-lg font-bold leading-snug mb-2"
          style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
        >
          {product.name}
        </h3>
        <p
          className="text-sm leading-relaxed mb-4 flex-1"
          style={{ color: 'var(--theme-ink)', opacity: 0.68, fontFamily: '"Nunito", sans-serif' }}
        >
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span
            className="text-xl font-bold"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            ₹{product.price.toFixed(2)}
          </span>
          {quantity > 0 ? (
            <div
              className="flex items-center gap-2 rounded-full px-2 py-1.5 min-h-[44px]"
              style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 10%, transparent)', border: `1px solid ${CARD_BORDER}` }}
              aria-label={`${product.name} quantity in cart: ${quantity}`}
            >
              <button
                type="button"
                onClick={() => updateQty(product.id, quantity - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{ backgroundColor: 'var(--theme-surface)', color: BLUE }}
                aria-label={`Remove one ${product.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="min-w-12 text-center leading-none">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2ECC71', fontFamily: '"Nunito", sans-serif' }}>
                  <Check className="w-3 h-3" /> Added
                </div>
                <div className="text-sm font-bold" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                  {quantity}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all active:scale-95"
                style={{ backgroundColor: BLUE }}
                aria-label={`Add one more ${product.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 min-h-[44px]"
              style={{
                backgroundColor: added ? '#2ECC71' : BLUE,
                color: '#fff',
                fontFamily: '"Nunito", sans-serif',
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {added ? 'Added' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Cookies() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q')?.trim() ?? '';
  const [products, setProducts] = useState<CookieProduct[]>(COOKIE_PRODUCTS);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CookieProduct[] = data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            image: p.image,
            category: p.category,
            badge: p.badge ?? undefined,
            is_limited: Boolean(p.is_limited),
            quantity: p.quantity ?? null,
          }));
          setProducts(mapped);
        }
      })
      .catch(() => { /* keep hardcoded fallback */ });
  }, []);

  const filtered = products.filter((p) => {
    return !urlQuery ||
      p.name.toLowerCase().includes(urlQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(urlQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(urlQuery.toLowerCase());
  });

  return (
    <div
      className="min-h-screen pt-36 sm:pt-28 pb-20"
      style={{
        backgroundColor: 'var(--theme-bg)',
        backgroundImage: `radial-gradient(circle, ${PAGE_DOT} 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl sm:text-6xl lg:text-8xl font-bold leading-none mb-4"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            COOKIES
          </h1>
          {urlQuery ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-sm" style={{ color: BLUE, opacity: 0.65, fontFamily: '"Nunito", sans-serif' }}>
              Results for <span className="font-bold italic">"{urlQuery}"</span>
              </p>
            </div>
          ) : (
            <p
              className="text-sm tracking-wide max-w-md mx-auto"
              style={{ color: BLUE, opacity: 0.55, fontFamily: '"Nunito", sans-serif' }}
            >
              Handcrafted, freshly baked, and delivered to your door. Pick your favourites.
            </p>
          )}
        </motion.div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={urlQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20">
            <p
              className="text-center text-lg"
              style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
            >
              {urlQuery
                ? `No cookies match "${urlQuery}"`
                : 'No cookies in this category yet. Check back soon!'}
            </p>
            {urlQuery && (
              <button
                onClick={() => navigate('/cookies')}
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80 min-h-[44px]"
                style={{ backgroundColor: BLUE, color: '#fff', fontFamily: '"Nunito", sans-serif' }}
              >
                View all cookies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
