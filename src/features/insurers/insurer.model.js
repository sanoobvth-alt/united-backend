import { prisma } from "../../config/prisma.js";

export const insurerModel = {
  findMany(options) {
    return prisma.insurer.findMany(options);
  },
  count(where) {
    return prisma.insurer.count({ where });
  },
  findFirst(where) {
    return prisma.insurer.findFirst({ where });
  },
  create(data) {
    return prisma.insurer.create({ data });
  },
  update(id, data) {
    return prisma.insurer.update({ where: { id }, data });
  },
};
