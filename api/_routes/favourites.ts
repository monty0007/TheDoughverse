import { Router, Request, Response } from 'express';
import { query } from '../_lib/db.js';
import { firebaseAdmin } from '../_lib/firebase.js';

const router = Router();

async function authMiddleware(req: Request, res: Response, next: Function) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = await firebaseAdmin.auth().verifyIdToken(auth.slice(7));
        (req as any).uid = decoded.uid;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// GET /api/favourites
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    const uid = (req as any).uid;
    try {
        const result = await query(
            `SELECT product_id, created_at FROM favourites WHERE firebase_uid = $1 ORDER BY created_at DESC`,
            [uid]
        );
        return res.json(result.rows.map((r: any) => r.product_id));
    } catch (err) {
        console.error('Favourites list error:', err);
        return res.status(500).json({ error: 'Failed to fetch favourites' });
    }
});

// POST /api/favourites/:productId
router.post('/:productId', authMiddleware, async (req: Request, res: Response) => {
    const uid = (req as any).uid;
    const { productId } = req.params;
    try {
        await query(
            `INSERT INTO favourites (firebase_uid, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [uid, productId]
        );
        return res.json({ ok: true });
    } catch (err) {
        console.error('Favourite add error:', err);
        return res.status(500).json({ error: 'Failed to add favourite' });
    }
});

// DELETE /api/favourites/:productId
router.delete('/:productId', authMiddleware, async (req: Request, res: Response) => {
    const uid = (req as any).uid;
    const { productId } = req.params;
    try {
        await query(
            `DELETE FROM favourites WHERE firebase_uid = $1 AND product_id = $2`,
            [uid, productId]
        );
        return res.json({ ok: true });
    } catch (err) {
        console.error('Favourite remove error:', err);
        return res.status(500).json({ error: 'Failed to remove favourite' });
    }
});

export default router;
