import { Link, useLocation } from 'react-router-dom';
import { OrynLogo } from './OrynLogo';

export function Footer() {
  const location = useLocation();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer
      className="w-full overflow-hidden"
      style={{ backgroundColor: '#1A4FE8' }}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="relative w-full h-full px-5 sm:px-14 py-10 flex flex-col sm:flex-row justify-between gap-8 sm:gap-0 min-h-[20rem] sm:min-h-[26rem]">

        {/* Left — brand + copyright */}
        <div className="flex flex-col gap-3 z-10">
          <Link to="/" className="flex items-center gap-2" aria-label="Home - The Dough Affair">
            <div className="w-7 h-8 text-white/70"><OrynLogo /></div>
            <span className="font-serif text-lg italic text-white">The Dough Affair</span>
          </Link>
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
            © {new Date().getFullYear()} · Baked with love
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-auto">
            <span className="w-2 h-2 rounded-full bg-[#E8B4D8] inline-block" aria-hidden="true" />
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">All cookies. No tracking.</span>
          </div>
        </div>

        {/* Right — nav links */}
        <nav className="flex gap-8 sm:gap-16 text-sm z-10" aria-label="Footer navigation">
          <ul className="space-y-3 sm:space-y-2">
            <li><Link to="/" className="text-white/90 hover:text-white hover:underline font-mono text-xs uppercase tracking-widest py-1 inline-block">Home</Link></li>
            <li><Link to="/cookies" className="text-white/90 hover:text-white hover:underline font-mono text-xs uppercase tracking-widest py-1 inline-block">Menu</Link></li>
            <li><Link to="/cart" className="text-white/90 hover:text-white hover:underline font-mono text-xs uppercase tracking-widest py-1 inline-block">Shop</Link></li>
          </ul>
          <ul className="space-y-3 sm:space-y-2">
            <li><Link to="/orders" className="text-white/90 hover:text-white hover:underline font-mono text-xs uppercase tracking-widest py-1 inline-block">Orders</Link></li>
            <li><Link to="/favourites" className="text-white/90 hover:text-white hover:underline font-mono text-xs uppercase tracking-widest py-1 inline-block">Favourites</Link></li>
            <li><Link to="/review" className="text-white/90 hover:text-white hover:underline font-mono text-xs uppercase tracking-widest py-1 inline-block">Contact</Link></li>
          </ul>
        </nav>

        {/* Big clipped brand name */}
        <h2
          className="absolute bottom-0 left-0 translate-y-[30%] font-bold leading-none select-none pointer-events-none text-white/[0.07] whitespace-nowrap"
          style={{ fontSize: 'clamp(28px, 10vw, 176px)', fontFamily: '"Fredoka One", cursive' }}
          aria-hidden="true"
        >
          THE DOUGH AFFAIR
        </h2>
      </div>
    </footer>
  );
}
