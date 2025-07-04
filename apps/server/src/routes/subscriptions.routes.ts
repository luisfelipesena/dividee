import { Request, Response, Router } from 'express';
import { db } from '../db';
import { subscriptions, usersToSubscriptions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: Request, res: Response) => {
  const { name, iconUrl, totalCost, maxMembers, isPublic } = req.body;
  const ownerId = req.user!.id;

  try {
    const newSubscription = await db
      .insert(subscriptions)
      .values({
        name,
        iconUrl,
        totalCost: Math.round(totalCost * 100),
        maxMembers,
        isPublic,
        ownerId,
      })
      .returning();

    await db.insert(usersToSubscriptions).values({
      userId: ownerId,
      subscriptionId: newSubscription[0].id,
    });

    res.status(201).json(newSubscription[0]);
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível criar a assinatura.' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const userSubscriptions = await db.query.usersToSubscriptions.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    with: {
      subscription: true,
    },
  });

  const subscriptionsDetails = await Promise.all(
    userSubscriptions.map(async (userSub) => {
      if (!userSub.subscription) return null;

      const allMembers = await db.query.usersToSubscriptions.findMany({
        where: (table, { eq }) => eq(table.subscriptionId, userSub.subscriptionId),
      });

      return {
        id: userSub.subscription.id,
        name: userSub.subscription.name,
        icon: userSub.subscription.iconUrl,
        cost: userSub.subscription.totalCost / 100,
        members: allMembers.length,
        maxMembers: userSub.subscription.maxMembers,
      };
    })
  );

  res.json(subscriptionsDetails.filter(Boolean));
});

router.get('/public', async (req: Request, res: Response) => {
  const publicSubscriptions = await db.query.subscriptions.findMany({
    where: (table, { eq }) => eq(table.isPublic, true),
    with: {
      usersToSubscriptions: true,
    },
  });

  const response = publicSubscriptions.map((sub) => ({
    id: sub.id,
    name: sub.name,
    icon: sub.iconUrl,
    cost: sub.totalCost / 100,
    members: sub.usersToSubscriptions.length,
    maxMembers: sub.maxMembers,
  }));

  res.json(response);
});

router.post('/:id/join', async (req: Request, res: Response) => {
  const subscriptionId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    await db.insert(usersToSubscriptions).values({
      userId,
      subscriptionId,
    });
    res.status(200).json({ message: 'Inscrito com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível se inscrever.' });
  }
});

export default router; 