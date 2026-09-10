import { Router } from 'express';
import { getSummary, getHealthScore } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/health-score', getHealthScore);

export default router;