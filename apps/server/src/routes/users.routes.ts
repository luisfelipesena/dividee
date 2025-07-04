import { ilike } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Search for users by name
router.get('/search', async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'A search query is required.' });
  }

  try {
    const foundUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(ilike(users.fullName, `%${query}%`));

    res.json(foundUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching for users.' });
  }
});

export default router; 