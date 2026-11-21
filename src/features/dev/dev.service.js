import { prisma } from "../../config/prisma.js";

export const devService = {
  listBranches() {
    return prisma.branch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        username: true,
        status: true,
      },
    });
  },
};
