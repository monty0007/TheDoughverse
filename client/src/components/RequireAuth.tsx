import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { AdminLogin } from '../pages/admin/AdminLogin';

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg text-ink flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                        Verifying session...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return <>{children}</>;
}
