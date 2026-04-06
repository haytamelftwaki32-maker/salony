import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for dev
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make io accessible in routes
app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

app.get('/api/debug', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ 
            status: "ok", 
            database: "connected",
            userCount,
            env: {
                DATABASE_URL: !!process.env.DATABASE_URL,
                JWT_SECRET: !!process.env.JWT_SECRET,
                NODE_ENV: process.env.NODE_ENV
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[API DEBUG] Error:', error);
        res.status(500).json({ 
            status: "error", 
            database: "disconnected",
            error: error.message,
            env: {
                DATABASE_URL: !!process.env.DATABASE_URL,
                JWT_SECRET: !!process.env.JWT_SECRET,
                NODE_ENV: process.env.NODE_ENV
            }
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Barber SaaS API is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

app.get('/', (req, res) => {
    res.send('Barber SaaS API is running');
});

// For local testing:
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
