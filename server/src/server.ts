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
import path from "path";
import fs from "fs";
import { createServer } from 'http';
import { Server } from 'socket.io';
import tagRoutes from "./routes/tag.routes";
import typeRoutes from "./routes/type.routes";
import instagramRoutes from "./routes/instagram.routes";
import smmPostRoutes from "./routes/smmPost.routes";
import notificationRoutes from "./routes/notification.routes";
import {startInstagramCron} from "./services/instagramCron";

dotenv.config();
const app = express();

// ---------- 1) Setup CORS & Basic Middleware ----------
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

// ---------- 2) Connect Database ----------
connectDB();

// ---------- 3) Create HTTP & Socket.IO Servers ----------
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow any frontend
        methods: ["GET", "POST"]
    }
});

// ---------- 4) Track Online Users (Example) ----------
const onlineUsers = new Map<string, { username: string, profilePicture: string }>();

io.on('connection', (socket) => {
    console.log(`🟢 New user connected: ${socket.id}`);

    socket.on("userOnline", (userData) => {
        if (userData?.id) {
            onlineUsers.set(userData.id, {
                username: userData.username,
                profilePicture: userData.profilePicture
            });
            io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
        }
    });

    socket.on("userOffline", (userId) => {
        if (onlineUsers.has(userId)) {
            onlineUsers.delete(userId);
            io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
        for (const [id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(id);
                io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
                break;
            }
        }
    });
});

// ---------- 5) Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/social-accounts', socialAccountRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/smmpost', smmPostRoutes);
app.use('/api/notifications', notificationRoutes);

// ---------- 6) Serve 'uploads' / 'insta' Folders Statically ----------
// (A) 'uploads' for profile pictures or other files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// (B) 'insta' for Instagram-downloaded images
const instaDir = path.join(__dirname, '../insta');
if (!fs.existsSync(instaDir)) {
    fs.mkdirSync(instaDir, { recursive: true });
}
app.use('/insta', express.static(instaDir));

// ---------- 7) Swagger Setup ----------
setupSwagger(app);

// ---------- 8) Services ----------
startInstagramCron();

// ---------- 9) Start Server ----------
const PORT = process.env.PORT || 5020;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ---------- 10) Request Logger (Optional) ----------
app.use(requestLogger);
