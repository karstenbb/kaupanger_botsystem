import { Router, Response } from 'express';
import {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/playerController';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

/** GET /api/players/birthdays/today — Spelarar med bursdag i dag */
router.get('/birthdays/today', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const allPlayers = await prisma.player.findMany({
      where: { birthDate: { not: null } },
      select: { id: true, name: true, number: true, position: true, birthDate: true },
    });

    const birthdayPlayers = allPlayers.filter((p) => {
      if (!p.birthDate) return false;
      const bd = new Date(p.birthDate);
      return bd.getMonth() + 1 === month && bd.getDate() === day;
    });

    // Calculate age
    const result = birthdayPlayers.map((p) => {
      const bd = new Date(p.birthDate!);
      let age = today.getFullYear() - bd.getFullYear();
      const monthDiff = today.getMonth() - bd.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) {
        age--;
      }
      return { ...p, age };
    });

    res.json(result);
  } catch (error) {
    console.error('Birthday check error:', error);
    res.status(500).json({ error: 'Klarte ikkje sjekke bursdagar' });
  }
});

router.get('/', authenticate, getPlayers);
router.get('/:id', authenticate, getPlayer);
router.post('/', authenticate, requireAdmin, createPlayer);
router.put('/:id', authenticate, requireAdmin, updatePlayer);
router.delete('/:id', authenticate, requireAdmin, deletePlayer);

export default router;
