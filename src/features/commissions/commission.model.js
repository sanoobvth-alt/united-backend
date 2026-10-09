import { prisma } from "../../config/prisma.js";

export const commissionModel = {
  findMany(options) { return prisma.commission.findMany(options); },
  count(where) { return prisma.commission.count({ where }); },
  findFirst(where, client = prisma) { return client.commission.findFirst({ where }); },
  create(data, client = prisma) { return client.commission.create({ data }); },
  update(id, data, client = prisma) { return client.commission.update({ where: { id }, data }); },
  delete(id) { return prisma.commission.delete({ where: { id } }); },
};
