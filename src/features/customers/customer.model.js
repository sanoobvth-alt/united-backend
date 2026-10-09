import { prisma } from "../../config/prisma.js";

export const customerModel = {
  findMany(options) { return prisma.customer.findMany(options); },
  count(where) { return prisma.customer.count({ where }); },
  findFirst(where, client = prisma) { return client.customer.findFirst({ where }); },
  create(data, client = prisma) { return client.customer.create({ data }); },
  update(id, data, client = prisma) { return client.customer.update({ where: { id }, data }); },
  delete(id) { return prisma.customer.delete({ where: { id } }); },
};
