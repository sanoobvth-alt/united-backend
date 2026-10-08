# Request data flow

```text
AI IDE / client -> Express -> global middleware -> feature route
  -> JWT authentication -> named permission -> Zod input validation
  -> controller -> service / transaction -> Prisma model -> PostgreSQL
  -> feature serializer -> consistent JSON response
```

Branch routes obtain tenant scope from the authenticated branch identity. `branchId` in a request body is ignored for branch users. Admins can select a branch for operational writes.
