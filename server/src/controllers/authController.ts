import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';

const normalizePhone = (phone: string): string => {
    // Remove all non-numeric characters
    let normalized = phone.replace(/\D/g, '');
    
    // If it starts with 0 and has 10 digits (Moroccan local format), remove the leading 0
    if (normalized.startsWith('0') && normalized.length === 10) {
        normalized = normalized.substring(1);
    }
    
    // If it starts with 212 (Moroccan international code), remove it
    if (normalized.startsWith('212')) {
        normalized = normalized.substring(3);
        // Sometimes users type 21206... so strip the 0 again if it's there
        if (normalized.startsWith('0')) normalized = normalized.substring(1);
    }
    
    return normalized;
};

export const register = async (req: Request, res: Response) => {
    try {
        const { phone, password, name, role } = req.body;

        if (!phone || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const normalizedPhone = normalizePhone(phone);

        const existingUser = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                phone: normalizedPhone,
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
        const normalizedPhone = normalizePhone(phone);

        const user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
        });

        if (!user) {
            console.log(`[Auth] Login attempt failed: User not found for phone ${normalizedPhone}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
            console.log(`[Auth] Login attempt failed: Password mismatch for phone ${normalizedPhone}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
