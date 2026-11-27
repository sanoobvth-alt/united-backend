import { prisma } from "../../config/prisma.js";

export const devService = {
  async deleteAllCustomers() {
    const result = await prisma.customer.deleteMany();
    return { deletedCount: result.count };
  },
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
