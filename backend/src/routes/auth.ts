import { Router } from 'express';
import { login, getProfile, register } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticate, getProfile);

export default router;
