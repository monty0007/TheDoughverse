import './env.js';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.resolve(__dirname, '../schema-orders.sql'), 'utf-8');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

(async () => {
    for (const stmt of statements) {
        try {
            await client.execute(stmt);
        } catch (err: any) {
            console.error('❌ Migration failed:', err.message);
            process.exit(1);
        }
    }
    console.log('✅ Orders & Favourites tables created');
    process.exit(0);
})();
