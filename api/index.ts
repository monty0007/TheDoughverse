import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { isAllowedOrigin, normalizeAllowedOrigins, rateLimit, requireTrustedOrigin, securityHeaders } from './_middleware/security.js';

import authRoutes from './_routes/auth.js';
import imageRoutes from './_routes/images.js';
import tagRoutes from './_routes/tags.js';
import adminRoutes from './_routes/admin.js';
import userRoutes from './_routes/user.js';
import orderRoutes from './_routes/orders.js';
import favouriteRoutes from './_routes/favourites.js';
import productRoutes from './_routes/products.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
const allowedOrigins = normalizeAllowedOrigins();

app.use(securityHeaders);
app.use(rateLimit('api-global', 15 * 60 * 1000, 300));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isAllowedOrigin(origin, allowedOrigins)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(requireTrustedOrigin(allowedOrigins));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    console.error('Unhandled API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
});

export default app;
