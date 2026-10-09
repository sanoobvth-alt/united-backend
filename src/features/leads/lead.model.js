import { prisma } from "../../config/prisma.js";

export const leadModel = {
  findMany(options) { return prisma.lead.findMany(options); },
  count(where) { return prisma.lead.count({ where }); },
  findFirst(where, client = prisma) { return client.lead.findFirst({ where }); },
  create(data, client = prisma) { return client.lead.create({ data }); },
  update(id, data, client = prisma) { return client.lead.update({ where: { id }, data }); },
  delete(id) { return prisma.lead.delete({ where: { id } }); },
};
