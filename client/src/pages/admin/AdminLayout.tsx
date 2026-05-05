import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, ArrowLeft, Settings, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const BLUE = '#1A4FE8';
const CREAM = '#F5F0D8';
const DOT = '#c8c29a';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Products', path: '/admin', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: CREAM }}>

      {/* ── MOBILE TOP BAR (hidden md+) ── */}
      <header
        className="md:hidden sticky top-0 z-50"
        style={{ backgroundColor: '#fff', borderBottom: '2px solid rgba(26,79,232,0.1)' }}
      >
        {/* Row 1 — Brand */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-2"
          style={{ borderBottom: '1px solid rgba(26,79,232,0.07)' }}
        >
          <div>
            <p
              className="text-lg font-bold leading-tight"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              The Dough Affair
            </p>
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
            >
              Admin Panel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
              style={{ backgroundColor: 'rgba(26,79,232,0.07)', color: BLUE, fontFamily: '"Nunito", sans-serif' }}
              aria-label="Back to site"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
              style={{ backgroundColor: 'rgba(231,76,60,0.09)', color: '#e74c3c', fontFamily: '"Nunito", sans-serif' }}
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Row 2 — Page tabs */}
        <div className="flex items-center px-4 gap-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: isActive ? BLUE : 'rgba(26,79,232,0.06)',
                  color: isActive ? '#fff' : BLUE,
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR (hidden below md) ── */}
      <aside
        className="hidden md:flex w-60 flex-col shrink-0 h-screen sticky top-0 z-50"
        style={{ backgroundColor: '#fff', borderRight: '1px solid rgba(26,79,232,0.1)' }}
      >
        {/* Brand */}
        <div className="p-6 shrink-0" style={{ borderBottom: '1px solid rgba(26,79,232,0.08)' }}>
          <h1
            className="text-2xl font-bold leading-none"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            The Dough Affair
          </h1>
          <p
            className="text-[10px] uppercase tracking-widest mt-1"
            style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
          >
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="p-3 flex flex-col gap-1 w-full flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-row items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: isActive ? BLUE : 'transparent',
                  color: isActive ? '#fff' : BLUE,
                  opacity: isActive ? 1 : 0.55,
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to site + Logout */}
        <div
          className="shrink-0 p-4 flex flex-col gap-1"
          style={{ borderTop: '1px solid rgba(26,79,232,0.08)' }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
            style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left"
            style={{ color: '#e74c3c', fontFamily: '"Nunito", sans-serif' }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        className="flex-1 p-4 md:p-10 overflow-y-auto pb-6 md:pb-10"
        style={{
          backgroundColor: CREAM,
          backgroundImage: `radial-gradient(circle, ${DOT} 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>

    </div>
  );
}
