import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../_lib/db';
import { firebaseAdmin } from '../_lib/firebase';
import { rateLimit } from '../_middleware/security';

const router = Router();
const orderCreateLimiter = rateLimit('order-create', 60 * 1000, 20);
const orderVerifyLimiter = rateLimit('order-verify', 60 * 1000, 30);
const whaSubmitLimiter = rateLimit('wa-order-submit', 60 * 1000, 10);

let razorpay: Razorpay;
function getRazorpay() {
    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }
    return razorpay;
}

function generateOrderNumber(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `meow#${num}`;
}

async function optionalFirebaseAuth(req: Request, res: Response, next: Function) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
        try {
            const decoded = await firebaseAdmin.auth().verifyIdToken(auth.slice(7));
            (req as any).uid = decoded.uid;
        } catch {
            // ignore invalid token — allow guest orders
        }
    }
    next();
}

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

// GET /api/orders/razorpay-key
router.get('/razorpay-key', (_req: Request, res: Response) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/orders/create
router.post('/create', orderCreateLimiter, authMiddleware, async (req: Request, res: Response) => {
    const { items, amount, currency = 'INR', shipping } = req.body;
    const uid = (req as any).uid;

    if (!items?.length || !amount || amount < 100) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    try {
        const rzOrder = await getRazorpay().orders.create({
            amount,
            currency,
            receipt: `order_${Date.now()}`,
        });

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

// POST /api/orders/verify
router.post('/verify', orderVerifyLimiter, authMiddleware, async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment details' });
    }

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

// POST /api/orders/whatsapp — save a WhatsApp-based order to DB (guest + logged-in)
router.post('/whatsapp', whaSubmitLimiter, optionalFirebaseAuth, async (req: Request, res: Response) => {
    const { items, shipping, total } = req.body;
    const uid = (req as any).uid ?? null;

    if (!items?.length || !shipping?.name || !total) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    // Ensure a unique order number
    let orderNumber = generateOrderNumber();
    for (let i = 0; i < 5; i++) {
        const existing = await query('SELECT id FROM orders WHERE order_number = $1', [orderNumber]);
        if (!existing.rows.length) break;
        orderNumber = generateOrderNumber();
    }

    try {
        const result = await query(
            `INSERT INTO orders (firebase_uid, order_number, amount, currency, status, admin_status, items, shipping)
       VALUES ($1, $2, $3, 'INR', 'paid', 'pending', $4, $5)
       RETURNING id, order_number`,
            [uid, orderNumber, Math.round(total * 100), JSON.stringify(items), JSON.stringify(shipping)]
        );
        return res.json({ ok: true, orderNumber: result.rows[0].order_number, id: result.rows[0].id });
    } catch (err: any) {
        console.error('WhatsApp order save error:', err);
        return res.status(500).json({ error: 'Failed to save order' });
    }
});

// GET /api/orders/history
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
    const uid = (req as any).uid;
    try {
        const result = await query(
            `SELECT id, razorpay_order_id, razorpay_payment_id, amount, currency, status, items, shipping, created_at
       FROM orders WHERE firebase_uid = $1 ORDER BY created_at DESC LIMIT 50`,
            [uid]
        );
        return res.json(result.rows);
    } catch (err) {
        console.error('Order history error:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

export default router;
