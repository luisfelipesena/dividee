import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import subscriptionRoutes from './routes/subscriptions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router; 