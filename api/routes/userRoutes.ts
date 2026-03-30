import { Router } from 'express';
import { getBarbers, updateProfile, getMyProfile, uploadPortfolioImage, uploadImage, updateAvatar, changePassword } from '../controllers/userController';
import { getDashboardStats, getAllUsers, deleteUser, getAllRequests } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/barbers', getBarbers);

// Protected routes
router.get('/me', authenticateToken, getMyProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/portfolio/upload', authenticateToken, upload.single('image'), uploadPortfolioImage);
router.post('/avatar', authenticateToken, upload.single('image'), updateAvatar);
router.post('/upload', authenticateToken, upload.single('image'), uploadImage);

// Admin Routes
router.get('/admin/stats', authenticateToken, getDashboardStats);
router.get('/admin/users', authenticateToken, getAllUsers);
router.delete('/admin/users/:id', authenticateToken, deleteUser);
router.get('/admin/requests', authenticateToken, getAllRequests);

export default router;
