import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

// Export the extended client for Accelerate connection pooling
// Cast back to PrismaClient to preserve type inference for includes/relations
export const prisma = basePrisma.$extends(withAccelerate()) as unknown as PrismaClient;
