import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import groupRoutes from './routes/groups.routes';
import subscriptionRoutes from './routes/subscriptions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/groups', groupRoutes);

export default router; 