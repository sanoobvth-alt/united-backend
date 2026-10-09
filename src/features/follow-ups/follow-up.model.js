import { prisma } from "../../config/prisma.js";

export const followupModel = {
  findMany(options) { return prisma.followUp.findMany(options); },
  count(where) { return prisma.followUp.count({ where }); },
  findFirst(where, client = prisma) { return client.followUp.findFirst({ where }); },
  create(data, client = prisma) { return client.followUp.create({ data }); },
  update(id, data, client = prisma) { return client.followUp.update({ where: { id }, data }); },
  delete(id) { return prisma.followUp.delete({ where: { id } }); },
};
