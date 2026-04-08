import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../utils/prisma';
import { comparePasswords, generateToken } from '../utils/auth';
import { normalizePhone } from '../utils/phoneUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password } = req.body;
        const phone = normalizePhone(req.body.phone);

        console.log(`[AUTH] User lookup for phone: ${phone}`);
        const user = await prisma.user.findUnique({
            where: { phone },
        });

        console.log(`[AUTH] Found: ${user ? 'YES' : 'NO'}`);

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isValid = await comparePasswords(password, user.password);
        console.log(`[AUTH] Password match: ${isValid ? 'YES' : 'NO'}`);
        
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('[AUTH] CRITICAL ERROR: JWT_SECRET is not set in environment variables.');
            return res.status(500).json({ error: 'Authentication service misconfigured' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ user, token });
    } catch (error: any) {
        console.error('[AUTH] Login Error:', error);
        res.status(500).json({ error: 'Server error during login', details: error.message });
    }
}
