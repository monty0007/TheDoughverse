import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import ImageTrail, { ImageTrailItem } from '../components/ImageTrail';
import { useMenuStore } from '../store/useMenuStore';
import { COOKIE_PRODUCTS } from '../data/products';

const trailImages = COOKIE_PRODUCTS.map((p) => p.image);

// Six corner/edge positions — none overlap the centred text & button block
const MOBILE_POSITIONS = [
  { top: '5%',    left: '3%'   },
  { top: '5%',    right: '3%'  },
  { bottom: '13%', left: '3%'  },
  { bottom: '13%', right: '3%' },
  { top: '40%',   left: '1%'   },
  { top: '40%',   right: '1%'  },
] as const;
const MOBILE_ROTATIONS = [-8, 7, -5, 9, -7, 6] as const;

function MobileSlideshow({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2800);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) return null;

  const pos = MOBILE_POSITIONS[idx % MOBILE_POSITIONS.length];
  const rot = MOBILE_ROTATIONS[idx % MOBILE_ROTATIONS.length];

  return (
    <div className="absolute inset-x-0 top-10 bottom-0 pointer-events-none z-0 overflow-hidden lg:hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx]}
          alt=""
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 0.82, rotate: rot - 5 }}
          animate={{ opacity: 0.82, scale: 1, rotate: rot }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(4px)', transition: { duration: 0.35 } }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl border-2 border-white/30"
          style={pos}
        />
      </AnimatePresence>
    </div>
  );
}

export function Home() {
  const [trailActive, setTrailActive] = useState(true);

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
    if (!boxSize) return;
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
  }, [boxSize]);

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
      animate={menuOpen ? { x: '-8%', scale: 0.96, opacity: 0.6 } : { x: '0%', scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      style={{ transformOrigin: 'left center', willChange: 'transform' }}
    >
      {/* Main content — sits on top of the sticky footer */}
      <div className="relative z-[1] bg-bg min-h-[100dvh] flex flex-col">
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[calc(100dvh-6.5rem)] sm:h-[calc(100vh-6rem)] flex flex-col items-center overflow-hidden" aria-label="Hero">
        {/* Background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-accent/8 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-blush/20 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-blush/10 rounded-full blur-3xl -z-10 pointer-events-none" aria-hidden="true" />

        {/* Mobile Slideshow */}
        <MobileSlideshow images={trailImages} />

        {/* Image Trail — Desktop only */}
        <div className="absolute inset-0 z-0 hidden lg:block">
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
        </div>

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
              {boxSize && (() => {
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

      {/* ─── Full-screen horizontal-scroll heading ────────────── */}
      <div ref={headingOuterRef} className="relative z-[1]" style={{ height: '180vh' }}>
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

      {/* ─── Sticky scroll story section (brown, 4 cards) ──────── */}
      <div ref={storyOuterRef} className="relative z-[1]" style={{ height: '320vh' }}>
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
          <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none" style={{ backgroundColor: 'rgba(196,117,42,0.08)' }} />
          <div className="absolute bottom-1/4 left-[-8%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(92,51,23,0.15)' }} />

          <div className="relative w-full h-full overflow-hidden">

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
                <motion.div className="w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c0iX, opacity: c0iO, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&fit=crop" alt="Fresh cookies" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </div>

            {/* Card 1 */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-20 pointer-events-none">
              <div className="max-w-6xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-6 md:gap-20">
                <motion.div className="w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c1iX, opacity: c1iO, border: '1px solid rgba(255,255,255,0.06)' }}>
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
                <motion.div className="w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c2iX, opacity: c2iO, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={COOKIE_PRODUCTS[0].image} alt="Cookie delivery" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-20 pointer-events-none">
              <div className="max-w-6xl w-full mx-auto flex flex-col-reverse md:flex-row items-center gap-6 md:gap-20">
                <motion.div className="w-full md:w-96 h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shrink-0 shadow-2xl" style={{ x: c3iX, opacity: c3iO, border: '1px solid rgba(255,255,255,0.06)' }}>
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
