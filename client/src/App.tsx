/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { RequireAuth } from './components/RequireAuth';
import { OrynLogo } from './components/OrynLogo';
import { MenuOverlay } from './components/MenuOverlay';
import { Footer } from './components/Footer';
import { Sun, Moon, ShoppingBag, Search, User, X } from 'lucide-react';
import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import { Toaster } from 'react-hot-toast';
import { useCartStore } from './store/useCartStore';
import { useMenuStore } from './store/useMenuStore';
import { useFirebaseAuth } from './store/useFirebaseAuth';
import { getWhatsAppNumber } from './lib/settings';
import { COOKIE_PRODUCTS } from './data/products';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Cookies = lazy(() => import('./pages/Cookies').then((module) => ({ default: module.Cookies })));
const Gift = lazy(() => import('./pages/Gift').then((module) => ({ default: module.Gift })));
const Review = lazy(() => import('./pages/Review').then((module) => ({ default: module.Review })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const Checkout = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.Checkout })));
const Orders = lazy(() => import('./pages/Orders').then((module) => ({ default: module.Orders })));
const Favourites = lazy(() => import('./pages/Favourites').then((module) => ({ default: module.Favourites })));
const StyleConverter = lazy(() => import('./pages/StyleConverter').then((module) => ({ default: module.StyleConverter })));
const PromptBuilder = lazy(() => import('./pages/PromptBuilder').then((module) => ({ default: module.PromptBuilder })));
const SavedPage = lazy(() => import('./pages/SavedPage').then((module) => ({ default: module.SavedPage })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((module) => ({ default: module.AdminSettings })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then((module) => ({ default: module.GalleryPage })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// WhatsApp support URL — number managed via Admin > Settings
function getWhatsAppSupportUrl() {
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent('Hi! I need help with my order 🍪')}`;
}

const MOB_NAV_LINKS = [
  { to: '/cookies', label: 'Cookies' },
  { to: '/gift', label: 'Gift' },
  { to: '/review', label: 'Review' },
] as const;

function useNavbarVisibility() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > 80 && y > lastY);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, hidden };
}

function MobileCartFab() {
  const location = useLocation();
  const count = useCartStore((s) => s.totalItems)();
  if (location.pathname === '/cart' || location.pathname.startsWith('/admin')) return null;
  return (
    <Link
      to="/cart"
      className="fixed bottom-6 right-4 z-50 sm:hidden flex items-center justify-center w-14 h-14 rounded-full shadow-xl active:scale-95 transition-transform"
      style={{ backgroundColor: '#1A4FE8' }}
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ''}`}
    >
      <ShoppingBag className="w-6 h-6 text-white" />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold leading-none"
          style={{ backgroundColor: '#E8B4D8', color: '#1A4FE8' }}
          aria-hidden="true"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

function MobilePageNav({ hidden }: { hidden: boolean }) {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return (
    <nav
      className="fixed left-0 right-0 z-40 sm:hidden flex items-center justify-around h-10 transition-transform duration-300 ease-out"
      style={{
        top: '4rem',
        transform: hidden ? 'translateY(calc(-4rem - 100%))' : 'translateY(0)',
        backgroundColor: 'var(--theme-bg)',
        borderTop: '1px solid color-mix(in srgb, var(--theme-accent) 8%, transparent)',
        borderBottom: '2px solid color-mix(in srgb, var(--theme-accent) 12%, transparent)',
      }}
      aria-label="Quick navigation"
    >
      {MOB_NAV_LINKS.map(({ to, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 text-center font-mono text-[10px] uppercase tracking-widest py-1 transition-colors"
            style={{
              color: active ? 'var(--theme-accent)' : 'color-mix(in srgb, var(--theme-accent) 45%, transparent)',
              fontWeight: active ? 700 : 500,
            }}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Navbar({ scrolled, hidden }: { scrolled: boolean; hidden: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    // Read persisted preference; default to light
    try {
      const stored = localStorage.getItem('theme');
      return stored ? stored === 'light' : true;
    } catch {
      return true;
    }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { totalItems } = useCartStore();
  const { toggle: toggleMenu } = useMenuStore();
  const count = totalItems();
  const { user: fbUser } = useFirebaseAuth();
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [fbUser?.photoURL]);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    try { localStorage.setItem('theme', isLightMode ? 'light' : 'dark'); } catch {}
  }, [isLightMode]);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) closeSearch();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen]);

  // Reset search input when navigating away from /cookies
  useEffect(() => {
    if (!location.pathname.startsWith('/cookies')) {
      setSearchQuery('');
    }
  }, [location.pathname]);

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/cookies?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/cookies');
    }
    setSearchOpen(false);
  };

  const searchResults = searchQuery.trim().length >= 1
    ? COOKIE_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleResultClick = (name: string) => {
    navigate(`/cookies?q=${encodeURIComponent(name)}`);
    closeSearch();
  };

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        hidden ? '-translate-y-full' : 'translate-y-0',
        scrolled
          ? 'bg-bg/90 backdrop-blur-xl border-b border-ink/10 shadow-sm sm:bg-bg/90'
          : 'bg-transparent'
      )}
      style={{
        // On mobile always use cream bg for consistency with cookie/review theme
      }}
    >
      <div
        className="sm:hidden absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'var(--theme-bg)', borderBottom: '1px solid color-mix(in srgb, var(--theme-accent) 10%, transparent)' }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-24 flex items-center justify-between">

        {/* Left — search */}
        <div className="flex items-center relative">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search-bar"
                initial={{ width: 44, opacity: 0 }}
                animate={{ width: 'clamp(160px, 38vw, 360px)', opacity: 1 }}
                exit={{ width: 44, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="relative"
              >
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2 rounded-full border border-ink/25 bg-bg/80 backdrop-blur-sm overflow-hidden pl-3 pr-1"
                  style={{ height: 44 }}
                >
                  <button
                    type="submit"
                    className="shrink-0 text-ink/40 hover:text-ink transition-colors"
                    aria-label="Submit search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cookies…"
                    className="flex-1 bg-transparent text-sm font-mono text-ink placeholder:text-ink/40 focus:outline-none min-w-0"
                    aria-label="Search cookies"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="p-2 rounded-full text-ink/40 hover:text-ink transition-colors shrink-0"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>

                {/* Live results dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-xl z-50"
                      style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.1)' }}
                    >
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleResultClick(p.name)}
                          className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                          style={{ borderBottom: '1px solid rgba(26,79,232,0.05)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,79,232,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-9 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#1A4FE8', fontFamily: '"Fredoka One", cursive' }}>{p.name}</p>
                            <p className="text-[10px] uppercase tracking-wider truncate" style={{ color: '#1A4FE8', opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}>{p.category} · ₹{p.price}</p>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { navigate(`/cookies?q=${encodeURIComponent(searchQuery.trim())}`); closeSearch(); }}
                        className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors"
                        style={{ color: '#1A4FE8', fontFamily: '"Nunito", sans-serif', backgroundColor: 'rgba(26,79,232,0.03)' }}
                      >
                        See all results for "{searchQuery.trim()}"
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.button
                key="search-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={openSearch}
                className="p-0 sm:p-2.5 rounded-full border text-ink/60 hover:text-ink bg-bg/50 backdrop-blur-sm transition-all w-10 h-10 min-w-10 min-h-10 sm:w-auto sm:h-auto sm:min-w-[44px] sm:min-h-[44px] flex shrink-0 items-center justify-center sm:border-ink/15 sm:hover:border-ink/30"
                style={{ borderColor: 'rgba(26,79,232,0.18)', color: '#1A4FE8' }}
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Centre — logo + name + page links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Home - The Dough Affair">
            <div className="w-7 h-8 sm:w-8 sm:h-9 transition-transform group-hover:scale-110" style={{ color: '#1A4FE8' }}>
              <OrynLogo />
            </div>
            <span className="font-serif text-xl font-bold leading-none hidden sm:block">The Dough Affair</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
            <Link
              to="/cookies"
              className={cn(
                'px-3 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-colors',
                location.pathname === '/cookies'
                  ? 'text-accent font-bold'
                  : 'text-ink/50 hover:text-ink'
              )}
            >
              Cookies
            </Link>
            <Link
              to="/gift"
              className={cn(
                'px-3 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-colors',
                location.pathname === '/gift'
                  ? 'text-accent font-bold'
                  : 'text-ink/50 hover:text-ink'
              )}
            >
              Gift
            </Link>
            <Link
              to="/review"
              className={cn(
                'px-3 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-colors',
                location.pathname === '/review'
                  ? 'text-accent font-bold'
                  : 'text-ink/50 hover:text-ink'
              )}
            >
              Review
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* WhatsApp support button */}
          <a
            href={getWhatsAppSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 min-h-[44px]"
            style={{ backgroundColor: '#25D366', color: '#fff', fontFamily: '"Nunito", sans-serif' }}
            aria-label="Contact support on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Support</span>
          </a>

          {/* Theme toggle */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="flex shrink-0 p-0 sm:p-2.5 rounded-full border transition-all w-10 h-10 min-w-10 min-h-10 sm:w-auto sm:h-auto sm:min-w-[44px] sm:min-h-[44px] items-center justify-center sm:border-ink/15 sm:text-ink/60 sm:bg-bg/50"
            style={{ borderColor: 'rgba(26,79,232,0.18)', color: '#1A4FE8', backgroundColor: 'rgba(26,79,232,0.05)' }}
            aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Cart — hidden on mobile (use floating FAB instead) */}
          <Link
            to="/cart"
            className="relative shrink-0 p-0 sm:p-2.5 rounded-full border transition-all group hidden sm:flex w-10 h-10 min-w-10 min-h-10 sm:w-auto sm:h-auto sm:min-w-[44px] sm:min-h-[44px] items-center justify-center sm:border-ink/15 sm:text-ink/60 sm:bg-bg/50"
            style={{ borderColor: 'rgba(26,79,232,0.18)', color: '#1A4FE8', backgroundColor: 'rgba(26,79,232,0.05)' }}
            aria-label={`Open cart${count > 0 ? `, ${count} items` : ''}`}
          >
            <ShoppingBag className="w-4 h-4 transition-colors" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blush text-ink text-[10px] font-bold rounded-full flex items-center justify-center leading-none" aria-hidden="true">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* User / Login */}
          <Link
            to={fbUser ? '/profile' : '/login'}
            className="shrink-0 p-0 sm:p-2.5 rounded-full border transition-all overflow-hidden w-10 h-10 min-w-10 min-h-10 sm:w-auto sm:h-auto sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center sm:border-ink/15 sm:text-ink/60 sm:bg-bg/50"
            style={{ borderColor: 'rgba(26,79,232,0.18)', color: '#1A4FE8', backgroundColor: 'rgba(26,79,232,0.05)' }}
            aria-label={fbUser ? 'Your profile' : 'Sign in'}
          >
            {fbUser?.photoURL && !avatarFailed ? (
              <img
                src={fbUser.photoURL}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/45">Loading</p>
    </div>
  );
}

export default function App() {
  const navbarVisibility = useNavbarVisibility();

  // Start Firebase auth listener once
  useEffect(() => {
    const unsub = useFirebaseAuth.getState().listen();
    return unsub;
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent/30 selection:text-accent">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="grain-overlay" aria-hidden="true" />
        <Navbar {...navbarVisibility} />
        <MobilePageNav hidden={navbarVisibility.hidden} />
        <MenuOverlay />
        <main id="main-content">
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/gift" element={<Gift />} />
            <Route path="/review" element={<Review />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/converter" element={<StyleConverter />} />
          <Route path="/builder" element={<PromptBuilder />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/products" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/settings" element={<RequireAuth><AdminSettings /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Suspense>
        </main>
        <Footer />
        <MobileCartFab />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'var(--theme-ink)',
              color: 'var(--theme-bg)',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </div>
    </Router>
  );
}
