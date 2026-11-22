import { prisma } from "../../config/prisma.js";

export const policyModel = {
  findMany(options) {
    return prisma.policy.findMany({
      ...options,
      include: {
        insurerRecord: true,
        customer: { select: { name: true } },
      },
    });
  },
  count(where) {
    return prisma.policy.count({ where });
  },
  findFirst(where, client = prisma) {
    return client.policy.findFirst({
      where,
      include: {
        insurerRecord: true,
        customer: { select: { name: true } },
      },
    });
  },
  create(data, client = prisma) {
    return client.policy.create({
      data,
      include: {
        insurerRecord: true,
        customer: { select: { name: true } },
      },
    });
  },
  update(id, data, client = prisma) {
    return client.policy.update({
      where: { id },
      data,
      include: {
        insurerRecord: true,
        customer: { select: { name: true } },
      },
    });
  },
  delete(id) {
    return prisma.policy.delete({ where: { id } });
  },
};
