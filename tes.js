import "dotenv/config";

import prisma from "./src/config/prisma.js";

async function test() {
  const users = await prisma.user.findMany();
  console.log(users);
}

test();
