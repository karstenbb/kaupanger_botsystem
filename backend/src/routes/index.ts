import { Router } from 'express';
import authRoutes from './auth';
import playerRoutes from './players';
import fineRoutes from './fines';
import fineTypeRoutes from './fineTypes';
import leaderboardRoutes from './leaderboard';
import dashboardRoutes from './dashboard';
import schedulerRoutes from './scheduler';
import publicRoutes from './public';
import rulesRoutes from './rules';

const router = Router();

router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/fines', fineRoutes);
router.use('/fine-types', fineTypeRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/scheduler', schedulerRoutes);
router.use('/public', publicRoutes);
router.use('/rules', rulesRoutes);

export default router;
