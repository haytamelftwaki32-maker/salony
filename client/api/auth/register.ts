import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../utils/prisma';
import { hashPassword, generateToken } from '../utils/auth';
import { normalizePhone } from '../utils/phoneUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                phone,
                name,
                role,
                password: hashedPassword
            },
        });

        console.log(`[AUTH] Registration COMPLETE. User ${phone} verified in DB: YES`);

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
    } catch (error: any) {
        console.error('[AUTH] Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration', details: error.message });
    }
}
