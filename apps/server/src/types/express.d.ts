import { users } from '../db/schema';

declare global {
  namespace Express {
    export interface Request {
      user?: typeof users.$inferSelect;
    }
  }
} 