declare global {
  namespace Express {
    interface Request {
      org?: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}

export {};
