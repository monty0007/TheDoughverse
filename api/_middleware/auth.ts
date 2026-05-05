import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.oryn_admin_session;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).admin = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
}
