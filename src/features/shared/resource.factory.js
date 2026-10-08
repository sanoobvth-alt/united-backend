import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  getUploadPath,
  removeUploadedFile,
} from "../../middlewares/upload.middleware.js";

const uuid = z.string().uuid();
export function defineResource({
  name,
  delegate,
  fields,
  required = [],
  enums = {},
  searchable = [],
  requiredRelations = {},
}) {
  const createShape = Object.fromEntries(
    Object.entries(fields).map(([key, schema]) => [key, schema.optional()]),
  );
  for (const key of required) createShape[key] = fields[key];
  if (delegate !== "branch")
    createShape.branchId = z.string().uuid().optional();
  const createSchema = z.object(createShape).strict();
  const updateSchema = z
    .object(createShape)
    .strict()
    .refine(
      (value) => Object.keys(value).length > 0,
      "At least one field is required",
    );
  const paramsSchema = z.object({ id: uuid });
  const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    status: fields.status?.optional() ?? z.string().optional(),
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "dueAt",
        "dueDate",
        "expiryDate",
        "earnedAt",
        "claimDate",
      ])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  });
  const model = prisma[delegate];
  const serializer = (record) => {
    if (!record) return record;
    const { passwordHash, storageKey, ...safe } = record;
    if (delegate === "document" && safe.fileUrl?.startsWith("/uploads/"))
      safe.fileUrl = `/api/documents/${safe.id}/content`;
    return safe;
  };
  const relationChecks = Object.entries(requiredRelations);
  const service = {
    async list(auth, query) {
      const where =
        auth.userType === "ADMIN"
          ? {}
          : delegate === "branch"
            ? { id: auth.branchId }
            : { branchId: auth.branchId };
      if (query.status && enums.status) where.status = query.status;
      if (query.search && searchable.length)
        where.OR = searchable.map((field) => ({
          [field]: { contains: query.search, mode: "insensitive" },
        }));
      const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
      const [rows, total] = await Promise.all([
        model.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy,
        }),
        model.count({ where }),
      ]);
      return {
        rows: rows.map(serializer),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      };
    },
    async get(auth, id) {
      const where =
        auth.userType === "ADMIN"
          ? { id }
          : delegate === "branch"
            ? { id: auth.branchId }
            : { id, branchId: auth.branchId };
      const row = await model.findFirst({ where });
      if (!row) throw new ApiError(404, `${name} not found`);
      return serializer(row);
    },
    async create(auth, input) {
      const branchId =
        auth.userType === "BRANCH" ? auth.branchId : input.branchId;
      if (auth.userType === "ADMIN" && !branchId && delegate !== "branch")
        throw new ApiError(
          400,
          "branchId is required for admin-created operational records",
        );
      const data = { ...input };
      if (delegate === "branch") {
        delete data.branchId;
        if (auth.userType !== "ADMIN")
          throw new ApiError(403, "Only admins can create branches");
        if (!data.adminId) data.adminId = auth.id;
        data.passwordHash = await bcrypt.hash(data.password, 12);
        delete data.password;
      } else {
        delete data.branchId;
        if (branchId) data.branchId = branchId;
      }
      for (const [field, relationDelegate] of relationChecks) {
        if (data[field]) {
          const relation = await prisma[relationDelegate].findFirst({
            where: { id: data[field], ...(branchId ? { branchId } : {}) },
            select: { id: true },
          });
          if (!relation)
            throw new ApiError(
              400,
              `${field} is invalid or outside this branch`,
            );
        }
      }
      if (delegate === "policy") {
        return prisma.$transaction(async (tx) => {
          const policy = await tx.policy.create({ data });
          await tx.renewal.create({
            data: { branchId, policyId: policy.id, dueDate: policy.expiryDate },
          });
          await tx.activity.create({
            data: {
              branchId,
              customerId: policy.customerId,
              type: "POLICY_CREATED",
              title: "Policy added",
              description: `Policy ${policy.policyNumber} was added`,
            },
          });
          return serializer(policy);
        });
      }
      return serializer(await model.create({ data }));
    },
    async update(auth, id, input) {
      await this.get(auth, id);
      const data = { ...input };
      delete data.branchId;
      if (delegate === "branch") {
        if (data.password)
          data.passwordHash = await bcrypt.hash(data.password, 12);
        delete data.password;
      }
      for (const [field, relationDelegate] of relationChecks) {
        if (data[field]) {
          const relation = await prisma[relationDelegate].findFirst({
            where: {
              id: data[field],
              ...(auth.userType === "BRANCH"
                ? { branchId: auth.branchId }
                : {}),
            },
            select: { id: true },
          });
          if (!relation)
            throw new ApiError(
              400,
              `${field} is invalid or outside this branch`,
            );
        }
      }
      return serializer(await model.update({ where: { id }, data }));
    },
    async remove(auth, id) {
      await this.get(auth, id);
      if (delegate === "document") {
        const record = await model.findUnique({ where: { id } });
        if (record?.fileUrl?.startsWith("/uploads/"))
          await removeUploadedFile(
            getUploadPath(record.fileUrl.split("/").at(-1)),
          );
      }
      await model.delete({ where: { id } });
    },
    async convertLead(auth, id) {
      const lead = await prisma.lead.findFirst({
        where:
          auth.userType === "ADMIN" ? { id } : { id, branchId: auth.branchId },
      });
      if (!lead) throw new ApiError(404, "Lead not found");
      if (lead.convertedCustomerId)
        throw new ApiError(409, "Lead has already been converted");
      return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.create({
          data: {
            branchId: lead.branchId,
            staffId: lead.staffId,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            notes: lead.notes,
          },
        });
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            status: "CONVERTED",
            convertedCustomerId: customer.id,
            convertedAt: new Date(),
          },
        });
        await tx.activity.create({
          data: {
            branchId: lead.branchId,
            customerId: customer.id,
            type: "LEAD_CONVERTED",
            title: "Lead converted to customer",
            description: `Lead ${lead.name} was converted`,
          },
        });
        return { customer: serializer(customer), leadId: lead.id };
      });
    },
  };
  const controller = {
    async list(req, res) {
      const result = await service.list(req.auth, req.query);
      res.json({ success: true, data: result.rows, meta: result.meta });
    },
    async get(req, res) {
      res.json({
        success: true,
        data: await service.get(req.auth, req.params.id),
      });
    },
    async create(req, res) {
      res
        .status(201)
        .json({
          success: true,
          message: `${name} created successfully`,
          data: await service.create(req.auth, req.body),
        });
    },
    async update(req, res) {
      res.json({
        success: true,
        message: `${name} updated successfully`,
        data: await service.update(req.auth, req.params.id, req.body),
      });
    },
    async remove(req, res) {
      await service.remove(req.auth, req.params.id);
      res.json({
        success: true,
        message: `${name} deleted successfully`,
        data: null,
      });
    },
  };
  return {
    createSchema,
    updateSchema,
    paramsSchema,
    querySchema,
    serializer,
    model,
    service,
    controller,
  };
}
