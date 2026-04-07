import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './utils/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userCount = await prisma.user.count();
        res.status(200).json({ 
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
}
