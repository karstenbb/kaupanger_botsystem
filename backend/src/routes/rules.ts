import { Router, Response } from 'express';
import prisma from '../services/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/** PUT /api/rules — Oppdater reglar (kun admin) */
router.put(
  '/',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { content } = req.body;
      if (typeof content !== 'string') {
        res.status(400).json({ error: 'Innhald (content) er påkrevd' });
        return;
      }

      const row = await prisma.siteContent.upsert({
        where: { key: 'rules' },
        update: { content },
        create: { key: 'rules', content },
      });

      res.json({ content: row.content, updatedAt: row.updatedAt });
    } catch (error) {
      console.error('Update rules error:', error);
      res.status(500).json({ error: 'Klarte ikkje lagre reglar' });
    }
  },
);

export default router;
