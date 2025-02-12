// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';
import { setupSwagger } from './swagger';
import { requestLogger } from './middleware/logger.middleware';
import categoryRoutes from "./routes/category.routes";
import socialAccountRoutes from "./routes/socialAccount.routes";

dotenv.config();
const app = express();

app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins but still support credentials
        callback(null, true);
    },
    credentials: true, // ✅ Allow cookies, headers, and authentication tokens
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // ✅ Allow required HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Allow required headers
}));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/categories', categoryRoutes);
app.use('/api/social-accounts', socialAccountRoutes);


setupSwagger(app);

const PORT = process.env.PORT || 5020;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use(requestLogger);

