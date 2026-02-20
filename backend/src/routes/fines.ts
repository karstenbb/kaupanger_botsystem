import { Router } from 'express';
import {
  getFines,
  getFine,
  createFine,
  bulkCreateFines,
  updateFine,
  deleteFine,
  updateFineStatus,
} from '../controllers/fineController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getFines);
router.get('/:id', authenticate, getFine);
router.post('/', authenticate, requireAdmin, createFine);
router.post('/bulk', authenticate, requireAdmin, bulkCreateFines);
router.put('/:id', authenticate, requireAdmin, updateFine);
router.delete('/:id', authenticate, requireAdmin, deleteFine);
router.patch('/:id/status', authenticate, requireAdmin, updateFineStatus);

export default router;
