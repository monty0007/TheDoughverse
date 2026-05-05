// Load env vars FIRST — must be the very first import
import './env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isAllowedOrigin, normalizeAllowedOrigins, requireTrustedOrigin } from './middleware/security.js';

import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';
import tagRoutes from './routes/tags.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/orders.js';
import favouriteRoutes from './routes/favourites.js';
import productRoutes from './routes/products.js';
import { ensureContainer } from './lib/azureStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '4000');

app.disable('x-powered-by');

// Trust proxy for rate limiting behind reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security Middleware : Helmet
app.use(helmet());

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Middleware
const allowedOrigins = normalizeAllowedOrigins();

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (isAllowedOrigin(origin, allowedOrigins)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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

// Start
app.listen(PORT, async () => {
    console.log(`\n  🚀 Oryn API server running on http://localhost:${PORT}\n`);
    try {
        await ensureContainer();
        console.log('  ✅ Azure Blob container ready (public access confirmed)');
    } catch (err) {
        console.warn('  ⚠️  Azure Blob container check failed:', err);
    }
});
