const bearer = { bearerAuth: [] };
const error = {
  400: { description: "Invalid request or validation failure" },
  401: { description: "Missing or invalid token or login credentials" },
  403: { description: "The caller role does not have permission" },
};
const ok = {
  description: "Successful response",
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Success" } },
  },
};
const listParams = [
  {
    name: "page",
    in: "query",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  {
    name: "limit",
    in: "query",
    description: "Defaults to 10; maximum 100.",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  { name: "search", in: "query", schema: { type: "string" } },
  { name: "status", in: "query", schema: { type: "string" } },
  {
    name: "sortBy",
    in: "query",
    description: "Feature-specific field.",
    schema: { type: "string" },
  },
  {
    name: "sortOrder",
    in: "query",
    schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
  },
];
const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};
const ref = (schema) => ({ $ref: `#/components/schemas/${schema}` });
const reqBody = (schema) => ({
  required: true,
  content: { "application/json": { schema: ref(schema) } },
});
const op = (
  tag,
  summary,
  { schema, status = 200, description, parameters, secured = true } = {},
) => {
  const result = {
    tags: [tag],
    summary,
    responses: { ...error, [status]: ok },
  };
  if (schema) result.requestBody = reqBody(schema);
  if (description) result.description = description;
  if (parameters) result.parameters = parameters;
  if (!secured) result.security = [];
  return result;
};
const list = (tag, description) =>
  op(tag, `List ${tag.toLowerCase()}`, { parameters: listParams, description });
function resource(path, tag, { create, update, remove, description } = {}) {
  const collectionPath = { get: list(tag) };
  if (create) {
    collectionPath.post = op(tag, `Create ${tag.toLowerCase()}`, {
      schema: `Create${tag.replace(/[^a-z]/gi, "")}`,
      status: 201,
      description,
    });
  }
  const paths = { [path]: collectionPath };
  const byId = {
    parameters: [idParameter],
    get: op(tag, `Get ${tag.toLowerCase()} by ID`),
  };
  if (update)
    byId.patch = op(tag, `Update ${tag.toLowerCase()}`, {
      schema: `Update${tag.replace(/[^a-z]/gi, "")}`,
      description,
    });
  if (remove)
    byId.delete = op(tag, `Delete ${tag.toLowerCase()}`, { description });
  paths[`${path}/{id}`] = byId;
  return paths;
}
const model = (properties, required = []) => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
});
const partial = (properties) => model(properties);
const branch = {
  name: { type: "string" },
  code: { type: "string" },
  username: { type: "string", minLength: 3 },
  password: { type: "string", format: "password", minLength: 6 },
  phone: { type: "string", nullable: true },
  email: { type: "string", format: "email", nullable: true },
  address: { type: "string", nullable: true },
  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
};
const staff = {
  name: { type: "string" },
  phone: { type: "string", minLength: 5 },
  email: { type: "string", format: "email", nullable: true },
  designation: { type: "string", nullable: true },
  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
  joiningDate: { type: "string", format: "date-time", nullable: true },
};
const customer = {
  name: { type: "string" },
  phone: { type: "string", minLength: 5 },
  email: { type: "string", format: "email", nullable: true },
  dob: { type: "string", format: "date-time", nullable: true },
  gender: { type: "string", nullable: true },
  address: { type: "string", nullable: true },
  notes: { type: "string", nullable: true },
  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
  staffId: { type: "string", format: "uuid", nullable: true },
};
const lead = {
  name: { type: "string" },
  phone: { type: "string", minLength: 5 },
  email: { type: "string", format: "email", nullable: true },
  source: { type: "string", nullable: true },
  interest: { type: "string", nullable: true },
  status: {
    type: "string",
    enum: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"],
  },
  nextFollowUpAt: { type: "string", format: "date-time", nullable: true },
  notes: { type: "string", nullable: true },
  staffId: { type: "string", format: "uuid", nullable: true },
};
const policy = {
  customerId: { type: "string", format: "uuid" },
  policyNumber: { type: "string" },
  insurer: { type: "string" },
  product: { type: "string" },
  policyType: { type: "string" },
  premium: { type: "number", minimum: 0 },
  startDate: { type: "string", format: "date-time" },
  expiryDate: { type: "string", format: "date-time" },
  status: { type: "string", enum: ["ACTIVE", "EXPIRED", "CANCELLED"] },
};
const claim = {
  customerId: { type: "string", format: "uuid" },
  policyId: { type: "string", format: "uuid", nullable: true },
  claimNumber: { type: "string", nullable: true },
  claimDate: { type: "string", format: "date-time" },
  status: {
    type: "string",
    enum: ["REPORTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SETTLED"],
  },
  amount: { type: "number", minimum: 0, nullable: true },
  notes: { type: "string", nullable: true },
};
const followUp = {
  customerId: { type: "string", format: "uuid", nullable: true },
  leadId: { type: "string", format: "uuid", nullable: true },
  staffId: { type: "string", format: "uuid", nullable: true },
  title: { type: "string" },
  dueAt: { type: "string", format: "date-time" },
  status: { type: "string", enum: ["PENDING", "COMPLETED", "CANCELLED"] },
  notes: { type: "string", nullable: true },
  completedAt: { type: "string", format: "date-time", nullable: true },
};
const commission = {
  policyId: { type: "string", format: "uuid", nullable: true },
  customerId: { type: "string", format: "uuid", nullable: true },
  amount: { type: "number", minimum: 0 },
  status: { type: "string", enum: ["PENDING", "PAID", "CANCELLED"] },
  earnedAt: { type: "string", format: "date-time" },
  paidAt: { type: "string", format: "date-time", nullable: true },
};
const renewal = {
  policyId: { type: "string", format: "uuid" },
  dueDate: { type: "string", format: "date-time" },
  status: {
    type: "string",
    enum: [
      "UPCOMING",
      "DUE_SOON",
      "DUE_TODAY",
      "EXPIRED",
      "RENEWED",
      "NOT_RENEWED",
    ],
  },
  reminderStage: { type: "string", nullable: true },
  renewedAt: { type: "string", format: "date-time", nullable: true },
  notes: { type: "string", nullable: true },
};
const paths = {
  "/health": {
    get: op("Health", "Check that the API is responding", { secured: false }),
  },
  "/api/auth/admin/login": {
    post: op("Authentication", "Admin login", {
      schema: "AdminLogin",
      secured: false,
    }),
  },
  "/api/auth/branch/login": {
    post: op("Authentication", "Branch login", {
      schema: "BranchLogin",
      secured: false,
      description:
        "Use the branch username and password created by an administrator.",
    }),
  },
  "/api/branches": {
    get: list("Branches", "ADMIN only."),
    post: op("Branches", "Create branch", {
      schema: "CreateBranch",
      status: 201,
      description:
        "ADMIN only. Sign in as the new branch before creating staff.",
    }),
  },
  "/api/branches/{id}": {
    parameters: [idParameter],
    get: op("Branches", "Get branch", { description: "ADMIN only." }),
    patch: op("Branches", "Update branch", {
      schema: "UpdateBranch",
      description: "ADMIN only.",
    }),
  },
  ...resource("/api/staff", "Staff", {
    create: true,
    update: true,
    remove: true,
    description: "BRANCH only. Branch scope is taken from the token.",
  }),
  ...resource("/api/customers", "Customer", {
    create: true,
    update: true,
    remove: true,
    description:
      "BRANCH only. Optional staffId must belong to the same branch.",
  }),
  ...resource("/api/leads", "Lead", {
    create: true,
    update: true,
    remove: true,
    description: "BRANCH only.",
  }),
  "/api/leads/{id}/convert": {
    parameters: [idParameter],
    post: op("Leads", "Convert lead to customer", {
      status: 201,
      description:
        "BRANCH only. Creates a customer; a lead can only be converted once.",
    }),
  },
  ...resource("/api/policies", "Policy", {
    create: true,
    update: true,
    description:
      "BRANCH only. Creating a policy also creates a renewal and activity.",
  }),
  "/api/renewals": { get: list("Renewals") },
  "/api/renewals/{id}": {
    parameters: [idParameter],
    get: op("Renewals", "Get renewal"),
    patch: op("Renewals", "Update renewal", {
      schema: "UpdateRenewal",
      description: "BRANCH only. Renewals are created from policies.",
    }),
  },
  ...resource("/api/claims", "Claim", {
    create: true,
    update: true,
    description:
      "BRANCH only. A supplied policyId must belong to the selected customer.",
  }),
  ...resource("/api/follow-ups", "FollowUp", {
    create: true,
    update: true,
    remove: true,
    description: "BRANCH only.",
  }),
  "/api/documents": { get: list("Documents") },
  "/api/documents/upload": {
    post: {
      ...op("Documents", "Upload document or image", {
        status: 201,
        description:
          "BRANCH only. PDF, JPEG, and PNG; default maximum size is 5 MB.",
      }),
      requestBody: {
        required: true,
        content: { "multipart/form-data": { schema: ref("DocumentUpload") } },
      },
    },
  },
  "/api/documents/{id}": {
    parameters: [idParameter],
    get: op("Documents", "Get document metadata"),
    delete: op("Documents", "Delete document", {
      description: "BRANCH only; deletes the stored file too.",
    }),
  },
  "/api/documents/{id}/content": {
    parameters: [idParameter],
    get: {
      ...op("Documents", "Download document bytes"),
      responses: {
        200: {
          description: "Raw file content",
          content: {
            "application/octet-stream": {
              schema: { type: "string", format: "binary" },
            },
          },
          ...error,
        },
      },
    },
  },
  ...resource("/api/activities", "Activity"),
  ...resource("/api/commissions", "Commission", {
    create: true,
    update: true,
    description: "BRANCH only.",
  }),
  "/api/dashboard": { get: op("Dashboard", "Get dashboard summary") },
  "/api/reports/summary": { get: op("Reports", "Get report summary") },
  "/api/reports/renewals": { get: op("Reports", "Get renewal report") },
  "/api/reports/commissions": { get: op("Reports", "Get commission report") },
};

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "United Insurance CRM API",
    version: "1.0.0",
    description:
      "OpenAPI definition for all backend endpoints. Admins create branches; branches sign in to create staff and manage branch-scoped CRM records. Use this spec with a locally hosted Swagger UI to test requests.",
  },
  servers: [{ url: "/", description: "This backend server" }],
  security: [bearer],
  tags: [
    "Health",
    "Authentication",
    "Branches",
    "Staff",
    "Customer",
    "Lead",
    "Policy",
    "Renewals",
    "Claim",
    "FollowUp",
    "Documents",
    "Activity",
    "Commission",
    "Dashboard",
    "Reports",
  ].map((name) => ({ name })),
  paths,
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      AdminLogin: model(
        {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
        ["email", "password"],
      ),
      BranchLogin: model(
        {
          username: { type: "string" },
          password: { type: "string", format: "password" },
        },
        ["username", "password"],
      ),
      CreateBranch: model(branch, ["name", "code", "username", "password"]),
      UpdateBranch: partial(branch),
      CreateStaff: model(staff, ["name", "phone"]),
      UpdateStaff: partial(staff),
      CreateCustomer: model(customer, ["name", "phone"]),
      UpdateCustomer: partial(customer),
      CreateLead: model(lead, ["name", "phone"]),
      UpdateLead: partial(lead),
      CreatePolicy: model(policy, [
        "customerId",
        "policyNumber",
        "insurer",
        "product",
        "policyType",
        "premium",
        "startDate",
        "expiryDate",
      ]),
      UpdatePolicy: partial(policy),
      UpdateRenewal: partial(renewal),
      CreateClaim: model(claim, ["customerId", "claimDate"]),
      UpdateClaim: partial(claim),
      CreateFollowUp: model(followUp, ["title", "dueAt"]),
      UpdateFollowUp: partial(followUp),
      CreateCommission: model(commission, ["amount"]),
      UpdateCommission: partial(commission),
      DocumentUpload: {
        ...model(
          {
            file: { type: "string", format: "binary" },
            type: { type: "string" },
            customerId: { type: "string", format: "uuid" },
            policyId: { type: "string", format: "uuid" },
            claimId: { type: "string", format: "uuid" },
          },
          ["file", "type"],
        ),
        anyOf: [
          { required: ["customerId"] },
          { required: ["policyId"] },
          { required: ["claimId"] },
        ],
      },
      Success: model({
        success: { type: "boolean", example: true },
        message: { type: "string" },
        data: {
          oneOf: [
            { type: "object", additionalProperties: true },
            {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
          ],
        },
        meta: ref("PaginationMeta"),
      }),
      PaginationMeta: model({
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        total: { type: "integer", example: 25 },
        totalPages: { type: "integer", example: 3 },
      }),
      ApiError: model({
        success: { type: "boolean", example: false },
        message: { type: "string" },
        errors: {
          type: "array",
          items: model({
            field: { type: "string" },
            message: { type: "string" },
          }),
        },
      }),
    },
  },
};
