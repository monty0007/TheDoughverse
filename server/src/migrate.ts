import './env.js';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.resolve(__dirname, '../schema.sql'), 'utf-8');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
    console.log('🏗️  Running schema migration on Turso...');
    // Strip comment lines, then split by semicolon
    const statements = schema
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const sql of statements) {
        try {
            await client.execute(sql);
        } catch (err: any) {
            console.error(`❌ Failed: ${sql.slice(0, 60)}...\n`, err.message);
            process.exit(1);
        }
    }
    console.log(`✅ Schema applied (${statements.length} statements)`);
    process.exit(0);
}

migrate();
