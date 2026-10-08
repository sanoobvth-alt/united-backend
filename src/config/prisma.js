import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
});

const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
