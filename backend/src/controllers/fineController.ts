import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

/** GET /api/fines — List fines with optional filters */
export async function getFines(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { playerId, status, limit } = req.query;

    const where: Record<string, unknown> = {};
    if (playerId) where.playerId = playerId as string;
    if (status) where.status = status as string;

    const fines = await prisma.fine.findMany({
      where,
      include: {
        player: true,
        fineType: true,
      },
      orderBy: { date: 'desc' },
      ...(limit && { take: parseInt(limit as string, 10) }),
    });

    res.json(fines);
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bøter' });
  }
}

/** GET /api/fines/:id — Get single fine */
export async function getFine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const fine = await prisma.fine.findUnique({
      where: { id },
      include: { player: true, fineType: true },
    });

    if (!fine) {
      res.status(404).json({ error: 'Bot ikkje funnen' });
      return;
    }

    res.json(fine);
  } catch (error) {
    console.error('Get fine error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bot' });
  }
}

/** POST /api/fines — Create a new fine (admin only) */
export async function createFine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { playerId, fineTypeId, amount, reason, date } = req.body;

    if (!playerId || !fineTypeId) {
      res.status(400).json({ error: 'Spelar og bøtetype er påkrevd' });
      return;
    }

    // Use fine type's default amount if not provided
    let fineAmount = amount;
    if (fineAmount === undefined || fineAmount === null) {
      const fineType = await prisma.fineType.findUnique({ where: { id: fineTypeId } });
      if (!fineType) {
        res.status(404).json({ error: 'Bøtetype ikkje funnen' });
        return;
      }
      fineAmount = fineType.amount;
    }

    const fine = await prisma.fine.create({
      data: {
        playerId,
        fineTypeId,
        amount: fineAmount,
        reason,
        date: date ? new Date(date) : new Date(),
      },
      include: { player: true, fineType: true },
    });

    res.status(201).json(fine);
  } catch (error) {
    console.error('Create fine error:', error);
    res.status(500).json({ error: 'Klarte ikkje opprette bot' });
  }
}

/** POST /api/fines/bulk — Create fines for multiple players at once (admin only) */
export async function bulkCreateFines(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { playerIds, fineTypeId, reason, amount } = req.body;

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0 || !fineTypeId) {
      res.status(400).json({ error: 'playerIds (array) og fineTypeId er påkrevd' });
      return;
    }

    const fineType = await prisma.fineType.findUnique({ where: { id: fineTypeId } });
    if (!fineType) {
      res.status(404).json({ error: 'Bøtetype ikkje funnen' });
      return;
    }

    const finalAmount = amount !== undefined && amount !== null ? Number(amount) : fineType.amount;

    const fines = await Promise.all(
      playerIds.map((playerId: string) =>
        prisma.fine.create({
          data: {
            playerId,
            fineTypeId,
            amount: finalAmount,
            reason: reason || null,
            date: new Date(),
          },
          include: { player: true, fineType: true },
        })
      )
    );

    res.status(201).json(fines);
  } catch (error) {
    console.error('Bulk create fines error:', error);
    res.status(500).json({ error: 'Klarte ikkje opprette bøter' });
  }
}

/** PUT /api/fines/:id — Update fine (admin only) */
export async function updateFine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { amount, reason, status, date } = req.body;

    const fine = await prisma.fine.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(reason !== undefined && { reason }),
        ...(status !== undefined && { status }),
        ...(date !== undefined && { date: new Date(date) }),
      },
      include: { player: true, fineType: true },
    });

    res.json(fine);
  } catch (error) {
    console.error('Update fine error:', error);
    res.status(500).json({ error: 'Klarte ikkje oppdatere bot' });
  }
}

/** DELETE /api/fines/:id — Delete fine (admin only) */
export async function deleteFine(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.fine.delete({ where: { id } });
    res.json({ message: 'Bot sletta' });
  } catch (error) {
    console.error('Delete fine error:', error);
    res.status(500).json({ error: 'Klarte ikkje slette bot' });
  }
}

/** PATCH /api/fines/:id/status — Toggle fine payment status (admin only) */
export async function updateFineStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PAID', 'UNPAID'].includes(status)) {
      res.status(400).json({ error: 'Ugyldig status. Må vere PAID eller UNPAID.' });
      return;
    }

    const fine = await prisma.fine.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
      include: { player: true, fineType: true },
    });

    res.json(fine);
  } catch (error) {
    console.error('Update fine status error:', error);
    res.status(500).json({ error: 'Klarte ikkje oppdatere betalingsstatus' });
  }
}
