# Insurance CRM backend

Branch-centric insurance CRM built with Node.js, Express 5, ES modules, PostgreSQL, Prisma 7 with the `pg` driver adapter, Zod, and JWT. This API does not provide customer login, a customer portal, or staff authentication.

## Setup

1. Install Node.js 22.18 or newer and PostgreSQL. The generated Prisma client uses Node's native TypeScript support.
2. Copy `.env.example` to `.env` and set a unique `JWT_SECRET`, database URL, and initial admin credentials.
3. Run `npm install`.
4. Run `npm run prisma:generate` and `npm run prisma:validate`.
5. Run `npx prisma migrate dev --name init`, then `npm run db:seed`.
6. Run `npm run dev`. Health check: `GET /health`.

Admin sign-in uses `POST /api/auth/admin/login` with email/password. Branch sign-in uses `POST /api/auth/branch/login` with username/password. Send the returned token as `Authorization: Bearer <token>`.

Branch users can upload a customer, policy, or claim document with `POST /api/documents/upload` using multipart form data (`file`, `type`, and one related record ID). PDF, JPEG, and PNG files are allowed up to 5 MB by default; downloads use an authenticated content endpoint.

## Development

`npm run check` checks JavaScript syntax and rejects CommonJS. `npm run prisma:validate` validates the data model. See [API-SCOPE.md](./API-SCOPE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [DFD.md](./DFD.md).
