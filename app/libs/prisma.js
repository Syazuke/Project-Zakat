// lib/prisma.js
import { PrismaClient } from "@prisma/client";

// Di JavaScript, kita cukup menggunakan objek global bawaan Node.js
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
