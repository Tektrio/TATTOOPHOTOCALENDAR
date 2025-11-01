// Cliente Prisma para SQLite Local (Offline)
import { PrismaClient as PrismaClientLocal } from '../node_modules/.prisma/client-local';

const globalForPrisma = globalThis as unknown as {
  prismaLocal: PrismaClientLocal | undefined;
};

export const prismaLocal =
  globalForPrisma.prismaLocal ??
  new PrismaClientLocal({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaLocal = prismaLocal;
}

