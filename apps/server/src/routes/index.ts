import { Router } from 'express';
import authRoutes from './auth.routes';
import expensesRoutes from './expenses.routes';
import groupsRoutes from './groups.routes';
import subscriptionsRoutes from './subscriptions.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/expenses', expensesRoutes);
router.use('/users', usersRoutes);

// Health check endpoint - moved to main server file

export default router;