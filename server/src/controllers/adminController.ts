import { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface AuthRequest extends Request {
    user?: any;
}

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const totalClients = await prisma.user.count({ where: { role: 'CLIENT' } });
        const totalBarbers = await prisma.user.count({ where: { role: 'BARBER' } });
        const totalRequests = await prisma.serviceRequest.count();
        const pendingRequests = await prisma.serviceRequest.count({ where: { status: 'PENDING' } });
        const completedRequests = await prisma.serviceRequest.count({ where: { status: 'COMPLETED' } });

        res.json({
            totalClients,
            totalBarbers,
            totalRequests,
            pendingRequests,
            completedRequests
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching admin stats' });
    }
};


export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const { id } = req.params as { id: string };

        // Prevent deleting self
        if (id === req.user.userId) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        // Delete associated date first (Prisma might handle this with Cascade if configured, but safe to be explicit or rely on relation onDelete)
        // With current simple schema, cascade delete on relations should be handled by database or Prisma.
        // Let's assume basic delete for now.

        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

export const getAllRequests = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const requests = await prisma.serviceRequest.findMany({
            include: {
                client: { select: { name: true, phone: true } },
                barber: { select: { name: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching all requests' });
    }
};
