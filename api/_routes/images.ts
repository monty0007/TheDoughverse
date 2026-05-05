import { Router } from 'express';
import { query } from '../_lib/db.js';
import { rateLimit } from '../_middleware/security.js';

const router = Router();

// GET /api/images — paginated, filterable, sortable (published only)
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;
        const { tag, model, search, sort } = req.query;

        let whereClauses = ['i.is_published = true', 'i.is_deleted = false'];
        let params: any[] = [];
        let paramIdx = 1;

        if (tag) {
            whereClauses.push(`EXISTS (SELECT 1 FROM image_tags it JOIN tags t ON t.id = it.tag_id WHERE it.image_id = i.id AND t.slug = $${paramIdx})`);
            params.push(tag);
            paramIdx++;
        }

        if (model) {
            whereClauses.push(`i.model ILIKE $${paramIdx}`);
            params.push(`%${model}%`);
            paramIdx++;
        }

        if (search) {
            whereClauses.push(`(i.title ILIKE $${paramIdx} OR i.prompt ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }

        let orderBy = 'i.created_at DESC';
        if (sort === 'most_liked') {
            orderBy = 'i.like_count DESC';
        } else if (sort === 'trending') {
            orderBy = `(SELECT COUNT(*) FROM prompt_copies pc WHERE pc.image_id = i.id AND pc.created_at > NOW() - INTERVAL '7 days') DESC`;
        }

        const where = whereClauses.join(' AND ');

        const countResult = await query(`SELECT COUNT(*) FROM images i WHERE ${where}`, params);
        const total = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT i.*, 
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
           FROM image_tags it JOIN tags t ON t.id = it.tag_id WHERE it.image_id = i.id), '[]'
        ) as tags
       FROM images i
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
            [...params, limit, offset]
        );

        return res.json({
            images: result.rows,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Error fetching images:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/images/:id — single image
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT i.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
           FROM image_tags it JOIN tags t ON t.id = it.tag_id WHERE it.image_id = i.id), '[]'
        ) as tags
       FROM images i
       WHERE i.id = $1 AND i.is_published = true AND i.is_deleted = false`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching image:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/images/:id/similar — up to 8 similar by shared tags
router.get('/:id/similar', async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM (
              SELECT DISTINCT ON (i.id) i.*,
              COALESCE(
                (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
                 FROM image_tags it2 JOIN tags t ON t.id = it2.tag_id WHERE it2.image_id = i.id), '[]'
              ) as tags
             FROM images i
             JOIN image_tags it ON it.image_id = i.id
             WHERE it.tag_id IN (SELECT tag_id FROM image_tags WHERE image_id = $1)
               AND i.id != $1
               AND i.is_published = true
               AND i.is_deleted = false
             ORDER BY i.id
            ) sub ORDER BY sub.like_count DESC
            LIMIT 8`,
            [req.params.id]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error('Error fetching similar images:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/images/:id/like — with fingerprint dedup
const likeLimiter = rateLimit('image-like', 60 * 1000, 10);
router.post('/:id/like', likeLimiter, async (req, res) => {
    try {
        const { fingerprint } = req.body;
        if (!fingerprint) {
            return res.status(400).json({ error: 'Fingerprint is required' });
        }

        const existing = await query(
            `SELECT id FROM likes
       WHERE image_id = $1 AND fingerprint = $2 AND created_at > NOW() - INTERVAL '24 hours'`,
            [req.params.id, fingerprint]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Already liked' });
        }

        await query('INSERT INTO likes (image_id, fingerprint) VALUES ($1, $2)', [req.params.id, fingerprint]);
        await query('UPDATE images SET like_count = like_count + 1 WHERE id = $1', [req.params.id]);

        return res.json({ ok: true });
    } catch (err) {
        console.error('Error liking image:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/images/:id/copy — track prompt copy
const copyLimiter = rateLimit('image-copy', 60 * 1000, 30);
router.post('/:id/copy', copyLimiter, async (req, res) => {
    try {
        await query('INSERT INTO prompt_copies (image_id) VALUES ($1)', [req.params.id]);
        await query('UPDATE images SET copy_count = copy_count + 1 WHERE id = $1', [req.params.id]);
        return res.json({ ok: true });
    } catch (err) {
        console.error('Error tracking copy:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
