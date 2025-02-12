// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Retrieve token from cookie or Authorization header
    const token =
        req.cookies?.token ||
        req.header('Authorization')?.split(' ')[1];

    if (!token) {
        console.log(`🚫 [AUTH FAILURE] No token provided - Access denied to ${req.originalUrl}`);
        return res.status(401).json({message: 'No token, authorization denied'});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        console.log(`🔑 [AUTH SUCCESS] User: ${req.user.username} (ID: ${req.user.id}) | Roles: ${req.user.roles.join(", ")}`);
        next();
    } catch (error) {
        console.log(`🚨 [AUTH FAILURE] Invalid token - Access denied to ${req.originalUrl}`);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};
