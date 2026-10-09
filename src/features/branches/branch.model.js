import { prisma } from "../../config/prisma.js";

export const branchModel = {
  findMany(options) { return prisma.branch.findMany(options); },
  count(where) { return prisma.branch.count({ where }); },
  findFirst(where, client = prisma) { return client.branch.findFirst({ where }); },
  create(data, client = prisma) { return client.branch.create({ data }); },
  update(id, data, client = prisma) { return client.branch.update({ where: { id }, data }); },
  delete(id) { return prisma.branch.delete({ where: { id } }); },
};
