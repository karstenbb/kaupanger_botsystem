import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

/** GET /api/dashboard — Aggregated stats and recent activity */
export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [totalAgg, unpaidAgg, paidAgg, recentFines, playerCount, fineTypeCount] =
      await Promise.all([
        prisma.fine.aggregate({
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.fine.aggregate({
          where: { status: 'UNPAID' },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.fine.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.fine.findMany({
          take: 10,
          orderBy: { date: 'desc' },
          include: { player: true, fineType: true },
        }),
        prisma.player.count(),
        prisma.fineType.count(),
      ]);

    // Monthly fine totals for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyFines = await prisma.fine.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, number> = {};
    monthlyFines.forEach((fine: { date: Date; amount: number }) => {
      const key = `${fine.date.getFullYear()}-${String(fine.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + fine.amount;
    });

    res.json({
      stats: {
        totalAmount: totalAgg._sum.amount || 0,
        totalFinesCount: totalAgg._count.id || 0,
        unpaidAmount: unpaidAgg._sum.amount || 0,
        unpaidCount: unpaidAgg._count.id || 0,
        paidAmount: paidAgg._sum.amount || 0,
        paidCount: paidAgg._count.id || 0,
        totalPlayers: playerCount,
        totalFineTypes: fineTypeCount,
      },
      recentFines,
      monthlyData,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente dashbord-data' });
  }
}
