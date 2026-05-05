import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../_middleware/auth.js';
import { getAdminCookieOptions, rateLimit } from '../_middleware/security.js';

const router = Router();
const loginLimiter = rateLimit('admin-login', 15 * 60 * 1000, 5);

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
    const { password } = req.body;

    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    res.cookie('oryn_admin_session', token, getAdminCookieOptions(7 * 24 * 60 * 60 * 1000));

    return res.json({ ok: true });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
    res.clearCookie('oryn_admin_session', getAdminCookieOptions());
    return res.json({ ok: true });
});

// GET /api/auth/verify
router.get('/verify', requireAuth, (_req, res) => {
    return res.json({ ok: true });
});

export default router;
