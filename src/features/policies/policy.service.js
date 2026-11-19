import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { policyModel } from "./policy.model.js";
import { customerModel } from "../customers/customer.model.js";
import { prisma } from "../../config/prisma.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const policyService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.insuranceClass) where.insuranceClass = query.insuranceClass;
    if (query.search)
      where.OR = [
        { policyNumber: { contains: query.search, mode: "insensitive" } },
        { insurer: { contains: query.search, mode: "insensitive" } },
        { product: { contains: query.search, mode: "insensitive" } },
        { vehicleNumber: { contains: query.search, mode: "insensitive" } },
      ];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      policyModel.findMany({ where, skip, take, orderBy }),
      policyModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await policyModel.findFirst(where);
    if (!record) throw new ApiError(404, "Policy not found");
    return record;
  },
  async documentRequirements(auth, id) {
    const policy = await this.get(auth, id);
    if (!policy.insuranceClass)
      throw new ApiError(
        409,
        "Set the policy insuranceClass before checking its documents",
      );
    const required =
      policy.insuranceClass === "FIRST_CLASS"
        ? ["RC", "INSURANCE_COPY"]
        : ["RC"];
    const documents = await prisma.document.findMany({
      where: {
        policyId: id,
        branchId: policy.branchId,
        type: { in: required },
      },
      select: { id: true, type: true, fileName: true, uploadedAt: true },
      orderBy: { uploadedAt: "desc" },
    });
    return {
      policyId: id,
      insuranceClass: policy.insuranceClass,
      requirements: required.map((type) => ({
        type,
        uploaded: documents.some((document) => document.type === type),
        documents: documents.filter((document) => document.type === type),
      })),
    };
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId)
      throw new ApiError(400, "branchId is required for admin-created records");
    const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
    const customer = await customerModel.findFirst({
      id: input.customerId,
      ...scope,
    });
    if (!customer)
      throw new ApiError(400, "customerId is invalid or outside this branch");
    await validatePolicyAmounts(input);
    return policyModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    delete input.branchId;
    await validatePolicyAmounts({ ...current, ...input });
    if (input.customerId) {
      const scope =
        auth.userType === "ADMIN"
          ? { branchId: current.branchId }
          : getScope(auth);
      const customer = await customerModel.findFirst({
        id: input.customerId,
        ...scope,
      });
      if (!customer)
        throw new ApiError(400, "customerId is invalid or outside this branch");
    }
    return policyModel.update(id, input);
  },
};

async function validatePolicyAmounts(data) {
  if (!data.insuranceClass)
    throw new ApiError(400, "insuranceClass is required");
  if (
    data.insuranceClass === "FIRST_CLASS" &&
    (!data.vehicleNumber || !data.vehicleType)
  )
    throw new ApiError(
      400,
      "vehicleNumber and vehicleType are required for First Class policies",
    );
  if (data.insuranceClass === "THIRD_PARTY") {
    if (data.vehicleNumber || data.vehicleType || data.vehicleDetails)
      throw new ApiError(
        400,
        "Third-party policies must not include vehicle details",
      );
  }
  const hasPartOne = data.amountPartOne != null;
  const hasPartTwo = data.amountPartTwo != null;
  if (hasPartOne !== hasPartTwo)
    throw new ApiError(
      400,
      "Both amountPartOne and amountPartTwo are required together",
    );
  if (
    hasPartOne &&
    Math.abs(
      Number(data.amountPartOne) +
        Number(data.amountPartTwo) -
        Number(data.premium),
    ) >= 0.005
  ) {
    throw new ApiError(
      400,
      "amountPartOne and amountPartTwo must add up to premium",
    );
  }
}
