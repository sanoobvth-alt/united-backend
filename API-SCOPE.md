# API scope

| Feature | Base path | Available operations |
|---|---|---|
| Authentication | `/api/auth` | `POST /admin/login`, `POST /branch/login` |
| Branches | `/api/branches` | list, create, get, update |
| Staff | `/api/staff` | CRUD |
| Customers | `/api/customers` | CRUD |
| Leads | `/api/leads` | CRUD, `POST /:id/convert` |
| Policies | `/api/policies` | CRUD |
| Renewals | `/api/renewals` | list, get, update |
| Claims | `/api/claims` | CRUD except delete |
| Follow-ups | `/api/follow-ups` | CRUD |
| Documents | `/api/documents` | list, upload (`POST /upload` multipart field `file`), get, authenticated content download (`GET /:id/content`), delete |
| Activities | `/api/activities` | list, get |
| Commissions | `/api/commissions` | list, create, get, update |
| Dashboard | `/api/dashboard` | scoped KPI summary |
| Reports | `/api/reports` | summary, renewals, commissions |

List endpoints accept `page`, `limit`, `search`, `status`, `sortBy`, and `sortOrder`. Success responses use `{ success, message?, data, meta? }`; errors use `{ success: false, message, errors? }`.
