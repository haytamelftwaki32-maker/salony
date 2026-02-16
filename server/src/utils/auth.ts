import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
