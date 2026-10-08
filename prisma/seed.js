import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

try {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the initial admin",
    );
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || "System Administrator",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
    },
  });
  console.info(`Initial admin ensured for ${process.env.ADMIN_EMAIL}`);
} finally {
  await prisma.$disconnect();
}
