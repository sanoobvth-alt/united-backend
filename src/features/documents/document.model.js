import { prisma } from "../../config/prisma.js";

export const documentModel = {
  findMany(options) { return prisma.document.findMany(options); },
  count(where) { return prisma.document.count({ where }); },
  findFirst(where, client = prisma) { return client.document.findFirst({ where }); },
  create(data, client = prisma) { return client.document.create({ data }); },
  update(id, data, client = prisma) { return client.document.update({ where: { id }, data }); },
  delete(id) { return prisma.document.delete({ where: { id } }); },
};
