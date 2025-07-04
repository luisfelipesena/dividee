import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db
      .insert(users)
      .values({ fullName, email, password: hashedPassword })
      .returning({ id: users.id, fullName: users.fullName, email: users.email });

    return res.status(201).json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Não foi possível registrar o usuário. O e-mail já pode estar em uso.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({ token });
});

export default router; 