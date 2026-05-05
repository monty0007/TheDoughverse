import './env.js';
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Normalize JS values to types libSQL accepts
function normalizeArg(v: any): any {
    if (v === undefined || v === null) return null;
    if (v === true) return 1;
    if (v === false) return 0;
    return v;
}

/**
 * Drop-in replacement for pg's pool.query().
 * Converts PostgreSQL $N placeholders → SQLite ?, expanding repeated refs.
 * e.g. query("SELECT $1, $1", [42]) → execute("SELECT ?, ?", [42, 42])
 */
export async function query(text: string, params?: any[]) {
    const usedArgs: any[] = [];
    const sql = text.replace(/\$(\d+)/g, (_, n) => {
        usedArgs.push(normalizeArg((params ?? [])[parseInt(n, 10) - 1]));
        return '?';
    });
    const result = await client.execute({ sql, args: usedArgs });
    // Spread Row objects into plain objects so callers can use them normally
    return { rows: result.rows.map(r => ({ ...r })) as any[] };
}

export default client;

