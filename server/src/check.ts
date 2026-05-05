import { query } from './db.js';

async function check() {
    const images = await query(`SELECT COUNT(*) FROM images`);
    const tags = await query(`SELECT COUNT(*) FROM tags`);
    console.log('Images in DB:', images.rows[0].count);
    console.log('Tags in DB:', tags.rows[0].count);
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
