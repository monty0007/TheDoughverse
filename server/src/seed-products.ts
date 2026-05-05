import './env.js';
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

const products = [
    { name: 'Classic Chocolate Chip', description: 'Timeless golden cookie loaded with semi-sweet chocolate chips and a hint of vanilla.', price: 150, image: '', category: 'Classic', badge: 'BESTSELLER', sort_order: 1 },
    { name: 'Butter Crunch', description: 'Melt-in-your-mouth buttery cookie with a satisfying crispy edge and soft center.', price: 120, image: '', category: 'Classic', badge: null, sort_order: 2 },
    { name: 'Double Chocolate', description: 'Rich dark cocoa cookie studded with chocolate chunks — for the true choco lover.', price: 180, image: '', category: 'Chocolate', badge: 'NEW', sort_order: 3 },
    { name: 'Oatmeal Raisin', description: 'Hearty oat cookie with plump raisins and warm cinnamon spice.', price: 140, image: '', category: 'Classic', badge: null, sort_order: 4 },
    { name: 'Peanut Butter', description: 'Dense, chewy cookie with a deep roasted peanut flavour and criss-cross top.', price: 160, image: '', category: 'Classic', badge: null, sort_order: 5 },
    { name: 'White Chocolate Macadamia', description: 'Buttery cookie packed with creamy white chocolate and crunchy macadamia nuts.', price: 200, image: '', category: 'Specialty', badge: 'SEASONAL', sort_order: 6 },
    { name: 'Snickerdoodle', description: 'Soft cinnamon-sugar cookie with a crinkled top and a warm, spiced finish.', price: 140, image: '', category: 'Classic', badge: null, sort_order: 7 },
    { name: 'Triple Chocolate Chunk', description: 'Ultra-indulgent cookie with dark, milk, and white chocolate chunks in every bite.', price: 220, image: '', category: 'Chocolate', badge: 'LIMITED', sort_order: 8 },
];

async function main() {
    const existing = await client.execute('SELECT COUNT(*) as cnt FROM cookie_products');
    const count = Number((existing.rows[0] as any).cnt);
    if (count > 0) {
        console.log(`⏩ Already has ${count} products, skipping seed.`);
        process.exit(0);
    }

    for (const p of products) {
        await client.execute({
            sql: `INSERT INTO cookie_products (name, description, price, image, category, badge, sort_order, is_limited, quantity)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)`,
            args: [p.name, p.description, p.price, p.image, p.category, p.badge, p.sort_order],
        });
        console.log(`✅ Seeded: ${p.name}`);
    }
    console.log('✅ Seed complete');
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
