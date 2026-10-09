import { prisma } from "../../config/prisma.js";

export const claimModel = {
  findMany(options) { return prisma.claim.findMany(options); },
  count(where) { return prisma.claim.count({ where }); },
  findFirst(where, client = prisma) { return client.claim.findFirst({ where }); },
  create(data, client = prisma) { return client.claim.create({ data }); },
  update(id, data, client = prisma) { return client.claim.update({ where: { id }, data }); },
  delete(id) { return prisma.claim.delete({ where: { id } }); },
};
