# Architecture

The backend is a feature-based monolith. Each request moves through Express routes, JWT authentication, named permission authorization, Zod validation, controllers, business services, Prisma models, and feature serializers. `src/features/shared/resource.factory.js` provides the repeated CRUD implementation while per-feature definitions in `src/features/resources.js` own field validation and relation checks.

Admins have system-wide access. A branch JWT carries its `branchId`; services derive branch scope from this identity and never use a request-supplied branch id to widen access. Relations between operational records are checked against the same branch before writes. Staff are CRM records and cannot authenticate.

`server.js` is process bootstrap; `src/app.js` configures HTTP middleware and routes. Secrets and database configuration come from environment variables. Password hashes are not returned by serializers.
