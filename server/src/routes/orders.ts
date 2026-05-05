import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../db.js';
import { firebaseAdmin } from '../lib/firebase.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
const orderCreateLimiter = rateLimit('order-create', 60 * 1000, 20);
const orderVerifyLimiter = rateLimit('order-verify', 60 * 1000, 30);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Middleware: extract Firebase UID from Authorization header
async function authMiddleware(req: Request, res: Response, next: Function) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(auth.slice(7));
    (req as any).uid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/orders/razorpay-key — serve Razorpay key ID to frontend
router.get('/razorpay-key', (_req: Request, res: Response) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/orders/create — create Razorpay order + DB record
router.post('/create', orderCreateLimiter, authMiddleware, async (req: Request, res: Response) => {
  const { items, amount, currency = 'INR', shipping } = req.body;
  const uid = (req as any).uid;

  if (!items?.length || !amount || amount < 100) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  try {
    // Create Razorpay order (amount in paise)
    const rzOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: `order_${Date.now()}`,
    });

    // Save to DB
    await query(
      `INSERT INTO orders (firebase_uid, razorpay_order_id, amount, currency, status, items, shipping)
       VALUES ($1, $2, $3, $4, 'created', $5, $6)`,
      [uid, rzOrder.id, amount, currency, JSON.stringify(items), shipping ? JSON.stringify(shipping) : null]
    );

    return res.json({
      orderId: rzOrder.id,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
    });
  } catch (err: any) {
    console.error('Order create error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/orders/verify — verify Razorpay payment signature + update DB
router.post('/verify', orderVerifyLimiter, authMiddleware, async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  try {
    await query(
      `UPDATE orders SET status = 'paid', razorpay_payment_id = $1, updated_at = datetime('now')
       WHERE razorpay_order_id = $2`,
      [razorpay_payment_id, razorpay_order_id]
    );

    return res.json({ ok: true, message: 'Payment verified' });
  } catch (err) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// GET /api/orders/history — get user's orders
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  try {
    const result = await query(
      `SELECT id, razorpay_order_id, razorpay_payment_id, amount, currency, status, items, shipping, created_at
       FROM orders WHERE firebase_uid = $1 ORDER BY created_at DESC LIMIT 50`,
      [uid]
    );
    // Parse JSON string fields stored in SQLite TEXT columns
    const rows = result.rows.map((r: any) => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      shipping: r.shipping && typeof r.shipping === 'string' ? JSON.parse(r.shipping) : r.shipping,
    }));
    return res.json(rows);
  } catch (err) {
    console.error('Order history error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
