import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

/** GET /api/fine-types — List all fine types with usage count */
export async function getFineTypes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const fineTypes = await prisma.fineType.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { fines: true } },
      },
    });

    res.json(fineTypes);
  } catch (error) {
    console.error('Get fine types error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bøtetypar' });
  }
}

/** GET /api/fine-types/:id — Get single fine type with fines */
export async function getFineType(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const fineType = await prisma.fineType.findUnique({
      where: { id },
      include: {
        fines: {
          include: { player: true },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!fineType) {
      res.status(404).json({ error: 'Bøtetype ikkje funnen' });
      return;
    }

    res.json(fineType);
  } catch (error) {
    console.error('Get fine type error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bøtetype' });
  }
}

/** POST /api/fine-types — Create new fine type (admin only) */
export async function createFineType(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, amount, description, category } = req.body;

    if (!name || amount === undefined) {
      res.status(400).json({ error: 'Namn og beløp er påkrevd' });
      return;
    }

    const fineType = await prisma.fineType.create({
      data: { name, amount, description, category: category || 'Generelt' },
    });

    res.status(201).json(fineType);
  } catch (error) {
    console.error('Create fine type error:', error);
    res.status(500).json({ error: 'Klarte ikkje opprette bøtetype' });
  }
}

/** PUT /api/fine-types/:id — Update fine type (admin only) */
export async function updateFineType(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, amount, description, category } = req.body;

    const fineType = await prisma.fineType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(amount !== undefined && { amount }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
      },
    });

    res.json(fineType);
  } catch (error) {
    console.error('Update fine type error:', error);
    res.status(500).json({ error: 'Klarte ikkje oppdatere bøtetype' });
  }
}

/** DELETE /api/fine-types/:id — Delete fine type (admin only) */
export async function deleteFineType(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Prevent deletion if fine type has associated fines
    const finesCount = await prisma.fine.count({ where: { fineTypeId: id } });

    if (finesCount > 0) {
      res.status(400).json({
        error: `Kan ikkje slette bøtetype med ${finesCount} tilknytta bøter`,
      });
      return;
    }

    await prisma.fineType.delete({ where: { id } });
    res.json({ message: 'Bøtetype sletta' });
  } catch (error) {
    console.error('Delete fine type error:', error);
    res.status(500).json({ error: 'Klarte ikkje slette bøtetype' });
  }
}
