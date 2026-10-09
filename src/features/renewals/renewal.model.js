import { prisma } from "../../config/prisma.js";

export const renewalModel = {
  findMany(options) { return prisma.renewal.findMany(options); },
  count(where) { return prisma.renewal.count({ where }); },
  findFirst(where, client = prisma) { return client.renewal.findFirst({ where }); },
  create(data, client = prisma) { return client.renewal.create({ data }); },
  update(id, data, client = prisma) { return client.renewal.update({ where: { id }, data }); },
  delete(id) { return prisma.renewal.delete({ where: { id } }); },
};
