import { prisma } from "../../config/prisma.js";

export const policyModel = {
  findMany(options) { return prisma.policy.findMany(options); },
  count(where) { return prisma.policy.count({ where }); },
  findFirst(where, client = prisma) { return client.policy.findFirst({ where }); },
  create(data, client = prisma) { return client.policy.create({ data }); },
  update(id, data, client = prisma) { return client.policy.update({ where: { id }, data }); },
  delete(id) { return prisma.policy.delete({ where: { id } }); },
};
