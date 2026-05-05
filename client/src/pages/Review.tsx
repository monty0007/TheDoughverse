import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ThumbsUp, Filter } from 'lucide-react';

const BLUE = 'var(--theme-accent)';
const PINK = '#E8B4D8';
const PAGE_DOT = 'color-mix(in srgb, var(--theme-ink) 18%, transparent)';
const CARD_BORDER = 'color-mix(in srgb, var(--theme-accent) 14%, transparent)';

interface ReviewItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  product: string;
  comment: string;
  helpful: number;
  verified: boolean;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    name: 'Ananya S.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Ananya&backgroundColor=1A4FE8',
    rating: 5,
    date: '2 days ago',
    product: 'Classic Chocolate Chip',
    comment: 'Absolutely divine! The chocolate chunks are generous and the cookie is perfectly chewy in the centre with crispy edges. Best cookies I\'ve ever ordered online.',
    helpful: 24,
    verified: true,
  },
  {
    id: 'r2',
    name: 'Rohan M.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Rohan&backgroundColor=C4752A',
    rating: 5,
    date: '5 days ago',
    product: 'The Grand Hamper',
    comment: 'Gifted this to my mom for her birthday and she loved it! The packaging is stunning and every cookie tasted freshly baked. Will definitely order again.',
    helpful: 18,
    verified: true,
  },
  {
    id: 'r3',
    name: 'Priya K.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Priya&backgroundColor=E8B4D8',
    rating: 4,
    date: '1 week ago',
    product: 'Double Chocolate Cookie',
    comment: 'Rich and decadent — exactly what I needed. The only reason it\'s not 5 stars is I wish the box came with more! Would love a larger pack option.',
    helpful: 12,
    verified: true,
  },
  {
    id: 'r4',
    name: 'Aditya R.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Aditya&backgroundColor=5C3317',
    rating: 5,
    date: '2 weeks ago',
    product: 'Birthday Surprise Box',
    comment: 'Ordered for my daughter\'s birthday. The cookies were colourful, delicious and the birthday card was a lovely touch. She was thrilled!',
    helpful: 31,
    verified: true,
  },
  {
    id: 'r5',
    name: 'Meera T.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Meera&backgroundColor=2ECC71',
    rating: 5,
    date: '2 weeks ago',
    product: 'Peanut Butter Cookie',
    comment: 'The peanut butter flavour is spot on — not too sweet, perfectly salty and incredibly thick. These are comfort food at its finest.',
    helpful: 15,
    verified: true,
  },
  {
    id: 'r6',
    name: 'Vikram J.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Vikram&backgroundColor=1A4FE8',
    rating: 4,
    date: '3 weeks ago',
    product: 'White Chocolate Macadamia',
    comment: 'Lovely combination of creamy white chocolate and crunchy nuts. Delivery was quick and cookies arrived fresh. Great quality overall.',
    helpful: 9,
    verified: true,
  },
  {
    id: 'r7',
    name: 'Kavya N.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Kavya&backgroundColor=E8B4D8',
    rating: 5,
    date: '1 month ago',
    product: 'Snickerdoodle',
    comment: 'Soft, cinnamon-y and absolutely addictive. I\'ve reordered three times already. My go-to comfort cookie!',
    helpful: 22,
    verified: true,
  },
  {
    id: 'r8',
    name: 'Arjun D.',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Arjun&backgroundColor=C4752A',
    rating: 5,
    date: '1 month ago',
    product: 'Thank You Box',
    comment: 'Sent this to a friend as a thank-you and the presentation was gorgeous. The kraft box and personalised tag made it feel really special.',
    helpful: 14,
    verified: true,
  },
];

const FILTER_OPTIONS = ['All', '5 Stars', '4 Stars'];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="transition-colors"
          style={{
            width: size,
            height: size,
            fill: i < rating ? '#F5A623' : 'transparent',
            color: i < rating ? '#F5A623' : 'color-mix(in srgb, var(--theme-accent) 18%, transparent)',
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-3xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--theme-surface)', border: `1px solid ${CARD_BORDER}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={review.avatar}
            alt={review.name}
            className="w-10 h-10 rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 7%, transparent)' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h4
                className="text-sm font-bold"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                {review.name}
              </h4>
              {review.verified && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(46,204,113,0.12)', color: '#2ECC71' }}
                >
                  Verified
                </span>
              )}
            </div>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: 'var(--theme-ink)', opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              {review.date}
            </p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      {/* Product tag */}
      <span
        className="self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-accent) 8%, transparent)',
          color: BLUE,
          fontFamily: '"Nunito", sans-serif',
        }}
      >
        {review.product}
      </span>

      {/* Comment */}
      <div className="relative">
        <Quote
          className="absolute -top-1 -left-1 w-5 h-5"
          style={{ color: BLUE, opacity: 0.12 }}
        />
        <p
          className="text-sm leading-relaxed pl-5"
          style={{ color: 'var(--theme-ink)', opacity: 0.72, fontFamily: '"Nunito", sans-serif' }}
        >
          {review.comment}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: CARD_BORDER }}>
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all"
          style={{
            color: liked ? BLUE : 'color-mix(in srgb, var(--theme-ink) 45%, transparent)',
            fontFamily: '"Nunito", sans-serif',
          }}
        >
          <ThumbsUp className="w-3.5 h-3.5" style={{ fill: liked ? BLUE : 'transparent' }} />
          Helpful ({liked ? review.helpful + 1 : review.helpful})
        </button>
      </div>
    </motion.div>
  );
}

export function Review() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All'
      ? REVIEWS
      : REVIEWS.filter((r) => {
          if (activeFilter === '5 Stars') return r.rating === 5;
          if (activeFilter === '4 Stars') return r.rating === 4;
          return true;
        });

  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);
  const fiveStarCount = REVIEWS.filter((r) => r.rating === 5).length;
  const fiveStarPct = Math.round((fiveStarCount / REVIEWS.length) * 100);

  return (
    <div
      className="min-h-screen pt-36 sm:pt-28 pb-20"
      style={{
        backgroundColor: 'var(--theme-bg)',
        backgroundImage: `radial-gradient(circle, ${PAGE_DOT} 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-none mb-4"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            REVIEWS
          </h1>
          <p
            className="text-sm tracking-wide max-w-md mx-auto"
            style={{ color: 'var(--theme-ink)', opacity: 0.58, fontFamily: '"Nunito", sans-serif' }}
          >
            Real stories from real cookie lovers. See why our community keeps coming back for more.
          </p>
        </motion.div>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <div
              className="text-4xl font-bold"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              {avgRating}
            </div>
            <Stars rating={Math.round(Number(avgRating))} size={16} />
            <p
              className="text-[11px] mt-1 uppercase tracking-wider"
              style={{ color: 'var(--theme-ink)', opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              Average Rating
            </p>
          </div>
          <div className="text-center">
            <div
              className="text-4xl font-bold"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              {REVIEWS.length}
            </div>
            <p
              className="text-[11px] mt-1 uppercase tracking-wider"
              style={{ color: 'var(--theme-ink)', opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              Total Reviews
            </p>
          </div>
          <div className="text-center">
            <div
              className="text-4xl font-bold"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              {fiveStarPct}%
            </div>
            <p
              className="text-[11px] mt-1 uppercase tracking-wider"
              style={{ color: 'var(--theme-ink)', opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              5-Star Reviews
            </p>
          </div>
        </motion.div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: activeFilter === opt ? BLUE : 'transparent',
                color: activeFilter === opt ? '#fff' : BLUE,
                border: `1.5px solid ${activeFilter === opt ? BLUE : CARD_BORDER}`,
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              {opt === 'All' && <Filter className="w-3 h-3" />}
              {opt}
            </button>
          ))}
        </div>

        {/* Reviews grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filtered.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p
            className="text-center py-20 text-lg"
            style={{ color: 'var(--theme-ink)', opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
          >
            No reviews match this filter.
          </p>
        )}
      </div>
    </div>
  );
}
