import { Router } from 'express';
import {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getPlayers);
router.get('/:id', authenticate, getPlayer);
router.post('/', authenticate, requireAdmin, createPlayer);
router.put('/:id', authenticate, requireAdmin, updatePlayer);
router.delete('/:id', authenticate, requireAdmin, deletePlayer);

export default router;
