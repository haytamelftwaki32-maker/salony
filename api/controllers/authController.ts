import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';
import { normalizePhone } from '../utils/phoneUtils';

export const register = async (req: Request, res: Response) => {
    try {
        const { password, name, role } = req.body;
        const phone = normalizePhone(req.body.phone);

        if (!phone || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { phone },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                phone,
                name,
                role,
                password: hashedPassword
            },
        });

        // If barber, create empty profile
        if (role === 'BARBER') {
            await prisma.barberProfile.create({
                data: {
                    userId: user.id,
                    specialties: '[]',
                    priceRange: '$',
                    isAvailable: true
                }
            });
        }

        const token = generateToken(user.id, user.role);

        res.status(201).json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        const phone = normalizePhone(req.body.phone);

        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            console.log(`[AUTH] Login failed: User not found for phone ${phone}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
            console.log(`[AUTH] Login failed: Password mismatch for user ${phone}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('[AUTH] CRITICAL ERROR: JWT_SECRET is not set in environment variables.');
            return res.status(500).json({ error: 'Authentication service misconfigured' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
