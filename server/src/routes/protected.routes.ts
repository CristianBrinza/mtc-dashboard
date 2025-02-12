// backend/src/routes/protected.routes.ts
import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// Example route accessible only to admin users
router.get('/admin', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response) => {
    res.json({ message: 'Hello Admin' });
});

// Example route accessible to smm, admin, and manager roles
router.get('/smm', authenticateJWT, authorizeRoles('smm', 'admin', 'manager'), (req: Request, res: Response) => {
    res.json({ message: 'Hello SMM user' });
});

// Example route accessible to manager and admin roles
router.get('/options', authenticateJWT, authorizeRoles('manager', 'admin'), (req: Request, res: Response) => {
    res.json({ message: 'Hello Manager or Admin' });
});

export default router;
