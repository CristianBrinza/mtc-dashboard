//src/middleware/logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Logs incoming requests to the console.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`🟢 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

    if (Object.keys(req.body).length > 0) {
        console.log("📥 Request Body:", JSON.stringify(req.body, null, 2));
    }

    if (req.headers.authorization) {
        console.log("🔑 Authorization Header:", req.headers.authorization);
    }

    next();
};
