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
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
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

