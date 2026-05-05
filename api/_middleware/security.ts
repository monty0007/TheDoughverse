import { CookieOptions, NextFunction, Request, Response } from 'express';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function normalizeAllowedOrigins(originConfig = process.env.ALLOWED_ORIGIN) {
    const origins = [
        ...(originConfig || '').split(','),
        process.env.APP_URL,
        process.env.SITE_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
        'http://localhost:3000',
        'http://localhost:5173',
    ];

    return Array.from(new Set(
        origins
            .filter((origin): origin is string => Boolean(origin?.trim()))
            .flatMap((origin) => {
                const trimmed = origin.trim().replace(/\/$/, '');
                return [trimmed, `${trimmed}/`];
            })
    ));
}

export function isAllowedOrigin(origin: string | undefined, allowedOrigins: string[]) {
    if (!origin) return true;
    const normalized = origin.replace(/\/$/, '');
    return allowedOrigins.includes('*') || allowedOrigins.includes(normalized) || allowedOrigins.includes(`${normalized}/`);
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';

    if (isHttps) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    if (/^\/api\/(auth|admin|user|orders|favourites)(\/|$)/.test(req.path)) {
        res.setHeader('Cache-Control', 'no-store');
    }

    next();
}

export function requireTrustedOrigin(allowedOrigins: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (SAFE_METHODS.has(req.method)) return next();

        const origin = req.get('origin');
        const referer = req.get('referer');
        let sourceOrigin = origin;

        if (!sourceOrigin && referer) {
            try {
                sourceOrigin = new URL(referer).origin;
            } catch {
                return res.status(403).json({ error: 'Invalid request origin' });
            }
        }

        if (isAllowedOrigin(sourceOrigin, allowedOrigins)) return next();

        return res.status(403).json({ error: 'Request origin is not allowed' });
    };
}

export function rateLimit(name: string, windowMs: number, max: number) {
    if (!stores.has(name)) {
        stores.set(name, new Map());
    }

    const store = stores.get(name)!;
    const cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (entry.resetAt < now) store.delete(key);
        }
    }, Math.min(windowMs, 60_000));

    cleanupTimer.unref?.();

    return (req: Request, res: Response, next: NextFunction) => {
        const forwardedFor = req.headers['x-forwarded-for'];
        const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
        const key = (forwardedIp || req.ip || req.socket.remoteAddress || 'unknown').trim();
        const now = Date.now();
        const entry = store.get(key);

        if (!entry || entry.resetAt < now) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        if (entry.count >= max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({ error: 'Too many requests', retryAfter });
        }

        entry.count += 1;
        return next();
    };
}

export function getAdminCookieOptions(maxAge?: number): CookieOptions {
    const configuredSameSite = (process.env.ADMIN_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = ['lax', 'strict', 'none'].includes(configuredSameSite)
        ? configuredSameSite as CookieOptions['sameSite']
        : 'lax';
    const secure = process.env.NODE_ENV === 'production' || sameSite === 'none';

    return {
        httpOnly: true,
        secure,
        sameSite,
        maxAge,
        path: '/',
    };
}