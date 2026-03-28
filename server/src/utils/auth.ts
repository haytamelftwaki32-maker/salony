import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (userId: string, role: string) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-this-now';
    if (!process.env.JWT_SECRET) {
        console.warn('WARNING: JWT_SECRET is missing in environment variables. Using fallback.');
    }
    return jwt.sign({ userId, role }, secret, {
        expiresIn: '30d',
    });
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
