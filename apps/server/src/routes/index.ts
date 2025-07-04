import { Router } from 'express';
import authRoutes from './auth.routes';
import groupsRoutes from './groups.routes';
import subscriptionsRoutes from './subscriptions.routes';
import expensesRoutes from './expenses.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/expenses', expensesRoutes);

// Health check endpoint - moved to main server file

export default router;