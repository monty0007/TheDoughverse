import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useFirebaseAuth } from '../store/useFirebaseAuth';

const BLUE = '#1A4FE8';
const CREAM = '#FFFCDC';

export function Login() {
  const { user, loading, error, loginWithEmail, registerWithEmail, loginWithGoogle, clearError } =
    useFirebaseAuth();
  const location = useLocation();
  const from: string = (location.state as any)?.from ?? '/cookies';
  const hideGuest: boolean = (location.state as any)?.hideGuest === true;
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → go to profile
  if (!loading && user) return <Navigate to="/profile" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (isRegister) {
      await registerWithEmail(email, password, name);
    } else {
      await loginWithEmail(email, password);
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    await loginWithGoogle();
    setSubmitting(false);
  };

  const toggle = () => {
    setIsRegister(!isRegister);
    clearError();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-28 sm:pt-28 pb-20"
      style={{ backgroundColor: CREAM }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            {isRegister ? 'Join Us' : 'Welcome Back'}
          </h1>
          <p
            className="text-sm"
            style={{ color: BLUE, opacity: 0.55, fontFamily: '"Nunito", sans-serif' }}
          >
            {isRegister
              ? 'Create your account to start ordering cookies'
              : 'Sign in to your Dough Affair account'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{ backgroundColor: '#fff', border: `1px solid rgba(26,79,232,0.08)` }}
        >
          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            style={{
              border: '1.5px solid rgba(26,79,232,0.15)',
              color: BLUE,
              fontFamily: '"Nunito", sans-serif',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(26,79,232,0.1)' }} />
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: BLUE, opacity: 0.35, fontFamily: '"Nunito", sans-serif' }}
            >
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(26,79,232,0.1)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: BLUE, opacity: 0.35 }}
                />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:ring-2"
                  style={{
                    border: '1.5px solid rgba(26,79,232,0.12)',
                    color: BLUE,
                    fontFamily: '"Nunito", sans-serif',
                    ['--tw-ring-color' as any]: 'rgba(26,79,232,0.3)',
                  }}
                />
              </div>
            )}

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: BLUE, opacity: 0.35 }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:ring-2"
                style={{
                  border: '1.5px solid rgba(26,79,232,0.12)',
                  color: BLUE,
                  fontFamily: '"Nunito", sans-serif',
                  ['--tw-ring-color' as any]: 'rgba(26,79,232,0.3)',
                }}
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: BLUE, opacity: 0.35 }}
              />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm outline-none transition-all focus:ring-2"
                style={{
                  border: '1.5px solid rgba(26,79,232,0.12)',
                  color: BLUE,
                  fontFamily: '"Nunito", sans-serif',
                  ['--tw-ring-color' as any]: 'rgba(26,79,232,0.3)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: BLUE, opacity: 0.35 }}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-xs text-center py-2 px-4 rounded-xl"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.08)',
                  color: '#DC2626',
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
              style={{
                backgroundColor: BLUE,
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p
            className="text-center text-sm mt-6"
            style={{ color: BLUE, opacity: 0.55, fontFamily: '"Nunito", sans-serif' }}
          >
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggle}
              className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: BLUE, opacity: 1 }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Continue as guest — removed */}

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-[10px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity"
            style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
