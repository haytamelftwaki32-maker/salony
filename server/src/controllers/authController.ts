import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response) => {
    try {
        const { phone, password, name, role } = req.body;

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

        // In a real app we would store password, but for now let's just assume we store it.
        // I will execute a schema update right after this.

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
        const { phone, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });

        const token = generateToken(user.id, user.role);
        res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
