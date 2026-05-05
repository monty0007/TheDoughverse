import { CookieOptions, NextFunction, Request, Response } from 'express';

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