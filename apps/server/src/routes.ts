import { Router } from 'express';
import { db } from './db';
import { subscriptions, users, usersToSubscriptions } from './db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware/auth';

const router = Router();

// User Registration
router.post('/auth/register', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db
      .insert(users)
      .values({ fullName, email, password: hashedPassword })
      .returning({ id: users.id, fullName: users.fullName, email: users.email });

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível registrar o usuário. O e-mail já pode estar em uso.' });
  }
});

// User Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    return;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'E-mail ou senha inválidos' });
    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.json({ token });
});

router.use(authMiddleware);

// Create a new subscription
router.post('/subscriptions', async (req: any, res) => {
  const { name, iconUrl, totalCost, maxMembers, isPublic } = req.body;
  const ownerId = req.user.id;

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

// Get user's subscriptions
router.get('/subscriptions', async (req: any, res) => {
  const userId = req.user.id;

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

// Get public subscriptions
router.get('/subscriptions/public', async (req, res) => {
  const publicSubscriptions = await db.query.subscriptions.findMany({
    where: (table, { eq }) => eq(table.isPublic, true),
    with: {
      usersToSubscriptions: true,
    },
  });

  const response = publicSubscriptions.map(
    (sub) => ({
      id: sub.id,
      name: sub.name,
      icon: sub.iconUrl,
      cost: sub.totalCost / 100,
      members: sub.usersToSubscriptions.length,
      maxMembers: sub.maxMembers,
    })
  );
  
  res.json(response);
});

// Join a subscription
router.post('/subscriptions/:id/join', async (req: any, res) => {
  const subscriptionId = parseInt(req.params.id, 10);
  const userId = req.user.id;

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