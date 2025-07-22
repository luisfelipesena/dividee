declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        fullName: string | null;
        email: string;
      };
    }
  }
}

export {}; 