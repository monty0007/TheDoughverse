import './env.js';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugify } from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function runSchema(file: string) {
    const sql = fs.readFileSync(path.resolve(__dirname, file), 'utf-8');
    const statements = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (const stmt of statements) {
        await client.execute(stmt);
    }
}

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
    },
    {
        title: "Crystal Cavern",
        prompt: "Underground cave filled with glowing crystals, bioluminescent, fantasy landscape",
        model: "Flux.1",
        url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&q=80&w=1000",
        tags: ["Fantasy", "Nature", "Ethereal"]
    },
    {
        title: "Neon Samurai",
        prompt: "Futuristic samurai warrior in a neon-lit city, rain, blade runner style",
        model: "Midjourney v6",
        url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1000",
        tags: ["Cyberpunk", "Sci-Fi", "Character"]
    },
    {
        title: "Desert Oasis",
        prompt: "Golden hour in a surreal desert with floating islands, dreamscape",
        model: "DALL-E 3",
        url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000",
        tags: ["Landscape", "Surreal", "Nature"]
    },
];

async function seedData() {
    const existing = await client.execute('SELECT COUNT(*) as count FROM images');
    if (parseInt(String((existing.rows[0] as any).count)) > 0) {
        console.log(`⏩ Skipping seed — images already exist`);
        return;
    }

    console.log('🌱 Seeding mock data...');
    for (const img of MOCK_IMAGES) {
        const result = await client.execute({
            sql: `INSERT INTO images (title, prompt, model, r2_key, url, is_published)
                  VALUES (?, ?, ?, ?, ?, 1) RETURNING id`,
            args: [img.title, img.prompt, img.model, 'seed', img.url],
        });
        const imageId = (result.rows[0] as any).id;

        for (const tagName of img.tags) {
            const slug = slugify(tagName);
            await client.execute({ sql: `INSERT INTO tags (name, slug) VALUES (?, ?) ON CONFLICT (slug) DO NOTHING`, args: [tagName, slug] });
            const tagResult = await client.execute({ sql: 'SELECT id FROM tags WHERE slug = ?', args: [slug] });
            if (tagResult.rows.length > 0) {
                await client.execute({
                    sql: 'INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
                    args: [imageId, (tagResult.rows[0] as any).id],
                });
            }
        }
        console.log(`  ✅ ${img.title}`);
    }
    console.log('✅ Seeding complete!');
}

async function main() {
    try {
        console.log('🏗️  Applying schema...');
        await runSchema('../schema.sql');
        await runSchema('../schema-orders.sql');
        console.log('✅ Schema applied!');
        await seedData();
        console.log('\n🚀 Setup complete! Run `npm run dev` to start the server.');
    } catch (err) {
        console.error('❌ Setup failed:', err);
    }
    process.exit(0);
}

main();
