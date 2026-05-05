import './env.js';
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
    try {
        await client.execute('ALTER TABLE cookie_products ADD COLUMN is_limited INTEGER DEFAULT 0');
        console.log('✅ Added is_limited column');
    } catch (e: any) {
        if (e.message?.includes('duplicate column')) {
            console.log('⏩ is_limited already exists');
        } else { throw e; }
    }
    try {
        await client.execute('ALTER TABLE cookie_products ADD COLUMN quantity INTEGER DEFAULT NULL');
        console.log('✅ Added quantity column');
    } catch (e: any) {
        if (e.message?.includes('duplicate column')) {
            console.log('⏩ quantity already exists');
        } else { throw e; }
    }
    console.log('✅ Products migration done');
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
