import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkCreateTransactions,
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.post('/bulk', bulkCreateTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;