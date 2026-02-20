import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../services/prisma';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

/** POST /api/auth/login — Authenticate user and return JWT */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Brukarnamn og passord er påkrevd' });
      return;
    }

    // Find user by username or email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: username, mode: 'insensitive' } },
        ],
      },
      include: { player: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Feil brukarnamn eller passord' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Feil brukarnamn eller passord' });
      return;
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        playerId: user.playerId,
        player: user.player,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Innlogging feila' });
  }
}

/** GET /api/auth/profile — Get current user profile */
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        player: {
          include: {
            fines: { include: { fineType: true }, orderBy: { date: 'desc' } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Brukar ikkje funnen' });
      return;
    }

    // Calculate player stats if linked
    let playerStats = null;
    if (user.player) {
      const totalFines = user.player.fines.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);
      const unpaidFines = user.player.fines
        .filter((f: { status: string }) => f.status === 'UNPAID')
        .reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);

      playerStats = {
        ...user.player,
        totalFines,
        unpaidFines,
        paidFines: totalFines - unpaidFines,
        fineCount: user.player.fines.length,
      };
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      playerId: user.playerId,
      player: playerStats,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente profil' });
  }
}

/** PUT /api/auth/profile — Update own profile */
export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username, email, password, name, position, number, birthDate } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { player: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Brukar ikkje funnen' });
      return;
    }

    // Check unique username/email if changed
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: 'insensitive' },
          id: { not: user.id },
        },
      });
      if (existing) {
        res.status(409).json({ error: 'Brukarnamn er allereie i bruk' });
        return;
      }
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          id: { not: user.id },
        },
      });
      if (existing) {
        res.status(409).json({ error: 'E-post er allereie i bruk' });
        return;
      }
    }

    // Update user fields
    const userData: Record<string, unknown> = {};
    if (username) userData.username = username.toLowerCase();
    if (email) userData.email = email.toLowerCase();
    if (password) {
      userData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: userData,
      include: { player: true },
    });

    // Update linked player if exists
    if (user.playerId) {
      const playerData: Record<string, unknown> = {};
      if (name) playerData.name = name;
      if (position !== undefined) playerData.position = position || null;
      if (number !== undefined) playerData.number = number ? Number(number) : null;
      if (birthDate !== undefined) playerData.birthDate = birthDate ? new Date(birthDate) : null;

      if (Object.keys(playerData).length > 0) {
        await prisma.player.update({
          where: { id: user.playerId },
          data: playerData,
        });
      }
    }

    // Re-fetch with updated player
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { player: true },
    });

    res.json({
      id: finalUser!.id,
      username: finalUser!.username,
      email: finalUser!.email,
      role: finalUser!.role,
      playerId: finalUser!.playerId,
      player: finalUser!.player,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Klarte ikkje oppdatere profil' });
  }
}

/** POST /api/auth/register — Public self-registration (creates User + Player) */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, name, birthDate, position, number } = req.body;

    if (!username || !password || !name || !birthDate || !position || !number) {
      res.status(400).json({ error: 'Alle felt er påkrevd' });
      return;
    }

    // Use username as email fallback
    const lowerUsername = username.toLowerCase();
    const userEmail = email || `${lowerUsername}@kaupanger.no`;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: lowerUsername, mode: 'insensitive' } },
          { email: { equals: userEmail, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Brukarnamn eller e-post finst allereie' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Player first, then User linked to it
    const player = await prisma.player.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        position,
        number: Number(number),
      },
    });

    const user = await prisma.user.create({
      data: {
        username: lowerUsername,
        email: userEmail.toLowerCase(),
        password: hashedPassword,
        role: 'USER',
        playerId: player.id,
      },
      include: { player: true },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        playerId: user.playerId,
        player: user.player,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registrering feila' });
  }
}
