import { prisma } from "../../config/prisma.js";

export const staffModel = {
  findMany(options) { return prisma.staff.findMany(options); },
  count(where) { return prisma.staff.count({ where }); },
  findFirst(where, client = prisma) { return client.staff.findFirst({ where }); },
  create(data, client = prisma) { return client.staff.create({ data }); },
  update(id, data, client = prisma) { return client.staff.update({ where: { id }, data }); },
  delete(id) { return prisma.staff.delete({ where: { id } }); },
};
