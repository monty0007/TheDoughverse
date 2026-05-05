import { motion } from 'motion/react';
import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { OrynLogo } from '../../components/OrynLogo';
import { useAuthStore } from '../../store/useAuthStore';

const BLUE = '#1A4FE8';
const CREAM = '#F5F0D8';
const DOT = '#c8c29a';

export function AdminLogin() {
    const { login } = useAuthStore();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;

        setIsLoading(true);
        setError('');

        const result = await login(password);

        if (!result.ok) {
            setError(result.error || 'Invalid password');
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{
                backgroundColor: CREAM,
                backgroundImage: `radial-gradient(circle, ${DOT} 1px, transparent 1px)`,
                backgroundSize: '18px 18px',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative z-10 w-full max-w-sm mx-4"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-10 h-12 mb-3" style={{ color: BLUE }}>
                        <OrynLogo />
                    </div>
                    <h1
                        className="text-3xl font-bold"
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

                {/* Login Card */}
                <div
                    className="rounded-3xl p-8"
                    style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.1)' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2.5 rounded-2xl"
                            style={{ backgroundColor: 'rgba(26,79,232,0.08)' }}
                        >
                            <Lock className="w-5 h-5" style={{ color: BLUE }} />
                        </div>
                        <div>
                            <h2
                                className="text-xl font-bold"
                                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                            >
                                Admin Access
                            </h2>
                            <p
                                className="text-[10px] uppercase tracking-widest"
                                style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
                            >
                                Enter password to continue
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Password Input */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                autoFocus
                                className="w-full rounded-2xl py-3.5 px-4 pr-12 text-sm focus:outline-none transition-colors"
                                style={{
                                    backgroundColor: CREAM,
                                    border: '1.5px solid rgba(26,79,232,0.15)',
                                    color: BLUE,
                                    fontFamily: '"Nunito", sans-serif',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                                style={{ color: BLUE, opacity: 0.4 }}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-xs rounded-2xl px-3 py-2.5"
                                style={{
                                    color: '#e74c3c',
                                    backgroundColor: 'rgba(231,76,60,0.06)',
                                    border: '1px solid rgba(231,76,60,0.15)',
                                    fontFamily: '"Nunito", sans-serif',
                                }}
                            >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !password.trim()}
                            className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: BLUE,
                                color: '#fff',
                                fontFamily: '"Nunito", sans-serif',
                            }}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Verifying...</span>
                            ) : (
                                <>
                                    Access Panel <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p
                    className="text-center text-[10px] uppercase tracking-widest mt-6"
                    style={{ color: BLUE, opacity: 0.3, fontFamily: '"Nunito", sans-serif' }}
                >
                    Protected area · Unauthorized access is logged
                </p>
            </motion.div>
        </div>
    );
}
