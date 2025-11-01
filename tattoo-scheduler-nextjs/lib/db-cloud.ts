// Cliente Prisma para PostgreSQL Cloud (Supabase)
import { PrismaClient as PrismaClientCloud } from '../node_modules/.prisma/client-cloud';

const globalForPrisma = globalThis as unknown as {
  prismaCloud: PrismaClientCloud | undefined;
};

export const prismaCloud =
  globalForPrisma.prismaCloud ??
  new PrismaClientCloud({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaCloud = prismaCloud;
}

