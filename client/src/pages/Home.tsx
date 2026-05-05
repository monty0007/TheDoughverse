import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import ImageTrail, { ImageTrailItem } from '../components/ImageTrail';
import { useMenuStore } from '../store/useMenuStore';
import { COOKIE_PRODUCTS } from '../data/products';

const trailImages = COOKIE_PRODUCTS.map((p) => p.image);

// Story section images (match card order)
const STORY_IMAGES = [
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop',
  COOKIE_PRODUCTS[0].image,
  'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&q=80&fit=crop',
];



const STORY_CARDS = [
  {
    num: '01',
    title: 'Cookies make people happy',
    body: ['Cookies are the perfect desserts ever! They are sinfully delicious, can double up as a go to snack or as a perfect post-dinner dessert!', 'Plus, who has ever said no to a cookie?'],
    cta: 'See our cookies →',
    img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80&fit=crop',
  },
  {
    num: '02',
    title: 'Freshly Baked & Eggless',
    body: ['All our cookies are eggless and baked on order. This means that everytime you receive a cookie pack, it was baked just for you!', "We are also 100% Eggless because we don't want any of you to hesitate before trying them out!"],
    cta: 'Check our flavours',
    img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&fit=crop',
  },
  {
    num: '03',
    title: 'Shipped Pan India',
    body: ['Our cookies have been shipped to 2000+ locations in India.', 'Wherever you stay, cookies can reach you in maximum 3–5 days.'],
    cta: 'Shop Cookies',
    img: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80&fit=crop',
  },
  {
    num: '04',
    title: 'Coming Soon',
    body: ['Something special is baking. Stay tuned!'],
    cta: null,
    img: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80&fit=crop',
  },
];

function MobileStorySection({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="md:hidden relative z-[1]" style={{ backgroundColor: '#3B1F0E' }}>
      {/* subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='12' fill='%23C4752A'/%3E%3Ccircle cx='26' cy='26' r='2' fill='%233B1F0E'/%3E%3Ccircle cx='34' cy='28' r='1.8' fill='%233B1F0E'/%3E%3Ccircle cx='28' cy='34' r='1.6' fill='%233B1F0E'/%3E%3Ccircle cx='33' cy='33' r='1.4' fill='%233B1F0E'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-0 py-12 px-5">
        {STORY_CARDS.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-14"
          >
            {/* Text */}
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: '#C4752A', fontFamily: '"Fredoka One", cursive' }}>{card.num}</p>
            <h2 className="mb-4 leading-tight" style={{ fontSize: 'clamp(1.6rem, 7vw, 2.4rem)', fontFamily: '"Fredoka One", cursive', color: '#F5E6D3' }}>
              {card.title}
            </h2>
            {card.body.map((p, pi) => (
              <p key={pi} className="mb-2 text-base" style={{ lineHeight: 1.75, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>{p}</p>
            ))}
            {card.cta && (
              <button
                onClick={onNavigate}
                className="mt-5 rounded-full transition-all active:scale-95 min-h-[44px]"
                style={{ padding: '11px 24px', backgroundColor: '#C4752A', color: '#FFF8EE', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '0.95rem', borderRadius: 999 }}
              >
                {card.cta}
              </button>
            )}
            {/* Big image below text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
              className="mt-6 w-full rounded-3xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '4/3', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <img
                src={card.img}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function MobileHero({ images, onMenu, onShop, onLogoTap }: { images: string[]; onMenu: () => void; onShop: () => void; onLogoTap: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3200);
    return () => clearInterval(t);
  }, [images.length]);

  const featured = images[idx] ?? images[0];

  return (
    <section className="md:hidden relative w-full overflow-hidden px-5 pt-6 pb-10" aria-label="Hero">
      {/* Soft glows */}
      <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'var(--color-blush)', opacity: 0.18 }} aria-hidden="true" />
      <div className="absolute top-1/3 -left-24 w-[260px] h-[260px] rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.10 }} aria-hidden="true" />

      {/* Hidden admin tap target — 5 quick taps */}
      <button
        onClick={onLogoTap}
        className="absolute top-2 right-2 w-10 h-10 opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Eyebrow pill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
        style={{ backgroundColor: 'rgba(9,103,216,0.10)', border: '1px solid rgba(9,103,216,0.25)' }}
      >
        <span className="text-base leading-none">🍪</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--color-accent)', fontFamily: '"Nunito", sans-serif' }}>
          Handcrafted · Eggless
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
        className="relative font-serif font-bold tracking-tight text-ink leading-[0.95] mb-1 select-none"
        style={{ fontSize: 'clamp(2.6rem, 11vw, 3.6rem)' }}
      >
        Fresh Baked,
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
        className="relative font-serif font-light italic tracking-tight text-accent leading-[0.95] mb-4 select-none"
        style={{ fontSize: 'clamp(2.6rem, 11vw, 3.6rem)' }}
      >
        Every Day.
      </motion.p>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="relative text-base text-ink/70 mb-6 max-w-sm"
        style={{ fontFamily: '"Nunito", sans-serif', lineHeight: 1.55 }}
      >
        Small-batch eggless cookies, baked the day they ship — straight to your door across India.
      </motion.p>

      {/* Featured image card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        className="relative w-full rounded-[28px] overflow-hidden shadow-2xl mb-5"
        style={{ aspectRatio: '4/5', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* image stack with crossfade */}
        {images.map((src, i) => (
          <motion.img
            key={src + i}
            src={src}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        ))}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
        {/* floating badge */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white" style={{ fontFamily: '"Nunito", sans-serif' }}>Baking now</span>
        </div>
        {/* caption */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white text-sm font-bold tracking-wide" style={{ fontFamily: '"Fredoka One", cursive' }}>Today's Bake</p>
          <p className="text-white/80 text-xs mt-0.5" style={{ fontFamily: '"Nunito", sans-serif' }}>Out of the oven · ships fresh</p>
        </div>
      </motion.div>


      {/* CTAs */}
      <div className="relative flex flex-col gap-3 mb-7">
        <button
          onClick={onShop}
          className="w-full rounded-full font-bold text-white shadow-lg shadow-accent/25 active:scale-[0.98] transition-transform min-h-[52px]"
          style={{ backgroundColor: 'var(--color-accent)', fontFamily: '"Nunito", sans-serif', fontSize: '1rem', letterSpacing: '0.02em' }}
        >
          Shop Cookies →
        </button>
        <button
          onClick={onMenu}
          className="w-full rounded-full font-bold active:scale-[0.98] transition-transform min-h-[52px] text-ink"
          style={{ backgroundColor: 'transparent', border: '1.5px solid rgba(127,127,127,0.35)', fontFamily: '"Nunito", sans-serif', fontSize: '1rem', letterSpacing: '0.02em' }}
        >
          See Menu Card
        </button>
      </div>

      {/* Trust strip */}
      <div className="relative grid grid-cols-3 gap-3 pt-5" style={{ borderTop: '1px solid rgba(127,127,127,0.18)' }}>
        {[
          { icon: '🥚', label: '100%', sub: 'Eggless' },
          { icon: '🚚', label: '2000+', sub: 'Locations' },
          { icon: '⏱️', label: '3–5d', sub: 'Delivery' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <span className="text-xl mb-1" aria-hidden="true">{item.icon}</span>
            <span className="text-sm font-bold text-ink" style={{ fontFamily: '"Fredoka One", cursive' }}>{item.label}</span>
            <span className="text-[10px] uppercase tracking-widest text-ink/55 mt-0.5" style={{ fontFamily: '"Nunito", sans-serif' }}>{item.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Home() {
  const [trailActive, setTrailActive] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Hero box dynamic sizing for revolving text
  const heroBoxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = heroBoxRef.current;
    if (!el) return;
    let prev = { w: 0, h: 0 };
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 10 && h > 10 && (w !== prev.w || h !== prev.h)) {
        prev = { w, h };
        setBoxSize({ w, h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Revolving text animation — single textPath, ever-increasing offset (no jump, no doubling)
  const tp1Ref = useRef<SVGTextPathElement>(null);
  useEffect(() => {
    if (!boxSize || !isDesktop) return;
    let frame: number;
    const speed = 0.003; // % of path length per ms
    const start = performance.now();
    const tick = (now: number) => {
      const pct = (now - start) * speed;
      tp1Ref.current?.setAttribute('startOffset', `${pct}%`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [boxSize, isDesktop]);

  // Horizontal-scroll heading
  const headingOuterRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: headingProgress } = useScroll({ target: headingOuterRef, offset: ['start start', 'end end'] });
  const headingX = useTransform(headingProgress, [0, 1], ['5%', '-60%']);

  // Sticky scroll story
  const storyOuterRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: storyProgress } = useScroll({ target: storyOuterRef, offset: ['start start', 'end end'] });

  // Per-card: text Y (bottom→center→up), text opacity, image X (right→center→left), image opacity
  // Card 0: 0–0.25
  const c0tY = useTransform(storyProgress, [0, 0.06, 0.18, 0.25], ['80%', '0%', '0%', '-80%']);
  const c0tO = useTransform(storyProgress, [0, 0.06, 0.18, 0.25], [0, 1, 1, 0]);
  const c0iX = useTransform(storyProgress, [0.04, 0.12, 0.18, 0.25], ['100%', '0%', '0%', '-60%']);
  const c0iO = useTransform(storyProgress, [0.04, 0.12, 0.18, 0.25], [0, 1, 1, 0]);
  // Card 1: 0.25–0.5
  const c1tY = useTransform(storyProgress, [0.25, 0.31, 0.43, 0.5], ['80%', '0%', '0%', '-80%']);
  const c1tO = useTransform(storyProgress, [0.25, 0.31, 0.43, 0.5], [0, 1, 1, 0]);
  const c1iX = useTransform(storyProgress, [0.29, 0.37, 0.43, 0.5], ['100%', '0%', '0%', '-60%']);
  const c1iO = useTransform(storyProgress, [0.29, 0.37, 0.43, 0.5], [0, 1, 1, 0]);
  // Card 2: 0.5–0.75
  const c2tY = useTransform(storyProgress, [0.5, 0.56, 0.68, 0.75], ['80%', '0%', '0%', '-80%']);
  const c2tO = useTransform(storyProgress, [0.5, 0.56, 0.68, 0.75], [0, 1, 1, 0]);
  const c2iX = useTransform(storyProgress, [0.54, 0.62, 0.68, 0.75], ['100%', '0%', '0%', '-60%']);
  const c2iO = useTransform(storyProgress, [0.54, 0.62, 0.68, 0.75], [0, 1, 1, 0]);
  // Card 3: 0.75–1
  const c3tY = useTransform(storyProgress, [0.75, 0.81, 1], ['80%', '0%', '0%']);
  const c3tO = useTransform(storyProgress, [0.75, 0.81, 1], [0, 1, 1]);
  const c3iX = useTransform(storyProgress, [0.79, 0.87, 1], ['100%', '0%', '0%']);
  const c3iO = useTransform(storyProgress, [0.79, 0.87, 1], [0, 1, 1]);

  // Mobile-only: images accumulate at bottom and stay until the section ends
  const m0O = useTransform(storyProgress, [0.04, 0.12, 0.97, 1.0], [0, 1, 1, 0]);
  const m0Y = useTransform(storyProgress, [0.04, 0.12], [40, 0]);
  const m1O = useTransform(storyProgress, [0.29, 0.37, 0.97, 1.0], [0, 1, 1, 0]);
  const m1Y = useTransform(storyProgress, [0.29, 0.37], [40, 0]);
  const m2O = useTransform(storyProgress, [0.54, 0.62, 0.97, 1.0], [0, 1, 1, 0]);
  const m2Y = useTransform(storyProgress, [0.54, 0.62], [40, 0]);
  const m3O = useTransform(storyProgress, [0.79, 0.87, 0.97, 1.0], [0, 1, 1, 0]);
  const m3Y = useTransform(storyProgress, [0.79, 0.87], [40, 0]);
  const mImages = [STORY_IMAGES[0], STORY_IMAGES[1], STORY_IMAGES[2], STORY_IMAGES[3]];
  const mOpacities = [m0O, m1O, m2O, m3O];
  const mYs = [m0Y, m1Y, m2Y, m3Y];

  const navigate = useNavigate();
  const { open: openMenu, isOpen: menuOpen } = useMenuStore();

  // Hidden admin route — 5 quick taps on logo
  const adminTapCount = React.useRef(0);
  const adminTapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLogoTap = () => {
    adminTapCount.current += 1;
    if (adminTapTimer.current) clearTimeout(adminTapTimer.current);
    if (adminTapCount.current >= 5) {
      adminTapCount.current = 0;
      navigate('/admin');
      return;
    }
    adminTapTimer.current = setTimeout(() => { adminTapCount.current = 0; }, 1500);
  };

  // Hidden admin route via URL
  const handleHeroClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.adminTrigger) {
      navigate('/admin');
    }
  };

  return (
    <motion.div
      className="bg-bg text-ink pt-[6.5rem] sm:pt-24"
      initial={false}
      animate={menuOpen ? { x: '-8%', scale: 0.96, opacity: 0.6 } : { x: '0%', scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      style={{ transformOrigin: 'left center' }}
    >
      {/* Main content — sits on top of the sticky footer */}
      <div className="relative z-[1] bg-bg min-h-[100dvh] flex flex-col">
      {/* ─── Mobile Hero (clean, premium mobile design) ───────── */}
      <MobileHero
        images={trailImages}
        onMenu={openMenu}
        onShop={() => navigate('/cookies')}
        onLogoTap={handleLogoTap}
      />

      {/* ─── Hero (Desktop / tablet only) ──────────────────────── */}
      <section className="hidden md:flex relative w-full min-h-[calc(100dvh-6.5rem)] sm:h-[calc(100vh-6rem)] flex-col items-center overflow-hidden" aria-label="Hero">
        {/* Background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block sm:w-[700px] sm:h-[700px] bg-accent/8 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 right-0 hidden sm:block sm:w-[450px] sm:h-[450px] bg-blush/20 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 hidden sm:block sm:w-[400px] sm:h-[400px] bg-blush/10 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true" />

        {/* Image Trail — Desktop only */}
        {isDesktop && <div className="absolute inset-0 z-0 hidden lg:block">
          <ImageTrail
            className="absolute inset-0 z-0"
            disabled={!trailActive}
            threshold={50}
            repeatChildren={2}
            keyframes={{ opacity: [0, 1, 1, 0], scale: [0.85, 1.05, 1.05, 0.85] }}
            keyframesOptions={{ duration: 1.5, times: [0, 0.1, 0.8, 1] }}
          >
            {trailImages.map((img, i) => (
              <ImageTrailItem key={i} className="w-44 h-44 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl pointer-events-none border-2 border-blush/30">
                <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </ImageTrailItem>
            ))}
          </ImageTrail>
        </div>}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center w-full h-full pt-20 pb-16 sm:pt-0 sm:pb-16 max-w-6xl mx-auto pointer-events-none"
        >
          {/* Hero headline */}
          <div
            className="flex-1 flex flex-col items-center justify-center w-full px-4 gap-6 pointer-events-auto cursor-default"
            onClick={handleHeroClick}
          >
            <div
              ref={heroBoxRef}
              className="text-center relative px-10 py-14 sm:px-24 sm:py-20 rounded-3xl"
              onMouseEnter={() => setTrailActive(false)}
              onMouseLeave={() => setTrailActive(true)}
            >
              {/* Invisible admin tap target on the logo area — 5 taps navigates to /admin */}
              <button
                onClick={handleLogoTap}
                className="absolute top-2 right-2 w-8 h-8 opacity-0 pointer-events-auto"
                aria-hidden="true"
                tabIndex={-1}
              />
              {/* Revolving border text — JS-animated, dual textPath for seamless loop */}
              {isDesktop && boxSize && (() => {
                const { w, h } = boxSize;
                const r = 28;
                const cx = Math.round(w / 2);
                // CW rounded-rect starting at bottom-center (behind button)
                // CCW path so text ascenders point OUTWARD (away from box interior)
                const d = `M ${cx},${h - 1} H ${r} A ${r},${r} 0 0 0 1,${h - r} V ${r} A ${r},${r} 0 0 0 ${r},1 H ${w - r} A ${r},${r} 0 0 0 ${w - 1},${r} V ${h - r} A ${r},${r} 0 0 0 ${w - r},${h - 1} Z`;
                const segment = 'HANDCRAFTED COOKIES  ·  DELIVERED TO YOUR DOOR  ·  ';
                const fullText = segment.repeat(20);
                return (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox={`0 0 ${w} ${h}`}
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <path id="revolve" d={d} fill="none" />
                      {/* Clip: hide bottom strip so upside-down bottom text never shows */}
                      <clipPath id="tickerClip">
                        <rect x="-20" y="-20" width={w + 40} height={h - 10} />
                      </clipPath>
                    </defs>
                    {/* Single copy — ever-increasing offset, seamless because text repeats */}
                    <text
                      fill="currentColor"
                      className="text-ink"
                      fontSize="11"
                      fontFamily='"Nunito", sans-serif'
                      fontWeight="700"
                      letterSpacing="3.5"
                      opacity="0.65"
                      clipPath="url(#tickerClip)"
                    >
                      <textPath ref={tp1Ref} href="#revolve" startOffset="0%">
                        {fullText}
                      </textPath>
                    </text>
                  </svg>
                );
              })()}
              <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                <p className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-bold tracking-tight text-ink leading-[0.95] select-none">
                  Fresh Baked,
                </p>
                <p className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-serif font-light italic tracking-tight text-accent leading-[0.95] select-none">
                  Every Day.
                </p>
              </div>
              {/* Button sitting on the bottom border — px-10 bg creates blank space hiding the seam */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-auto bg-bg px-4 sm:px-10 rounded-full">
                <button
                  onClick={openMenu}
                  className="px-6 sm:px-8 py-3.5 text-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 whitespace-nowrap min-h-[44px]"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Want to see menu card?
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      </div>{/* end main-content z-[1] wrapper */}

      {/* ─── Mobile static tagline (replaces heavy 180vh scroll) ── */}
      <div className="md:hidden relative z-[1] bg-bg px-5 py-14 text-center">
        <h2 className="font-display leading-[0.95] text-ink" style={{ fontSize: 'clamp(2.4rem, 13vw, 4rem)' }}>
          That's a nice c<span style={{ color: '#1A4FE8' }}>[</span><span className="inline-flex items-center gap-px align-middle" style={{ verticalAlign: '-0.1em' }}><img src="/favicon.svg" alt="" aria-hidden="true" style={{ width: '0.72em', height: '0.72em', display: 'inline-block' }} /><img src="/favicon.svg" alt="" aria-hidden="true" style={{ width: '0.72em', height: '0.72em', display: 'inline-block' }} /></span><span style={{ color: '#1A4FE8' }}>]</span>kie
        </h2>
      </div>

      {/* ─── Full-screen horizontal-scroll heading (Desktop only) ── */}
      <div ref={headingOuterRef} className="hidden md:block relative z-[1]" style={{ height: '180vh' }}>
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center bg-bg">
          <motion.div
            className="flex items-center whitespace-nowrap select-none pl-[10vw]"
            style={{
              x: headingX,
              fontFamily: '"Fredoka One", cursive',
              color: 'var(--color-ink)',
              fontSize: 'clamp(4rem, 14vw, 14rem)',
              lineHeight: 1,
            }}
          >
            <span>THAT'S&nbsp;A&nbsp;NICE&nbsp;</span>

            {/* Blue bracket [ */}
            <span style={{ color: '#1A4FE8', fontSize: '1.05em' }}>[</span>

            {/* Cookie image between brackets */}
            <div
              style={{
                width: '0.75em',
                height: '0.75em',
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                marginTop: '0.04em',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&fit=crop"
                alt="cookie"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Blue bracket ] */}
            <span style={{ color: '#1A4FE8', fontSize: '1.05em' }}>]</span>

            <span>&nbsp;COOKIE</span>
          </motion.div>
        </div>
      </div>

      {/* ─── Story section — Mobile (simple scroll, text then image) ── */}
      <MobileStorySection onNavigate={() => navigate('/cookies')} />

      {/* ─── Sticky scroll story section — Desktop only ──────────── */}
      <div ref={storyOuterRef} className="relative z-[1] hidden md:block" style={{ height: '320vh' }}>
        <div
          className="sticky top-0 left-0 w-full overflow-hidden"
          style={{ height: '100vh', backgroundColor: '#3B1F0E' }}
        >
          {/* Cookie pattern background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='12' fill='%23C4752A'/%3E%3Ccircle cx='26' cy='26' r='2' fill='%233B1F0E'/%3E%3Ccircle cx='34' cy='28' r='1.8' fill='%233B1F0E'/%3E%3Ccircle cx='28' cy='34' r='1.6' fill='%233B1F0E'/%3E%3Ccircle cx='33' cy='33' r='1.4' fill='%233B1F0E'/%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px',
            }}
          />
          {/* Ambient glow */}
          <div className="absolute top-1/4 right-[-10%] hidden md:block w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ backgroundColor: 'rgba(196,117,42,0.08)' }} />
          <div className="absolute bottom-1/4 left-[-8%] hidden md:block w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(92,51,23,0.15)' }} />

          <div className="relative w-full h-full overflow-hidden">

            {/* Mobile-only: images slide up from bottom and accumulate as you scroll */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-end gap-3 z-20 md:hidden pointer-events-none">
              {mImages.map((src, i) => (
                <motion.div
                  key={i}
                  className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl shrink-0"
                  style={{ opacity: mOpacities[i], y: mYs[i], border: '2px solid rgba(255,255,255,0.2)' }}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>

            {/* Card 0 */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-20 pointer-events-none">
              <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-20">
                <motion.div className="flex-1" style={{ y: c0tY, opacity: c0tO }}>
                  <p className="text-sm uppercase tracking-widest mb-3 sm:mb-5" style={{ color: '#C4752A', fontFamily: '"Fredoka One", cursive' }}>01</p>
                  <h2 className="mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.6rem)', fontFamily: '"Fredoka One", cursive', color: '#F5E6D3' }}>
                    Cookies make people happy
                  </h2>
                  <p className="mb-2 sm:mb-3 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    Cookies are the perfect desserts ever! They are sinfully delicious, can double up as a go to snack or as a perfect post-dinner dessert!
                  </p>
                  <p className="mb-6 sm:mb-10 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    Plus, who has ever said no to a cookie?
                  </p>
                  <button
                    onClick={() => navigate('/cookies')}
                    className="pointer-events-auto rounded-full transition-all hover:brightness-110 active:scale-95 min-h-[44px]"
                    style={{ padding: '12px 28px', backgroundColor: '#C4752A', color: '#FFF8EE', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
                  >
                    See our cookies →
                  </button>
                </motion.div>
                <motion.div className="hidden md:block w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c0iX, opacity: c0iO, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&fit=crop" alt="Fresh cookies" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </div>

            {/* Card 1 */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-20 pointer-events-none">
              <div className="max-w-6xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-6 md:gap-20">
                <motion.div className="hidden md:block w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c1iX, opacity: c1iO, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&fit=crop" alt="Cookie packaging" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </motion.div>
                <motion.div className="flex-1" style={{ y: c1tY, opacity: c1tO }}>
                  <p className="text-sm uppercase tracking-widest mb-3 sm:mb-5" style={{ color: '#C4752A', fontFamily: '"Fredoka One", cursive' }}>02</p>
                  <h2 className="mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.6rem)', fontFamily: '"Fredoka One", cursive', color: '#F5E6D3' }}>
                    Freshly Baked &amp; Eggless
                  </h2>
                  <p className="mb-2 sm:mb-3 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    All our cookies are eggless and baked on order. This means that everytime you receive a Dohful cookie pack, it was baked just for you!
                  </p>
                  <p className="mb-6 sm:mb-10 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    We are also 100% Eggless because we don't want any of you guys to hesitate before trying them out!
                  </p>
                  <button
                    onClick={() => navigate('/cookies')}
                    className="pointer-events-auto rounded-full transition-all hover:brightness-110 active:scale-95 min-h-[44px]"
                    style={{ padding: '12px 28px', backgroundColor: '#C4752A', color: '#FFF8EE', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
                  >
                    Check our flavours
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-20 pointer-events-none">
              <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-20">
                <motion.div className="flex-1" style={{ y: c2tY, opacity: c2tO }}>
                  <p className="text-sm uppercase tracking-widest mb-3 sm:mb-5" style={{ color: '#C4752A', fontFamily: '"Fredoka One", cursive' }}>03</p>
                  <h2 className="mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.6rem)', fontFamily: '"Fredoka One", cursive', color: '#F5E6D3' }}>
                    Shipped Pan India
                  </h2>
                  <p className="mb-2 sm:mb-3 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    Our cookies have been shipped to 2000+ locations in India.
                  </p>
                  <p className="mb-6 sm:mb-10 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    Wherever you stay, Dohful cookies can reach you in maximum 3–5 days.
                  </p>
                  <button
                    onClick={() => navigate('/cookies')}
                    className="pointer-events-auto rounded-full transition-all hover:brightness-110 active:scale-95 min-h-[44px]"
                    style={{ padding: '12px 28px', backgroundColor: '#C4752A', color: '#FFF8EE', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: '1rem', borderRadius: 999 }}
                  >
                    Shop Cookies
                  </button>
                </motion.div>
                <motion.div className="hidden md:block w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c2iX, opacity: c2iO, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={COOKIE_PRODUCTS[0].image} alt="Cookie delivery" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-20 pointer-events-none">
              <div className="max-w-6xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-6 md:gap-20">
                <motion.div className="hidden md:block w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c3iX, opacity: c3iO, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src="https://images.unsplash.com/photo-1607478900766-efe13248b125?w=600&q=80&fit=crop" alt="Assorted cookies" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </motion.div>
                <motion.div className="flex-1" style={{ y: c3tY, opacity: c3tO }}>
                  <p className="text-sm uppercase tracking-widest mb-3 sm:mb-5" style={{ color: '#C4752A', fontFamily: '"Fredoka One", cursive' }}>04</p>
                  <h2 className="mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.6rem)', fontFamily: '"Fredoka One", cursive', color: '#F5E6D3' }}>
                    Coming Soon
                  </h2>
                  <p className="mb-6 sm:mb-10 text-base sm:text-xl" style={{ lineHeight: 1.8, color: '#D4B896', fontFamily: '"Nunito", sans-serif' }}>
                    Something special is baking. Stay tuned!
                  </p>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Final CTA ────────────────────────────────── */}
      <div className="relative z-[1] bg-bg py-20 flex flex-col items-center gap-6 px-4 text-center">
        <h2
          className="text-3xl sm:text-5xl font-bold leading-tight"
          style={{ fontFamily: '"Fredoka One", cursive', color: 'var(--color-ink)' }}
        >
          Hungry yet?&nbsp;<span style={{ color: 'var(--color-accent)' }}>Order now.</span>
        </h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50 max-w-xs">
          Freshly baked · Eggless · Delivered to your door
        </p>
        <button
          onClick={() => navigate('/cookies')}
          className="flex items-center gap-2 px-12 py-4 rounded-full text-sm font-bold text-white shadow-xl shadow-accent/25 hover:opacity-90 active:scale-95 transition-all min-h-[52px]"
          style={{ backgroundColor: 'var(--color-accent)', fontFamily: '"Nunito", sans-serif', letterSpacing: '0.05em' }}
        >
          Shop All Cookies &rarr;
        </button>
      </div>

    </motion.div>
  );
}
