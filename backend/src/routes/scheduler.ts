import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { checkBotfriMaaned, checkForseinBetaling } from '../services/scheduler';

const router = Router();

/** POST /api/scheduler/run-botfri — Manuell køyring av botfri-sjekk (admin) */
router.post('/run-botfri', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    await checkBotfriMaaned();
    res.json({ message: 'Botfri-sjekk køyrd!' });
  } catch (error) {
    console.error('Manual botfri check error:', error);
    res.status(500).json({ error: 'Klarte ikkje køyre botfri-sjekk' });
  }
});

/** POST /api/scheduler/run-forsein — Manuell køyring av forsein-sjekk (admin) */
router.post('/run-forsein', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    await checkForseinBetaling();
    res.json({ message: 'Forsein-betaling-sjekk køyrd!' });
  } catch (error) {
    console.error('Manual forsein check error:', error);
    res.status(500).json({ error: 'Klarte ikkje køyre forsein-sjekk' });
  }
});

export default router;
