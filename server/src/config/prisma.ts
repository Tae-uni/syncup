// Note: Never use the Prisma from Client. Keep the Singleton pattern for PrismaClient
import { PrismaClient } from "@prisma/client";

// Use globalthis to avoid multiple instances in development - hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance if it doesn't exist or use the existing one in development
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Only set global variable in development to prevent memory leaks
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;