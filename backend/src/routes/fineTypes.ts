import { Router } from 'express';
import {
  getFineTypes,
  getFineType,
  createFineType,
  updateFineType,
  deleteFineType,
} from '../controllers/fineTypeController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getFineTypes);
router.get('/:id', authenticate, getFineType);
router.post('/', authenticate, requireAdmin, createFineType);
router.put('/:id', authenticate, requireAdmin, updateFineType);
router.delete('/:id', authenticate, requireAdmin, deleteFineType);

export default router;
