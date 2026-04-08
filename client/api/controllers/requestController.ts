import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Server } from 'socket.io';

interface AuthRequest extends Request {
    user?: any;
    io?: Server;
}

export const createRequest = async (req: AuthRequest, res: Response) => {
    try {
        const clientId = req.user?.userId;
        const { barberId, serviceType, location, scheduledTime, price, latitude, longitude } = req.body;

        const request = await prisma.serviceRequest.create({
            data: {
                clientId,
                barberId,
                serviceType,
                location, // Address string
                scheduledTime: new Date(scheduledTime),
                price,
                latitude,
                longitude
            },
            include: {
                client: { select: { name: true, phone: true } }
            }
        });

        // Notify Barber
        if (req.io) {
            req.io.to(barberId).emit('new_request', request);
        }

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating request' });
    }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        const where = role === 'BARBER' ? { barberId: userId } : { clientId: userId };

        const requests = await prisma.serviceRequest.findMany({
            where,
            include: {
                client: { select: { name: true, phone: true } },
                barber: { select: { name: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching requests' });
    }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { status } = req.body;
        const userId = req.user?.userId;

        // Verify ownership (simplified for MVP)
        const request = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!request) return res.status(404).json({ error: 'Request not found' });

        if (request.barberId !== userId && request.clientId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await prisma.serviceRequest.update({
            where: { id },
            data: { status },
            include: {
                barber: { select: { name: true, phone: true } }
            }
        });

        // Notify Client
        if (req.io) {
            req.io.to(request.clientId).emit('request_status_updated', updated);
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error updating request' });
    }
};
