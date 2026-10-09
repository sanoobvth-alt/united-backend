import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { leadModel } from "./lead.model.js";
import { staffModel } from "../staff/staff.model.js";
import { customerModel } from "../customers/customer.model.js";
import { prisma } from "../../config/prisma.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const leadService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { phone: { contains: query.search, mode: "insensitive" } }, { interest: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      leadModel.findMany({ where, skip, take, orderBy }),
      leadModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await leadModel.findFirst(where);
    if (!record) throw new ApiError(404, "Lead not found");
    return record;
  },
  async create(auth, input) {
    const branchId = getBranchId(auth, input);
    await validateStaff(auth, input.staffId, branchId);
    return leadModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    await validateStaff(auth, input.staffId, current.branchId);
    delete input.branchId;
    return leadModel.update(id, input);
  },
  async remove(auth, id) {
    await this.get(auth, id);
    await leadModel.delete(id);
  },
  async convert(auth, id) {
    const lead = await this.get(auth, id);
    if (lead.convertedCustomerId) throw new ApiError(409, "Lead has already been converted");
    return prisma.$transaction(async (tx) => {
      const customer = await customerModel.create({ branchId: lead.branchId, staffId: lead.staffId, name: lead.name, phone: lead.phone, email: lead.email, notes: lead.notes }, tx);
      await leadModel.update(id, { status: "CONVERTED", convertedCustomerId: customer.id, convertedAt: new Date() }, tx);
      await tx.activity.create({ data: { branchId: lead.branchId, customerId: customer.id, type: "LEAD_CONVERTED", title: "Lead converted to customer", description: `Lead ${lead.name} was converted` } });
      return { customer, leadId: lead.id };
    });
  },
};

function getBranchId(auth, input) {
  const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
  if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
  return branchId;
}

async function validateStaff(auth, staffId, branchId) {
  if (!staffId) return;
  const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
  const staff = await staffModel.findFirst({ id: staffId, ...scope });
  if (!staff) throw new ApiError(400, "staffId is invalid or outside this branch");
}
