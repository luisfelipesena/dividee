import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../db';
import {
  expenseParticipants,
  expenses
} from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Create a new expense
router.post('/', async (req: Request, res: Response) => {
  const { subscriptionId, description, amount, category, date, participants } =
    req.body;
  const userId = req.user!.id;

  try {
    // Verify user is member of the subscription if subscriptionId is provided
    if (subscriptionId) {
      const membership = await db.query.usersToSubscriptions.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.userId, userId), eq(table.subscriptionId, subscriptionId)),
      });

      if (!membership) {
        return res
          .status(403)
          .json({ message: 'Você não é membro desta assinatura.' });
      }
    }

    const [newExpense] = await db
      .insert(expenses)
      .values({
        subscriptionId,
        userId,
        description,
        amount: Math.round(amount * 100), // Convert to cents
        category,
        date: date ? new Date(date) : new Date(),
      })
      .returning();

    if (participants && participants.length > 0) {
      const participantData = participants.map((participantId: number) => ({
        expenseId: newExpense.id,
        userId: participantId,
      }));
      await db.insert(expenseParticipants).values(participantData);
    }

    res.status(201).json({
      ...newExpense,
      amount: newExpense.amount / 100, // Convert back to currency
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Não foi possível criar a despesa.' });
  }
});

// Get expenses for a subscription
router.get('/subscription/:id', async (req: Request, res: Response) => {
  const subscriptionId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    // Verify user is member of the subscription
    const membership = await db.query.usersToSubscriptions.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userId), eq(table.subscriptionId, subscriptionId)),
    });

    if (!membership) {
      return res
        .status(403)
        .json({ message: 'Você não é membro desta assinatura.' });
    }

    const subscriptionExpenses = await db.query.expenses.findMany({
      where: eq(expenses.subscriptionId, subscriptionId),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
          },
        },
        participants: {
          with: {
            user: {
              columns: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: (table, { desc }) => [desc(table.date)],
    });

    const response = subscriptionExpenses.map((expense) => ({
      ...expense,
      amount: expense.amount / 100, // Convert back to currency
      participants: expense.participants.map((p) => p.user),
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar despesas.' });
  }
});

// Get expenses for a group
router.get('/group/:id', async (req: Request, res: Response) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    // Verify user is a member of the group
    const groupMembership = await db.query.usersToGroups.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userId), eq(table.groupId, groupId)),
    });

    if (!groupMembership) {
      return res.status(403).json({ message: 'Você não é membro deste grupo.' });
    }

    // Get all subscription IDs for the group
    const groupSubscriptions = await db.query.subscriptions.findMany({
      where: (table, { eq }) => eq(table.groupId, groupId),
      columns: { id: true },
    });

    if (groupSubscriptions.length === 0) {
      return res.json([]);
    }
    const subscriptionIds = groupSubscriptions.map((sub) => sub.id);

    // Get all expenses for those subscriptions
    const groupExpenses = await db.query.expenses.findMany({
      where: (table, { inArray }) => inArray(table.subscriptionId, subscriptionIds),
      with: {
        user: {
          columns: { id: true, fullName: true },
        },
        participants: {
          with: {
            user: { columns: { id: true, fullName: true } },
          },
        },
      },
      orderBy: (table, { desc }) => [desc(table.date)],
    });

    const response = groupExpenses.map((expense) => ({
      ...expense,
      amount: expense.amount / 100,
      participants: expense.participants.map((p) => p.user),
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    res.status(500).json({ message: 'Erro ao buscar despesas do grupo.' });
  }
});

// Get user's expenses across all subscriptions
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const userExpenses = await db.query.expenses.findMany({
      where: eq(expenses.userId, userId),
      with: {
        subscription: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (table, { desc }) => [desc(table.date)],
    });

    const response = userExpenses.map((expense) => ({
      ...expense,
      amount: expense.amount / 100, // Convert back to currency
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar suas despesas.' });
  }
});

// Get expense summary for user
router.get('/summary', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const userExpenses = await db.query.expenses.findMany({
      where: eq(expenses.userId, userId),
      with: {
        subscription: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate summary statistics
    const totalAmount = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expensesBySubscription = userExpenses.reduce((acc, expense) => {
      const subId = expense.subscriptionId;
      if (!acc[subId]) {
        acc[subId] = {
          subscriptionId: subId,
          subscriptionName: expense.subscription?.name || 'Unknown',
          totalAmount: 0,
          count: 0,
        };
      }
      acc[subId].totalAmount += expense.amount;
      acc[subId].count += 1;
      return acc;
    }, {} as Record<number, any>);

    const expensesByCategory = userExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Outros';
      if (!acc[category]) {
        acc[category] = {
          category,
          totalAmount: 0,
          count: 0,
        };
      }
      acc[category].totalAmount += expense.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    res.json({
      totalAmount: totalAmount / 100, // Convert to currency
      totalCount: userExpenses.length,
      bySubscription: Object.values(expensesBySubscription).map((item: any) => ({
        ...item,
        totalAmount: item.totalAmount / 100,
      })),
      byCategory: Object.values(expensesByCategory).map((item: any) => ({
        ...item,
        totalAmount: item.totalAmount / 100,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao gerar resumo de despesas.' });
  }
});

// Delete an expense
router.delete('/:id', async (req: Request, res: Response) => {
  const expenseId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    // Check if expense belongs to user
    const expense = await db.query.expenses.findFirst({
      where: (table, { eq }) => eq(table.id, expenseId),
    });

    if (!expense || expense.userId !== userId) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    await db.delete(expenses).where(eq(expenses.id, expenseId));

    res.json({ message: 'Despesa removida com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover despesa.' });
  }
});

export default router;