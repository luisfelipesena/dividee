import { eq, inArray } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../db';
import { subscriptions, usersToSubscriptions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: Request, res: Response) => {
  const {
    name,
    iconUrl,
    totalCost,
    maxMembers,
    isPublic,
    groupId,
    participants,
  } = req.body;
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
        groupId,
      })
      .returning();

    const allMemberIds = [...new Set([ownerId, ...(participants || [])])];

    const usersToSubscriptionsData = allMemberIds.map((userId) => ({
      userId,
      subscriptionId: newSubscription[0].id,
    }));

    if (usersToSubscriptionsData.length > 0) {
      await db.insert(usersToSubscriptions).values(usersToSubscriptionsData);
    }

    res.status(201).json(newSubscription[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Não foi possível criar a assinatura.' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const userSubIds = await db
      .select({ subscriptionId: usersToSubscriptions.subscriptionId })
      .from(usersToSubscriptions)
      .where(eq(usersToSubscriptions.userId, userId));

    if (userSubIds.length === 0) {
      return res.json([]);
    }

    const subscriptionIds = userSubIds.map((s) => s.subscriptionId);

    const result = await db.query.subscriptions.findMany({
      where: inArray(subscriptions.id, subscriptionIds),
      with: {
        usersToSubscriptions: {
          columns: {
            userId: true,
          },
        },
      },
    });

    const response = result.map((sub) => ({
      id: sub.id,
      name: sub.name,
      icon: sub.iconUrl,
      cost: sub.totalCost / 100,
      members: sub.usersToSubscriptions.length,
      maxMembers: sub.maxMembers,
      isPublic: sub.isPublic,
      ownerId: sub.ownerId,
      groupId: sub.groupId,
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar assinaturas.' });
  }
});

router.get('/public', async (req: Request, res: Response) => {
  try {
    const publicSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.isPublic, true),
      with: {
        usersToSubscriptions: {
          columns: {
            userId: true,
          },
        },
      },
    });

    const response = publicSubscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      icon: sub.iconUrl,
      cost: sub.totalCost / 100,
      members: sub.usersToSubscriptions.length,
      maxMembers: sub.maxMembers,
      isPublic: sub.isPublic,
      ownerId: sub.ownerId,
      groupId: sub.groupId,
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar assinaturas públicas.' });
  }
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