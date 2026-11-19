# United Insurance backend changes for frontend

**Change window:** Tuesday, 17 November 2026 to Thursday, 19 November 2026  
**Audience:** Frontend developer integrating with the backend  
**Scope:** Backend API and business-rule changes made during this window. WhatsApp and scheduled automation are deferred.

## What changed

- Added customer categories, policy insurance classification and vehicle fields, account transactions, expenses, daily closings, status reports, financial reports, and policy document requirements.
- Removed legacy API routes that are outside the current requirements. Their database tables remain in place for existing data.
- Removed the proposed fixed Third Party premium settings API. Third Party premium is entered on each policy.
- Clarified that `amountPartOne` and `amountPartTwo` are components of one policy premium. They are not payment records.
- A policy can have one `PAYMENT` ledger entry. The payment request needs `policyId`; a second payment for that policy returns HTTP `409`.
- The development server uses `PORT` (default `3000`) and tries the next port when the configured port is occupied. The frontend should use the URL printed when the backend starts.

## API connection

All routes below are under the backend origin and use the `/api` prefix unless noted. The local port is not guaranteed to be 3000: use the `Local` URL printed by `npm run dev`.

Sign in through one of:

```http
POST /api/auth/admin/login
POST /api/auth/branch/login
```

Send the returned token on protected routes:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Branch-created records take their branch from the login token. Do not send `branchId` from branch forms. Admins can create branches and can use `branchId` filters on supported lists and reports.

Successful responses use `{ "success": true, "data": ..., "message": ..., "meta": ... }` (message/meta may be omitted). Errors use `{ "success": false, "message": ..., "errors": ... }`. List routes generally accept `page` and `limit`; default page size is 10 and maximum is 100. Prisma decimal values are serialized as decimal strings.

## Active API routes

| Feature | Routes | Frontend use |
|---|---|---|
| Authentication | `POST /api/auth/admin/login`, `POST /api/auth/branch/login` | Authenticate; use the right role for the view. |
| Branches | `GET/POST /api/branches`, `GET/PATCH /api/branches/:id` | Admin manages branches; branch users can read their own branch. |
| Staff | `GET/POST /api/staff`, `GET/PATCH/DELETE /api/staff/:id` | List and manage branch staff. |
| Customers | `GET/POST /api/customers`, `GET/PATCH/DELETE /api/customers/:id` | Customer CRUD and category. |
| Policies | `GET/POST /api/policies`, `GET/PATCH /api/policies/:id` | Policy list, creation, and update. No policy delete route is mounted. |
| Policy documents | `GET /api/documents`, `POST /api/documents/upload`, `GET /api/documents/:id`, `GET /api/documents/:id/content`, `DELETE /api/documents/:id` | Upload and manage RC, insurance copy, and other documents. |
| Policy checklist | `GET /api/policies/:id/document-requirements` | Show documents uploaded and missing for a policy. |
| Customer accounts | `GET/POST /api/accounts/transactions`, `GET /api/accounts/customers/:customerId` | Ledger entries, customer totals, and balance. |
| Expenses | `GET/POST /api/expenses`, `GET/PATCH/DELETE /api/expenses/:id` | Branch expense management. |
| Daily closings | `GET/POST /api/daily-closings`, `GET/PATCH /api/daily-closings/:id`, `POST /api/daily-closings/:id/submit` | Branch creates/submits a closing; submitted closings cannot be edited. |
| Reports | `GET /api/reports/status`, `GET /api/reports/financial` | Policy/customer status rows and financial totals. |
| Health | `GET /health` | Backend health check. |

Reads for customers, policies, staff, documents, accounts, expenses, closings, and reports are available to the roles listed in the API. Branch data is scoped to the authenticated branch. Writes for customer/policy/staff/accounts/documents/expenses/closings are branch operations; branch creation and branch updates are admin operations.

## Customer category and policy form rules

Customer `category` is required and must be `UNITED_PARTY` or `THIRD_PARTY`. This customer category is separate from policy `insuranceClass`.

Policy `insuranceClass` is required and must be `FIRST_CLASS` or `THIRD_PARTY`:

- `FIRST_CLASS` requires `vehicleNumber` and `vehicleType`.
- `THIRD_PARTY` must omit `vehicleNumber`, `vehicleType`, and `vehicleDetails`.
- No fixed Third Party amount is configured or checked. Enter `premium` per policy.
- `amountPartOne` and `amountPartTwo` are optional. If one is sent, both are required; together they must add up to `premium`.
- These amount parts are one premium breakdown, not two payments.

Example policy payload:

```json
{
  "customerId": "customer-uuid",
  "policyNumber": "POL-10001",
  "insurer": "Insurer name",
  "product": "Motor insurance",
  "policyType": "MOTOR",
  "premium": 1200,
  "startDate": "2026-11-17T00:00:00.000Z",
  "expiryDate": "2027-11-16T00:00:00.000Z",
  "insuranceClass": "FIRST_CLASS",
  "vehicleNumber": "ABC-1234",
  "vehicleType": "Motorcycle",
  "amountPartOne": 1100,
  "amountPartTwo": 100
}
```

`amountPartOne: 1100` plus `amountPartTwo: 100` represents one `premium: 1200`. Do not create two account payments for these values.

## Account payments

Create an account entry with `POST /api/accounts/transactions`:

```json
{
  "customerId": "customer-uuid",
  "policyId": "policy-uuid",
  "type": "PAYMENT",
  "amount": 1200,
  "description": "Policy payment"
}
```

Rules:

- `PAYMENT` requires a `policyId` belonging to the selected customer and branch.
- Only one `PAYMENT` ledger entry is allowed per policy. Handle HTTP `409` as “payment already recorded for this policy.”
- `CHARGE` increases the customer's outstanding balance. `PAYMENT` and `CREDIT` reduce it.
- Amount must be greater than zero.
- `amountPartOne` / `amountPartTwo` are policy premium fields, not ledger entries.

`GET /api/accounts/customers/:customerId` returns customer identity, ledger entries, totals by type, and the calculated balance. `GET /api/accounts/transactions` supports filters including `customerId`, `policyId`, `type`, date range, pagination, and admin `branchId`.

## Documents

`POST /api/documents/upload` uses `multipart/form-data` with a file (`PDF`, `JPEG`, or `PNG`, max 5 MB by default), `type` (`RC`, `INSURANCE_COPY`, or `OTHER`), and `policyId` or `customerId`. For the policy checklist, associate the document with `policyId`. If both IDs are sent, the policy must belong to that customer.

Checklist requirements:

- `FIRST_CLASS`: `RC` and `INSURANCE_COPY`.
- `THIRD_PARTY`: `RC`.

The checklist response lists each required type and whether it has been uploaded.

## Expenses, daily closing, and reports

Expense create fields: `category`, `amount`, optional `description`, optional `expenseDate`.

Daily closing fields: `closingDate`, optional `openingBalance`, `cashReceived`, `bankReceived`, `expensesPaid`, optional `closingBalanceDeclared`, and `notes`. The backend allows one closing per branch/date. A closing starts as `DRAFT`; after `POST /api/daily-closings/:id/submit`, it is locked from edits.

`GET /api/reports/status` returns policy/customer rows including name, mobile number, customer category, policy amount, insurance class, vehicle number/category, policy status, and outstanding balance. Supported filters: `from`, `to`, `branchId`, `category`, `insuranceClass`, and `status`.

`GET /api/reports/financial` returns charges, customer payments/credits, policy premiums and amount components, operating expenses, and `netCashFlow`. The current `netCashFlow` is customer payments minus recorded operating expenses; it is not a formal profit calculation.

## Routes no longer exposed

The following earlier endpoints are unmounted: leads (including conversion), renewals, claims, follow-ups, activities, commissions, dashboard, and the earlier summary/renewal/commission reports. Do not build new frontend screens against these endpoints. Legacy database tables and source modules remain for data preservation. The `/api/insurance-settings` endpoint and `PUT /third-party-fixed-amount` are also removed.

WhatsApp messaging, renewal automation, reminders/posters, and Super Admin notifications are deferred and are not available as API features in this handoff.

## Frontend implementation checklist

1. Use the actual local URL printed on backend startup; the port may increment from `PORT` when occupied.
2. Add customer category and policy insurance class to forms using the exact enum values above.
3. Show vehicle fields for `FIRST_CLASS`; hide/omit them for `THIRD_PARTY`.
4. Collect a per-policy premium for Third Party; there is no fixed amount lookup.
5. Treat the two optional amount parts as one premium breakdown and never as two payment requests.
6. Record at most one account `PAYMENT` for each policy and handle HTTP `409`.
7. Use the document checklist to show missing uploads; use multipart upload for file bytes.
8. Implement expense, closing, and report screens against the listed routes and fields.
9. Do not implement the removed legacy routes or automation features from this API version.

## Contract references

- The backend's current OpenAPI spec is served by its Swagger/OpenAPI route.
- `postman/insurance-crm.postman_collection.json` contains request examples for the active endpoints.
- `API-SCOPE.md` is the compact backend route inventory.
- Database migrations must be applied before deploying the added requirements and payment constraint.
