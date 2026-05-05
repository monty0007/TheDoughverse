import { query } from './src/db.js';

async function main() {
    const res = await query('SELECT id, title, is_published, is_deleted FROM images ORDER BY created_at DESC LIMIT 5');
    console.log(res.rows);
    process.exit(0);
}

main().catch(console.error);
