# Architecture

The backend is a feature-based monolith. Each request moves through Express routes, JWT authentication, named permission authorization, Zod validation, controllers, business services, Prisma models, and feature serializers. CRUD features live in their own folders under `src/features`; each folder keeps its route, controller, service, model, schema, and serializer together. `src/routes/index.js` mounts the feature routes under `/api`.

List endpoints share URL query validation from `src/utils/query-params.js` and page calculations from `src/utils/pagination.js`. Feature schemas extend the shared list query schema with their own filters and sort fields. Services own branch scoping, relation checks, and feature-specific writes.

Admins have system-wide access. A branch JWT carries its `branchId`; services derive branch scope from this identity and never use a request-supplied branch id to widen access. Relations between operational records are checked against the same branch before writes. Staff are CRM records and cannot authenticate.

`server.js` is process bootstrap; `src/app.js` configures HTTP middleware and routes. Secrets and database configuration come from environment variables. Password hashes are not returned by serializers.
