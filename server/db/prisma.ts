import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

let prismaInstance: any;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
} catch (error) {
  console.warn('[Prisma] PrismaClient constructor notice: Database server or driver adapter not configured. Server using mock/in-memory store fallback.');
  prismaInstance = {
    $queryRaw: async () => {
      throw new Error('Database server not connected (In-memory fallback mode active)');
    }
  };
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production' && prismaInstance?.$connect) {
  globalForPrisma.prisma = prismaInstance;
}

