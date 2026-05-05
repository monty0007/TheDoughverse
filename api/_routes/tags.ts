import { Router } from 'express';
import { query } from '../_lib/db.js';

const router = Router();

// GET /api/tags — all tags with usage count
router.get('/', async (_req, res) => {
    try {
        const result = await query(
            `SELECT t.*, 
        (SELECT COUNT(*) FROM image_tags it 
         JOIN images i ON i.id = it.image_id 
         WHERE it.tag_id = t.id AND i.is_published = true AND i.is_deleted = false
        ) as usage_count
       FROM tags t
       ORDER BY t.name ASC`
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tags:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
