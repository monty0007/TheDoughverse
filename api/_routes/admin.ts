import { Router, Request } from 'express';
import multer from 'multer';
import { query } from '../_lib/db';
import { requireAuth } from '../_middleware/auth';
import { uploadToAzure } from '../_lib/azureStorage';
import { validateUploadedImage } from '../_lib/imageValidation';

const router = Router();

// All admin routes require auth
router.use(requireAuth);

// Multer config: 10MB max, image types only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        cb(null, allowed.includes(file.mimetype));
    },
});

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

// GET /api/admin/images
router.get('/images', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;
        const { status } = req.query;

        let whereClauses: string[] = [];

        if (status === 'published') {
            whereClauses.push('i.is_published = true', 'i.is_deleted = false');
        } else if (status === 'draft') {
            whereClauses.push('i.is_published = false', 'i.is_deleted = false');
        } else if (status === 'deleted') {
            whereClauses.push('i.is_deleted = true');
        } else {
            whereClauses.push('i.is_deleted = false');
        }

        const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countResult = await query(`SELECT COUNT(*) FROM images i ${where}`);
        const total = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT i.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
           FROM image_tags it JOIN tags t ON t.id = it.tag_id WHERE it.image_id = i.id), '[]'
        ) as tags
       FROM images i
       ${where}
       ORDER BY i.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return res.json({
            images: result.rows,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Error fetching admin images:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/upload — upload a product image to Azure, returns URL
router.post('/upload', upload.single('image'), async (req: Request, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        let image;
        try {
            image = validateUploadedImage(req.file);
        } catch {
            return res.status(400).json({ error: 'Unsupported or invalid image file' });
        }

        const { storageKey, url } = await uploadToAzure(req.file.buffer, image.fileName, image.mimeType);
        return res.status(201).json({ url, key: storageKey });
    } catch (err) {
        console.error('Error uploading product image:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/images — upload new image
router.post('/images', upload.single('image'), async (req: Request, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const { title, prompt, model, tags, is_published } = req.body;

        if (!title || !prompt || !model) {
            return res.status(400).json({ error: 'title, prompt, and model are required' });
        }

        let image;
        try {
            image = validateUploadedImage(req.file);
        } catch {
            return res.status(400).json({ error: 'Unsupported or invalid image file' });
        }

        const { storageKey, url } = await uploadToAzure(req.file.buffer, image.fileName, image.mimeType);

        const published = is_published === 'true' || is_published === true;
        const result = await query(
            `INSERT INTO images (title, prompt, model, r2_key, url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, prompt, model, storageKey, url, published]
        );

        const imageId = result.rows[0].id;

        if (tags) {
            const tagNames = (tags as string).split(',').map((s: string) => s.trim()).filter(Boolean);
            for (const name of tagNames) {
                const slug = slugify(name);
                await query(
                    `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                    [name, slug]
                );
                const tagResult = await query('SELECT id FROM tags WHERE slug = $1', [slug]);
                if (tagResult.rows.length > 0) {
                    await query(
                        'INSERT INTO image_tags (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [imageId, tagResult.rows[0].id]
                    );
                }
            }
        }

        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error uploading image:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/admin/images/:id
router.patch('/images/:id', async (req, res) => {
    try {
        const { title, prompt, model, tags, is_published } = req.body;
        const updates: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        if (title !== undefined) { updates.push(`title = $${paramIdx++}`); params.push(title); }
        if (prompt !== undefined) { updates.push(`prompt = $${paramIdx++}`); params.push(prompt); }
        if (model !== undefined) { updates.push(`model = $${paramIdx++}`); params.push(model); }
        if (is_published !== undefined) { updates.push(`is_published = $${paramIdx++}`); params.push(is_published); }

        updates.push(`updated_at = NOW()`);

        if (updates.length === 1) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(req.params.id);
        const result = await query(
            `UPDATE images SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (tags !== undefined) {
            await query('DELETE FROM image_tags WHERE image_id = $1', [req.params.id]);
            const tagNames = (tags as string).split(',').map((s: string) => s.trim()).filter(Boolean);
            for (const name of tagNames) {
                const slug = slugify(name);
                await query(
                    `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                    [name, slug]
                );
                const tagResult = await query('SELECT id FROM tags WHERE slug = $1', [slug]);
                if (tagResult.rows.length > 0) {
                    await query(
                        'INSERT INTO image_tags (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [req.params.id, tagResult.rows[0].id]
                    );
                }
            }
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating image:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/images/:id — soft delete
router.delete('/images/:id', async (req, res) => {
    try {
        const result = await query(
            'UPDATE images SET is_deleted = true, updated_at = NOW() WHERE id = $1 RETURNING id',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        return res.json({ ok: true });
    } catch (err) {
        console.error('Error deleting image:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/tags
router.post('/tags', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Tag name is required' });
        }

        const slug = slugify(name);
        const result = await query(
            'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
            [name, slug]
        );

        return res.status(201).json(result.rows[0]);
    } catch (err: any) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Tag already exists' });
        }
        console.error('Error creating tag:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/admin/tags/:id
router.patch('/tags/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Tag name is required' });
        }

        const slug = slugify(name);
        const result = await query(
            'UPDATE tags SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
            [name, slug, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        return res.json(result.rows[0]);
    } catch (err: any) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Tag name already exists' });
        }
        console.error('Error updating tag:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/tags/:id — only if unused
router.delete('/tags/:id', async (req, res) => {
    try {
        const usage = await query(
            'SELECT COUNT(*) FROM image_tags WHERE tag_id = $1',
            [req.params.id]
        );

        if (parseInt(usage.rows[0].count) > 0) {
            return res.status(409).json({ error: 'Tag is in use' });
        }

        await query('DELETE FROM tags WHERE id = $1', [req.params.id]);
        return res.json({ ok: true });
    } catch (err) {
        console.error('Error deleting tag:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/products — all products for admin
router.get('/products', async (_req, res) => {
    try {
        const result = await query('SELECT * FROM cookie_products ORDER BY sort_order ASC, created_at ASC');
        return res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/products — create product
router.post('/products', async (req, res) => {
    const { name, description, price, image, category, badge, sort_order, is_limited, quantity } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'name and price are required' });
    }

    try {
        const result = await query(
            `INSERT INTO cookie_products (name, description, price, image, category, badge, sort_order, is_limited, quantity)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                name,
                description || '',
                Number(price),
                image || '',
                category || 'Classic',
                badge || null,
                Number(sort_order) || 0,
                Boolean(is_limited),
                is_limited && quantity != null ? Number(quantity) : null,
            ]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/admin/products/:id — update product
router.patch('/products/:id', async (req, res) => {
    const { name, description, price, image, category, badge, sort_order, is_active, is_limited, quantity } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    const addUpdate = (column: string, value: any) => {
        params.push(value);
        updates.push(`${column} = $${params.length}`);
    };

    if (name !== undefined) addUpdate('name', name);
    if (description !== undefined) addUpdate('description', description);
    if (price !== undefined) addUpdate('price', Number(price));
    if (image !== undefined) addUpdate('image', image);
    if (category !== undefined) addUpdate('category', category);
    if (badge !== undefined) addUpdate('badge', badge || null);
    if (sort_order !== undefined) addUpdate('sort_order', Number(sort_order) || 0);
    if (is_active !== undefined) addUpdate('is_active', Boolean(is_active));
    if (is_limited !== undefined) {
        addUpdate('is_limited', Boolean(is_limited));
        addUpdate('quantity', is_limited && quantity != null ? Number(quantity) : null);
    } else if (quantity !== undefined) {
        addUpdate('quantity', quantity != null ? Number(quantity) : null);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    try {
        params.push(req.params.id);
        const result = await query(
            `UPDATE cookie_products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/products/:id — delete product
router.delete('/products/:id', async (req, res) => {
    try {
        await query('DELETE FROM cookie_products WHERE id = $1', [req.params.id]);
        return res.json({ ok: true });
    } catch (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
    try {
        const stats = await query(`
      SELECT
        (SELECT COUNT(*) FROM images WHERE is_deleted = false) as total_images,
        (SELECT COUNT(*) FROM images WHERE is_published = true AND is_deleted = false) as total_published,
        (SELECT COALESCE(SUM(like_count), 0) FROM images) as total_likes,
        (SELECT COALESCE(SUM(copy_count), 0) FROM images) as total_copies,
        (SELECT COUNT(*) FROM prompt_copies WHERE created_at > NOW() - INTERVAL '7 days') as copies_this_week,
        (SELECT COUNT(*) FROM likes WHERE created_at > NOW() - INTERVAL '7 days') as likes_this_week,
        (SELECT COUNT(*) FROM images WHERE created_at > NOW() - INTERVAL '7 days' AND is_deleted = false) as uploads_this_week
    `);

        return res.json(stats.rows[0]);
    } catch (err) {
        console.error('Error fetching stats:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
