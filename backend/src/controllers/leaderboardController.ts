import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

/** GET /api/leaderboard — Player rankings by total fines amount */
export async function getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const players = await prisma.player.findMany({
      include: { fines: true },
    });

    const leaderboard = players
      .map((player) => {
        const totalAmount = player.fines.reduce((sum, f) => sum + f.amount, 0);
        const unpaidAmount = player.fines
          .filter((f) => f.status === 'UNPAID')
          .reduce((sum, f) => sum + f.amount, 0);

        return {
          id: player.id,
          name: player.name,
          position: player.position,
          number: player.number,
          avatarUrl: player.avatarUrl,
          totalAmount,
          unpaidAmount,
          fineCount: player.fines.length,
        };
      })
      .filter((p) => p.fineCount > 0) // Only show players with fines
      .sort((a, b) => b.totalAmount - a.totalAmount);

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente toppliste' });
  }
}
