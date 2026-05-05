import { Router } from 'express';
import { query } from '../_lib/db';

const router = Router();

// GET /api/products — all active products (public)
router.get('/', async (_req, res) => {
    try {
        const result = await query(
            'SELECT * FROM cookie_products WHERE is_active = true ORDER BY sort_order ASC, created_at ASC'
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;