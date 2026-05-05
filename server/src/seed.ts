import { query } from './db.js';
import { slugify } from './routes/admin.js';

const MOCK_IMAGES = [
    {
        title: "Celestial Explorer",
        prompt: "A lone astronaut floating in a nebula, cinematic lighting, ultra-realistic, 8k",
        model: "Midjourney v6",
        url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
        tags: ["Space", "Sci-Fi", "Cinematic"]
    },
    {
        title: "Cyberpunk Tokyo",
        prompt: "Tokyo streets at night, neon lights, rain reflections, cyberpunk aesthetic",
        model: "Stable Diffusion XL",
        url: "https://images.unsplash.com/photo-1545641203-7d072a14e3b2?auto=format&fit=crop&q=80&w=1000",
        tags: ["Cyberpunk", "City", "Neon"]
    },
    {
        title: "Ethereal Forest",
        prompt: "Glowing mushrooms in a dark ancient forest, magical atmosphere, fantasy art",
        model: "Flux.1",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000",
        tags: ["Nature", "Fantasy", "Ethereal"]
    },
    {
        title: "Ancient Automaton",
        prompt: "Rusty steam-powered robot in a Victorian library, steampunk style",
        model: "DALL-E 3",
        url: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1000",
        tags: ["Steampunk", "Robot", "Retro"]
    },
    {
        title: "Vibrant Abstract",
        prompt: "Explosion of colors, liquid paint textures, abstract expressionism",
        model: "Midjourney v6",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1000",
        tags: ["Abstract", "Color", "Modern"]
    }
];

async function seed() {
    console.log('🌱 Starting seed...');

    try {
        for (const img of MOCK_IMAGES) {
            console.log(`Processing: ${img.title}`);

            // Insert image
            const result = await query(
                `INSERT INTO images (title, prompt, model, r2_key, url, is_published)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
                [img.title, img.prompt, img.model, 'mock-seed', img.url]
            );

            const imageId = result.rows[0].id;

            // Handle tags
            for (const tagName of img.tags) {
                const slug = slugify(tagName);
                await query(
                    `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                    [tagName, slug]
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

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit(0);
    }
}

seed();
