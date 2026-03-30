import { Router } from 'express';
import { createRequest, getMyRequests, updateRequestStatus } from '../controllers/requestController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken); // Protect all routes

router.post('/', createRequest);
router.get('/', getMyRequests);
router.put('/:id/status', updateRequestStatus);

export default router;
