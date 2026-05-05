import { motion } from 'motion/react';
import { Gift as GiftIcon, Plus, Check, Heart, Sparkles, Package } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import type { CookieProduct } from '../data/products';

const BLUE = 'var(--theme-accent)';
const PINK = '#E8B4D8';
const PAGE_DOT = 'color-mix(in srgb, var(--theme-ink) 18%, transparent)';
const CARD_BORDER = 'color-mix(in srgb, var(--theme-accent) 14%, transparent)';

interface GiftBox {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  cookies: number;
}

const GIFT_BOXES: GiftBox[] = [
  {
    id: 'gift-1',
    name: 'The Classic Box',
    description: 'A curated selection of 6 classic cookies, wrapped in our signature gift box with a handwritten note.',
    price: 799,
    image: 'https://images.pexels.com/photos/6479543/pexels-photo-6479543.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'BESTSELLER',
    cookies: 6,
  },
  {
    id: 'gift-2',
    name: 'Chocolate Lovers Box',
    description: '8 rich chocolate cookies featuring double chocolate, triple chunk, and white chocolate macadamia.',
    price: 1099,
    image: 'https://images.pexels.com/photos/4110003/pexels-photo-4110003.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'POPULAR',
    cookies: 8,
  },
  {
    id: 'gift-3',
    name: 'The Grand Hamper',
    description: '12 assorted cookies in a premium wooden box with ribbon — the ultimate cookie gift for any occasion.',
    price: 1799,
    image: 'https://images.pexels.com/photos/5847093/pexels-photo-5847093.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'PREMIUM',
    cookies: 12,
  },
  {
    id: 'gift-4',
    name: 'Birthday Surprise Box',
    description: '6 festive cookies with sprinkles and a birthday card — ready to make someone\'s day sweeter.',
    price: 899,
    image: 'https://images.pexels.com/photos/6479600/pexels-photo-6479600.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'NEW',
    cookies: 6,
  },
  {
    id: 'gift-5',
    name: 'Thank You Box',
    description: 'A sweet thank-you with 4 signature cookies in an elegant kraft box and personalised tag.',
    price: 549,
    image: 'https://images.pexels.com/photos/3992134/pexels-photo-3992134.jpeg?auto=compress&cs=tinysrgb&w=600',
    cookies: 4,
  },
  {
    id: 'gift-6',
    name: 'Holiday Collection',
    description: '10 seasonal cookies with warm spices, festive sprinkles and holiday-themed packaging.',
    price: 1399,
    image: 'https://images.pexels.com/photos/5848093/pexels-photo-5848093.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'SEASONAL',
    cookies: 10,
  },
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  BESTSELLER: { bg: '#C4752A', text: '#fff' },
  POPULAR: { bg: BLUE, text: '#fff' },
  PREMIUM: { bg: '#5C3317', text: '#F5E6D3' },
  NEW: { bg: BLUE, text: '#fff' },
  SEASONAL: { bg: PINK, text: BLUE },
};

function GiftCard({ box }: { box: GiftBox }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const asProduct: CookieProduct = {
      id: box.id,
      name: box.name,
      description: box.description,
      price: box.price,
      image: box.image,
      category: 'Gift Box',
    };
    addItem(asProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

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
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={box.image}
          alt={box.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {box.tag && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: TAG_COLORS[box.tag]?.bg ?? BLUE,
              color: TAG_COLORS[box.tag]?.text ?? '#fff',
            }}
          >
            {box.tag}
          </span>
        )}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-surface) 90%, transparent)', color: BLUE, fontFamily: '"Nunito", sans-serif' }}
        >
          <Package className="w-3 h-3" />
          {box.cookies} cookies
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5">
        <p
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}
        >
          Gift Box
        </p>
        <h3
          className="text-lg font-bold leading-snug mb-2"
          style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
        >
          {box.name}
        </h3>
        <p
          className="text-sm leading-relaxed mb-4 flex-1"
          style={{ color: 'var(--theme-ink)', opacity: 0.68, fontFamily: '"Nunito", sans-serif' }}
        >
          {box.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span
            className="text-xl font-bold"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            ₹{box.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            style={{
              backgroundColor: added ? '#2ECC71' : BLUE,
              color: '#fff',
              fontFamily: '"Nunito", sans-serif',
            }}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Gift() {
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <GiftIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: BLUE }} />
            <h1
              className="text-4xl sm:text-6xl lg:text-8xl font-bold leading-none"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              GIFTS
            </h1>
          </div>
          <p
            className="text-sm tracking-wide"
            style={{ color: BLUE, opacity: 0.55, fontFamily: '"Nunito", sans-serif' }}
          >
            Beautifully packaged cookie boxes for every occasion — birthdays, holidays, thank-yous, or just because.
          </p>
        </motion.div>

        {/* Perks banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {[
            { icon: <Heart className="w-4 h-4" />, label: 'Handwritten Note' },
            { icon: <Package className="w-4 h-4" />, label: 'Premium Packaging' },
            { icon: <Sparkles className="w-4 h-4" />, label: 'Freshly Baked to Order' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-accent) 8%, transparent)',
                color: BLUE,
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              {icon}
              {label}
            </div>
          ))}
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {GIFT_BOXES.map((box) => (
            <GiftCard key={box.id} box={box} />
          ))}
        </div>
      </div>
    </div>
  );
}
