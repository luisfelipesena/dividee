import { and, eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../db';
import { groups, invitations, usersToGroups } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Create a new group
router.post('/', async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const ownerId = req.user!.id;

  try {
    const newGroup = await db
      .insert(groups)
      .values({
        name,
        description,
        ownerId,
      })
      .returning();

    // Add owner as admin member
    await db.insert(usersToGroups).values({
      userId: ownerId,
      groupId: newGroup[0].id,
      role: 'admin',
    });

    res.status(201).json(newGroup[0]);
  } catch {
    res.status(500).json({ message: 'Não foi possível criar o grupo.' });
  }
});

// Get user's groups
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const userGroups = await db.query.usersToGroups.findMany({
      where: (table, { eq }) => eq(table.userId, userId),
      with: {
        group: true,
      },
    });

    const groupsDetails = userGroups
      .filter((ug) => ug.group)
      .map((ug) => ({
        ...ug.group,
        role: ug.role,
      }));

    res.json(groupsDetails);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar grupos.' });
  }
});

// Get group details
router.get('/:id', async (req: Request, res: Response) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    // Check if user is member of the group
    const membership = await db.query.usersToGroups.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userId), eq(table.groupId, groupId)),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Você não é membro deste grupo.' });
    }

    const group = await db.query.groups.findFirst({
      where: (table, { eq }) => eq(table.id, groupId),
      with: {
        usersToGroups: {
          with: {
            user: true,
          },
        },
        subscriptions: true,
      },
    });

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado.' });
    }

    res.json({
      ...group,
      members: group.usersToGroups.map((ug) => ({
        ...ug.user,
        role: ug.role,
      })),
    });
  } catch {
    res.status(500).json({ message: 'Erro ao buscar detalhes do grupo.' });
  }
});

// Invite member to group
router.post('/:id/invite', async (req: Request, res: Response) => {
  const groupId = parseInt(req.params.id, 10);
  const { email } = req.body;
  const invitedBy = req.user!.id;

  try {
    // Check if user is admin of the group
    const membership = await db.query.usersToGroups.findFirst({
      where: (table, { and, eq }) =>
        and(
          eq(table.userId, invitedBy),
          eq(table.groupId, groupId),
          eq(table.role, 'admin')
        ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Apenas administradores podem convidar membros.' });
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation = await db
      .insert(invitations)
      .values({
        email,
        groupId,
        invitedBy,
        expiresAt,
      })
      .returning();

    // TODO: Send invitation email

    res.status(201).json({
      message: 'Convite enviado com sucesso.',
      invitation: invitation[0],
    });
  } catch {
    res.status(500).json({ message: 'Erro ao enviar convite.' });
  }
});

// Leave group
router.delete('/:id/leave', async (req: Request, res: Response) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.user!.id;

  try {
    // Check if user is member
    const membership = await db.query.usersToGroups.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userId), eq(table.groupId, groupId)),
    });

    if (!membership) {
      return res.status(404).json({ message: 'Você não é membro deste grupo.' });
    }

    // Check if user is the only admin
    const adminCount = await db.query.usersToGroups.findMany({
      where: (table, { and, eq }) =>
        and(eq(table.groupId, groupId), eq(table.role, 'admin')),
    });

    if (adminCount.length === 1 && membership.role === 'admin') {
      return res.status(400).json({
        message: 'Você não pode sair do grupo sendo o único administrador.',
      });
    }

    // Remove user from group
    await db
      .delete(usersToGroups)
      .where(and(eq(usersToGroups.userId, userId), eq(usersToGroups.groupId, groupId)));

    res.json({ message: 'Você saiu do grupo com sucesso.' });
  } catch {
    res.status(500).json({ message: 'Erro ao sair do grupo.' });
  }
});

export default router; 