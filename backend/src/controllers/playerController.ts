import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

/** GET /api/players — List all players with fine stats */
export async function getPlayers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const players = await prisma.player.findMany({
      include: {
        fines: { include: { fineType: true } },
        user: { select: { id: true, username: true, role: true } },
      },
      orderBy: { name: 'asc' },
    });

    const playersWithStats = players.map((player: typeof players[number]) => {
      const totalFines = player.fines.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);
      const unpaidFines = player.fines
        .filter((f: { status: string }) => f.status === 'UNPAID')
        .reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);

      return {
        id: player.id,
        name: player.name,
        position: player.position,
        number: player.number,
        birthDate: player.birthDate,
        avatarUrl: player.avatarUrl,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
        user: player.user || null,
        totalFines,
        totalUnpaid: unpaidFines,
        totalPaid: totalFines - unpaidFines,
        fineCount: player.fines.length,
      };
    });

    res.json(playersWithStats);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente spelarar' });
  }
}

/** GET /api/players/:id — Get single player with full fine history */
export async function getPlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        fines: {
          include: { fineType: true },
          orderBy: { date: 'desc' },
        },
        user: { select: { id: true, username: true, role: true } },
      },
    });

    if (!player) {
      res.status(404).json({ error: 'Spelar ikkje funnen' });
      return;
    }

    const totalFines = player.fines.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);
    const unpaidFines = player.fines
      .filter((f: { status: string }) => f.status === 'UNPAID')
      .reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);

    res.json({
      ...player,
      totalFines,
      totalUnpaid: unpaidFines,
      totalPaid: totalFines - unpaidFines,
      fineCount: player.fines.length,
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente spelar' });
  }
}

/** POST /api/players — Create new player (admin only) */
export async function createPlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, birthDate, position, number, avatarUrl } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Spelarnamn er påkrevd' });
      return;
    }

    const player = await prisma.player.create({
      data: { name, birthDate: birthDate ? new Date(birthDate) : null, position, number, avatarUrl },
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Klarte ikkje opprette spelar' });
  }
}

/** PUT /api/players/:id — Update player (admin only) */
export async function updatePlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, birthDate, position, number, avatarUrl } = req.body;

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(position !== undefined && { position }),
        ...(number !== undefined && { number }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    res.json(player);
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Klarte ikkje oppdatere spelar' });
  }
}

/** PUT /api/players/:id/role — Toggle player role (admin only) */
export async function updatePlayerRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      res.status(400).json({ error: 'Rolle må vere ADMIN eller USER' });
      return;
    }

    // Finn brukaren knytt til spelaren
    const user = await prisma.user.findFirst({ where: { playerId: id } });
    if (!user) {
      res.status(404).json({ error: 'Ingen brukar knytt til denne spelaren' });
      return;
    }

    // Ikkje la admin fjerne sin eigen admin-tilgang
    if (user.id === req.userId && role === 'USER') {
      res.status(400).json({ error: 'Du kan ikkje fjerne din eigen admin-tilgang' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update player role error:', error);
    res.status(500).json({ error: 'Klarte ikkje oppdatere rolle' });
  }
}

/** DELETE /api/players/:id — Delete player (admin only) */
export async function deletePlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.player.delete({ where: { id } });
    res.json({ message: 'Spelar sletta' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Klarte ikkje slette spelar' });
  }
}
