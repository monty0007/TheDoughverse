import { createClient, type Client } from '@libsql/client';

let client: Client;

function getClient() {
    if (!client) {
        if (!process.env.TURSO_DATABASE_URL) {
            throw new Error('TURSO_DATABASE_URL is not defined in environment variables');
        }
        client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });
    }
    return client;
}

function normalizeArg(v: any): any {
    if (v === undefined || v === null) return null;
    if (v === true) return 1;
    if (v === false) return 0;
    return v;
}

/**
 * Drop-in replacement for pg's pool.query().
 * Converts PostgreSQL $N placeholders → SQLite ?, expanding repeated refs.
 */
export async function query(text: string, params?: any[]) {
    const usedArgs: any[] = [];
    const sql = text.replace(/\$(\d+)/g, (_, n) => {
        usedArgs.push(normalizeArg((params ?? [])[parseInt(n, 10) - 1]));
        return '?';
    });
    const result = await getClient().execute({ sql, args: usedArgs });
    return { rows: result.rows.map(r => ({ ...r })) as any[] };
}
