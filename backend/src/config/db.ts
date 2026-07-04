import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export const connectDb = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('[PostgreSQL]: Connection successfully established via Prisma.');
  } catch (error) {
    console.error('[PostgreSQL]: Connection failure:', error);
    process.exit(1);
  }
};
