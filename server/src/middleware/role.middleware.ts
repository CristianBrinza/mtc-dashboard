// backend/src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            console.log(`🚫 [ROLE CHECK FAILED] Unauthorized access attempt to ${req.originalUrl}`);
            return res.status(401).json({message: 'Unauthorized'});
        }
        const userRoles: string[] = req.user.roles;
        // Check if the user has at least one of the required roles
        const hasRole = roles.some(role => userRoles.includes(role));
        if (!hasRole) {
            console.log(`⛔ [ACCESS DENIED] User: ${req.user.username} (Roles: ${userRoles.join(", ")}) tried accessing ${req.originalUrl} - Required roles: ${roles.join(", ")}`);
            return res.status(403).json({message: 'Forbidden: insufficient role'});
        }
        console.log(`✅ [ACCESS GRANTED] User: ${req.user.username} (Roles: ${userRoles.join(", ")}) accessed ${req.originalUrl}`);
        next();
    };
};
