import { Router, Request, Response } from 'express';
import { firebaseAdmin } from '../_lib/firebase';

const router = Router();

// GET /api/user/firebase-config
router.get('/firebase-config', (_req: Request, res: Response) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    });
});

// POST /api/user/verify-token
router.post('/verify-token', async (req: Request, res: Response) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: 'Missing idToken' });
    }

    try {
        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        return res.json({
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
        });
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// GET /api/user/profile
router.get('/profile', async (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = await firebaseAdmin.auth().verifyIdToken(auth.slice(7));
        const user = await firebaseAdmin.auth().getUser(decoded.uid);
        return res.json({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: user.metadata.creationTime,
        });
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
