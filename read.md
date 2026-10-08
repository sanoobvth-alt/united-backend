# United Insurance Backend

Backend API for a branch-centric insurance CRM, built with Node.js, Express 5, PostgreSQL, Prisma, Zod, and JWT.

## Features

- Separate sign-in endpoints for administrators and branches
- JWT bearer authentication and role-based permissions
- Branch-scoped access to operational records
- CRUD APIs for customers, policies, claims, leads, renewals, documents, and related CRM data
- Authenticated document uploads and downloads

Customers and staff are CRM records and do not have sign-in accounts.

## Requirements

- Node.js 22.18 or newer
- PostgreSQL

## Setup

1. Configure the database connection, a unique `JWT_SECRET`, and initial administrator credentials in the environment.
2. Install dependencies with `npm install`.
3. Generate and validate Prisma with `npm run prisma:generate` and `npm run prisma:validate`.
4. Apply the database migration and seed the initial administrator with `npx prisma migrate dev --name init` and `npm run db:seed`.
5. Start the development server with `npm run dev`.

The health endpoint is `GET /health`.

## Authentication

- Administrator login: `POST /api/auth/admin/login` with `email` and `password`.
- Branch login: `POST /api/auth/branch/login` with `username` and `password`.
- Send the returned JWT on protected requests as `Authorization: Bearer <token>`.

Set `JWT_EXPIRES_IN` to change the token lifetime; it defaults to `8h`. Never commit `.env` or expose `JWT_SECRET` or account passwords. The repository `.gitignore` excludes `.env`.

See [README.md](README.md), [API-SCOPE.md](API-SCOPE.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [DFD.md](DFD.md) for setup, endpoints, and system design.
