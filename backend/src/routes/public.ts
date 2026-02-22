import { Router, Request, Response } from 'express';
import prisma from '../services/prisma';

const router = Router();

/** GET /api/public/fines — Offentleg oversikt over alle bøter (ingen innlogging) */
router.get('/fines', async (_req: Request, res: Response) => {
  try {
    const fines = await prisma.fine.findMany({
      include: {
        player: { select: { id: true, name: true, number: true, position: true } },
        fineType: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(fines);
  } catch (error) {
    console.error('Public fines error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bøter' });
  }
});

/** GET /api/public/summary — Offentleg oppsummering */
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [fines, players] = await Promise.all([
      prisma.fine.findMany({ include: { player: true } }),
      prisma.player.findMany(),
    ]);

    const totalAmount = fines.reduce((sum, f) => sum + f.amount, 0);
    const unpaidAmount = fines.filter((f) => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);
    const paidAmount = fines.filter((f) => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0);

    // Top offenders
    const playerMap = new Map<string, { name: string; total: number; count: number }>();
    for (const f of fines) {
      const entry = playerMap.get(f.playerId) || { name: f.player.name, total: 0, count: 0 };
      entry.total += f.amount;
      entry.count++;
      playerMap.set(f.playerId, entry);
    }
    const topPlayers = Array.from(playerMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      totalFines: fines.length,
      totalAmount,
      paidAmount,
      unpaidAmount,
      totalPlayers: players.length,
      topPlayers,
    });
  } catch (error) {
    console.error('Public summary error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente oppsummering' });
  }
});

/** GET /api/public/fine-types — Offentleg oversikt over bottypar (ingen innlogging) */
router.get('/fine-types', async (_req: Request, res: Response) => {
  try {
    const fineTypes = await prisma.fineType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, amount: true, description: true },
    });
    res.json(fineTypes);
  } catch (error) {
    console.error('Public fine-types error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bottypar' });
  }
});

export default router;
