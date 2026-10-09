import { prisma } from "../../config/prisma.js";

export const activityModel = {
  findMany(options) { return prisma.activity.findMany(options); },
  count(where) { return prisma.activity.count({ where }); },
  findFirst(where, client = prisma) { return client.activity.findFirst({ where }); },
  create(data, client = prisma) { return client.activity.create({ data }); },
  update(id, data, client = prisma) { return client.activity.update({ where: { id }, data }); },
  delete(id) { return prisma.activity.delete({ where: { id } }); },
};
