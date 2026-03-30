import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Helper interface for authenticated request
interface AuthRequest extends Request {
    user?: any;
}

export const getBarbers = async (req: Request, res: Response) => {
    try {
        const barbers = await prisma.barberProfile.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        image: true,
                    }
                }
            }
        });
        res.json(barbers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching barbers' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { specialties, priceRange, isAvailable, bio, latitude, longitude, district, services, startingPrice, portfolio } = req.body;

        const profile = await prisma.barberProfile.update({
            where: { userId },
            data: {
                specialties,
                priceRange,
                isAvailable,
                bio,
                latitude,
                longitude,
                district,
                services,
                startingPrice: startingPrice ? Number(startingPrice) : undefined,
                portfolio
            }
        });

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                barberProfile: role === 'BARBER'
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
};

export const uploadPortfolioImage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/portfolio/${req.file.filename}`;

        const profile = await prisma.barberProfile.findUnique({ where: { userId } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const portfolio = JSON.parse(profile.portfolio || '[]');
        portfolio.push(imageUrl);

        await prisma.barberProfile.update({
            where: { userId },
            data: { portfolio: JSON.stringify(portfolio) }
        });

        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading image' });
    }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/portfolio/${req.file.filename}`;

        await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl }
        });

        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error updating avatar' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // Get user with current password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const { comparePasswords, hashPassword } = await import('../utils/auth');
        const isValidPassword = await comparePasswords(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Error updating password' });
    }
};


export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imageUrl = `/uploads/portfolio/${req.file.filename}`;
        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading image' });
    }
};
