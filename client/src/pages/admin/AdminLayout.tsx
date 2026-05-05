import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Tags, ShoppingBag, LogOut, ArrowLeft, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const BLUE = '#1A4FE8';
const CREAM = '#F5F0D8';
const DOT = '#c8c29a';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Products', path: '/admin', icon: ShoppingBag },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: CREAM }}>
      {/* Sidebar */}
      <aside
        className="w-full md:w-60 flex flex-col shrink-0 md:min-h-screen sticky top-0 z-50"
        style={{ backgroundColor: '#fff', borderRight: '1px solid rgba(26,79,232,0.1)' }}
      >
        {/* Brand */}
        <div className="p-5 md:p-6" style={{ borderBottom: '1px solid rgba(26,79,232,0.08)' }}>
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
        <nav className="p-3 flex flex-row md:flex-col gap-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-3 py-2.5 md:py-3 rounded-2xl text-[9px] md:text-xs font-bold uppercase tracking-wider transition-all flex-1 md:flex-none text-center"
                style={{
                  backgroundColor: isActive ? BLUE : 'transparent',
                  color: isActive ? '#fff' : BLUE,
                  opacity: isActive ? 1 : 0.55,
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to site + Logout */}
        <div
          className="mt-auto p-4 flex flex-col gap-1"
          style={{ borderTop: '1px solid rgba(26,79,232,0.08)' }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
            style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left"
            style={{ color: '#e74c3c', fontFamily: '"Nunito", sans-serif' }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 p-6 md:p-10 overflow-y-auto"
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
