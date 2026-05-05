import './env.js';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const migrations = [
  `ALTER TABLE orders ADD COLUMN order_number TEXT`,
  `ALTER TABLE orders ADD COLUMN admin_status TEXT NOT NULL DEFAULT 'pending'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`,
];

(async () => {
  for (const stmt of migrations) {
    try {
      await client.execute(stmt);
      console.log('✅', stmt.slice(0, 60));
    } catch (err: any) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⏭  Already applied:', stmt.slice(0, 60));
      } else {
        console.error('❌ Failed:', err.message);
      }
    }
  }
  console.log('Done.');
  process.exit(0);
})();
