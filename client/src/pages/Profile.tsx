import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, User, Mail, Calendar, ShoppingBag, Heart, Star } from 'lucide-react';
import { useFirebaseAuth } from '../store/useFirebaseAuth';

const BLUE = '#1A4FE8';
const CREAM = '#FFFCDC';

export function Profile() {
  const { user, loading, logout } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;

  const initial = (user.displayName || user.email || '?')[0].toUpperCase();

  return (
    <div className="min-h-screen pt-28 sm:pt-28 pb-20 px-4" style={{ backgroundColor: CREAM }}>
      <div className="max-w-2xl mx-auto">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-3xl p-8 sm:p-10 mb-6"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Avatar'}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: `3px solid ${BLUE}` }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: BLUE }}
              >
                {initial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl sm:text-3xl font-bold truncate"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                {user.displayName || 'Cookie Lover'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: BLUE, opacity: 0.4 }} />
                <span
                  className="text-sm truncate"
                  style={{ color: BLUE, opacity: 0.55, fontFamily: '"Nunito", sans-serif' }}
                >
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:shadow-md active:scale-95"
            style={{
              border: '1.5px solid rgba(220,38,38,0.2)',
              color: '#DC2626',
              fontFamily: '"Nunito", sans-serif',
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </motion.div>

        {/* Quick links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShoppingBag, label: 'Order History', desc: 'View past orders', to: '/orders' },
            { icon: Heart, label: 'Favourites', desc: 'Saved cookies', to: '/favourites' },
            { icon: Star, label: 'My Reviews', desc: 'Cookies you reviewed', to: '/review' },
          ].map(({ icon: Icon, label, desc, to }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Link
                to={to}
                className="block rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
              >
                <Icon className="w-6 h-6 mb-3" style={{ color: BLUE }} />
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                >
                  {label}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
                >
                  {desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
