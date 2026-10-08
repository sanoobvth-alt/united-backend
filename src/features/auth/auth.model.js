import { prisma } from '../../config/prisma.js';
export const authModel = {
  findAdmin(email) { return prisma.admin.findUnique({ where: { email } }); },
  findBranch(username) { return prisma.branch.findUnique({ where: { username } }); },
};
