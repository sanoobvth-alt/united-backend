# Scalable Project Architecture

> Reusable backend architecture for upcoming projects
>
> Stack: **Node.js + Express 5 + ES6 Modules + PostgreSQL + Prisma 7 + Zod + Axios + JWT + RBAC**
>
> Architecture type: **Feature-Based Monolith**

---

## 1. Architecture Goal

The goal of this architecture is to keep a monolithic backend easy to understand at the beginning and still easy to scale when the project grows.

The main rule is:

```text
Feature first, layer second.
```

Instead of keeping all routes, controllers, services, models, validators, and serializers in separate global folders, each business feature owns its own files.

### Request flow

```text
Client
  ↓
Express App
  ↓
Global Middleware
  ↓
Feature Route
  ↓
Authentication / Authorization
  ↓
Zod Validation
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Service
  ↓
Serializer
  ↓
JSON Response
```

### Responsibility rule

```text
Route       → URL + HTTP method + middleware composition
Controller  → HTTP request/response handling
Service     → Business logic and use cases
Model       → Database access through Prisma
Schema      → Input validation with Zod
Serializer  → Output shaping / response sanitization
Middleware  → Cross-cutting request processing
Utils       → Small reusable technical helpers
Config      → External configuration / clients
Context     → Request-scoped application context
```

---

# 2. Current Project Analysis

## 2.1 Current `app.js`

The current `src/app.js` already has the correct high-level responsibility: create the Express app, register global middleware, mount feature routes, then register the 404 and error handlers.

Current application order is effectively:

```text
Express app
→ CORS
→ Morgan
→ express.json
→ express.urlencoded
→ cookie parser
→ static uploads
→ optional authentication
→ routes
→ not found
→ error handler
```

### Recommended changes

1. Keep `cors`, `morgan`, `express.json()`, and `express.urlencoded()` as global middleware.
2. Keep `notFoundMiddleware` immediately before `errorMiddleware`.
3. Keep upload handling as a route-level middleware because it is feature-specific.
4. Keep authentication/authorization as route-level middleware except for routes that intentionally support optional authentication.
5. Do not globally run `optionalAuth` for every request unless the whole application needs it.
6. `cookie-parser` is unnecessary when JWT authentication is only sent through the `Authorization: Bearer ...` header. Add it only when the project actually uses cookies.
7. Move route registration into a central `routes/index.js` so `app.js` does not become a long list of feature imports.
8. Keep static uploads only when local file storage is part of the project.
9. Do not use `express-validator`; validation should be handled by Zod.

---

# 3. Recommended `app.js`

`app.js` should remain small and stable even when the project contains many features.

```js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import apiRoutes from "./routes/index.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

// API routes
app.use("/api", apiRoutes);

// 404 handler - must be after all routes
app.use(notFoundMiddleware);

// Error handler - must be the final middleware
app.use(errorMiddleware);

export default app;
```

### Application responsibility

```text
app.js
├── create Express instance
├── global middleware
├── root / health endpoint
├── mount /api routes
├── notFoundMiddleware
└── errorMiddleware
```

Do not place business logic inside `app.js`.

---

# 4. Feature-Based Folder Structure

Recommended project structure:

```text
project-root/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── generated/
│   └── prisma/
│       └── client/
│
├── public/
│   └── uploads/
│
├── scripts/
│
├── src/
│   │
│   ├── app.js
│   │
│   ├── config/
│   │   ├── axios.js
│   │   └── prisma.js
│   │
│   ├── constants/
│   │   ├── roles.js
│   │   └── permissions.js
│   │
│   ├── context/
│   │   └── theme.context.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── authorization.middleware.js
│   │   ├── upload.middleware.js
│   │   ├── zod.middleware.js
│   │   ├── not-found.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── file.utility.js
│   │   ├── generateToken.js
│   │   ├── queryBuilder.js
│   │   └── toSlug.js
│   │
│   └── features/
│       │
│       ├── auth/
│       │   ├── auth.route.js
│       │   ├── auth.controller.js
│       │   ├── auth.service.js
│       │   ├── auth.model.js
│       │   ├── auth.schema.js
│       │   └── auth.serializer.js
│       │
│       ├── users/
│       │   ├── user.route.js
│       │   ├── user.controller.js
│       │   ├── user.service.js
│       │   ├── user.model.js
│       │   ├── user.schema.js
│       │   └── user.serializer.js
│       │
│       ├── students/
│       │   ├── student.route.js
│       │   ├── student.controller.js
│       │   ├── student.service.js
│       │   ├── student.model.js
│       │   ├── student.schema.js
│       │   └── student.serializer.js
│       │
│       ├── instructors/
│       │   ├── instructor.route.js
│       │   ├── instructor.controller.js
│       │   ├── instructor.service.js
│       │   ├── instructor.model.js
│       │   ├── instructor.schema.js
│       │   └── instructor.serializer.js
│       │
│       ├── courses/
│       │   ├── course.route.js
│       │   ├── course.controller.js
│       │   ├── course.service.js
│       │   ├── course.model.js
│       │   ├── course.schema.js
│       │   └── course.serializer.js
│       │
│       ├── course-categories/
│       │   ├── course-category.route.js
│       │   ├── course-category.controller.js
│       │   ├── course-category.service.js
│       │   ├── course-category.model.js
│       │   ├── course-category.schema.js
│       │   └── course-category.serializer.js
│       │
│       ├── curriculum/
│       │   ├── curriculum.route.js
│       │   ├── curriculum.controller.js
│       │   ├── curriculum.service.js
│       │   ├── curriculum.model.js
│       │   ├── curriculum.schema.js
│       │   └── curriculum.serializer.js
│       │
│       ├── overview/
│       │   ├── overview.route.js
│       │   ├── overview.controller.js
│       │   ├── overview.service.js
│       │   ├── overview.model.js
│       │   ├── overview.schema.js
│       │   └── overview.serializer.js
│       │
│       ├── enrollments/
│       │   ├── enrollment.route.js
│       │   ├── enrollment.controller.js
│       │   ├── enrollment.service.js
│       │   ├── enrollment.model.js
│       │   ├── enrollment.schema.js
│       │   └── enrollment.serializer.js
│       │
│       ├── payments/
│       │   ├── payment.route.js
│       │   ├── payment.controller.js
│       │   ├── payment.service.js
│       │   ├── payment.model.js
│       │   ├── payment.schema.js
│       │   └── payment.serializer.js
│       │
│       ├── reviews/
│       │   ├── review.route.js
│       │   ├── review.controller.js
│       │   ├── review.service.js
│       │   ├── review.model.js
│       │   ├── review.schema.js
│       │   └── review.serializer.js
│       │
│       ├── blogs/
│       │   ├── blog.route.js
│       │   ├── blog.controller.js
│       │   ├── blog.service.js
│       │   ├── blog.model.js
│       │   ├── blog.schema.js
│       │   └── blog.serializer.js
│       │
│       ├── blog-categories/
│       │   ├── blog-category.route.js
│       │   ├── blog-category.controller.js
│       │   ├── blog-category.service.js
│       │   ├── blog-category.model.js
│       │   ├── blog-category.schema.js
│       │   └── blog-category.serializer.js
│       │
│       ├── tags/
│       │   ├── tag.route.js
│       │   ├── tag.controller.js
│       │   ├── tag.service.js
│       │   ├── tag.model.js
│       │   ├── tag.schema.js
│       │   └── tag.serializer.js
│       │
│       ├── testimonials/
│       │   ├── testimonial.route.js
│       │   ├── testimonial.controller.js
│       │   ├── testimonial.service.js
│       │   ├── testimonial.model.js
│       │   ├── testimonial.schema.js
│       │   └── testimonial.serializer.js
│       │
│       ├── spotlights/
│       │   ├── spotlight.route.js
│       │   ├── spotlight.controller.js
│       │   ├── spotlight.service.js
│       │   ├── spotlight.model.js
│       │   ├── spotlight.schema.js
│       │   └── spotlight.serializer.js
│       │
│       └── about/
│           ├── about.route.js
│           ├── about.controller.js
│           ├── about.service.js
│           ├── about.model.js
│           ├── about.schema.js
│           └── about.serializer.js
│
├── .env
├── .gitignore
├── package.json
├── prisma.config.ts
├── server.js
└── README.md
```

---

# 5. Why Feature-Based Instead of Layer-Based

## Current structure

```text
src/
├── controllers/
├── services/
├── routes/
├── serializers/
├── validators/
├── middlewares/
├── utils/
└── config/
```

This works for a small application, but related files become difficult to find as the application grows.

For example, a Course change requires moving between:

```text
controllers/course.controller.js
services/course.service.js
routes/courses.routes.js
serializers/course.serializer.js
validators/course.validator.js
```

## Feature-based structure

```text
src/features/courses/
├── course.route.js
├── course.controller.js
├── course.service.js
├── course.model.js
├── course.schema.js
└── course.serializer.js
```

Everything related to the Course feature stays together.

### Scaling rule

When a new business feature is added:

```text
Create one new feature folder.
```

Do not create a new global controller/service/validator folder entry unless the file is truly cross-feature infrastructure.

---

# 6. Route Layer

Routes define the public API contract and compose middleware.

Example:

```js
import express from "express";
import createUploader from "../../middlewares/upload.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  createCourseSchema,
  courseIdSchema,
  updateCourseSchema,
} from "./course.schema.js";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "./course.controller.js";

const router = express.Router();
const upload = createUploader("courses");

router.get("/", getCourses);

router.get(
  "/:id",
  validate(courseIdSchema, "params"),
  getCourse,
);

router.post(
  "/",
  authenticate,
  authorize("course:create"),
  upload.single("image"),
  validate(createCourseSchema, "body"),
  createCourse,
);

router.patch(
  "/:id",
  authenticate,
  authorize("course:update"),
  validate(courseIdSchema, "params"),
  upload.single("image"),
  validate(updateCourseSchema, "body"),
  updateCourse,
);

router.delete(
  "/:id",
  authenticate,
  authorize("course:delete"),
  validate(courseIdSchema, "params"),
  deleteCourse,
);

export default router;
```

### Route rule

Routes should not contain business logic.

Bad:

```js
router.post("/", async (req, res) => {
  // database query
  // business rules
  // password hashing
  // response transformation
});
```

Good:

```text
Route
→ middleware
→ controller
```

---

# 7. Controller Layer

The controller translates HTTP data into a service call and converts the service result into an HTTP response.

```js
import {
  getCoursesService,
  getCourseService,
  createCourseService,
  updateCourseService,
  deleteCourseService,
} from "./course.service.js";

import { courseSerializer } from "./course.serializer.js";

export const getCourses = async (req, res, next) => {
  try {
    const result = await getCoursesService(req.query);

    res.json({
      success: true,
      data: result.data.map(courseSerializer),
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await getCourseService(req.params.id);

    res.json({
      success: true,
      data: courseSerializer(course),
    });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const course = await createCourseService({
      data: req.body,
      user: req.user,
      fileUrl: req.fileUrl,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: courseSerializer(course),
    });
  } catch (error) {
    next(error);
  }
};
```

### Controller should not

```text
❌ Write Prisma queries
❌ Implement business rules
❌ Build complex filters
❌ Hash passwords directly
❌ Decide authorization rules
❌ Return raw Prisma objects
```

---

# 8. Service Layer

The service is the main business layer.

Responsibilities:

```text
Business rules
Transactions
Cross-feature orchestration
Validation of business conditions
Calling models
Calling technical utilities when required
```

Example:

```js
import ApiError from "../../utils/ApiError.js";
import toSlug from "../../utils/toSlug.js";
import { courseModel } from "./course.model.js";
import { courseCategoryModel } from "../course-categories/course-category.model.js";
import { instructorModel } from "../instructors/instructor.model.js";

export const createCourseService = async ({ data, user, fileUrl }) => {
  const category = await courseCategoryModel.findActiveById(data.categoryId);

  if (!category) {
    throw new ApiError(404, "Course category not found");
  }

  const instructor = await instructorModel.findActiveById(data.instructorId);

  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  const slug = data.slug || toSlug(data.title);

  const existing = await courseModel.findBySlug(slug);

  if (existing) {
    throw new ApiError(409, "Course with this slug already exists");
  }

  return courseModel.create({
    ...data,
    slug,
    image: fileUrl || data.image,
    createdById: user.id,
    updatedById: user.id,
  });
};
```

### Important

The service should not receive Express-specific objects whenever possible.

Prefer:

```js
createCourseService({
  data,
  user,
  fileUrl,
});
```

over:

```js
createCourseService(req, res);
```

This keeps services reusable and testable.

---

# 9. Model Layer

Because Prisma already represents database models, the project should not duplicate the Prisma schema with unnecessary classes.

In this architecture, `*.model.js` acts as the feature's database access layer around Prisma.

Example:

```js
import prisma from "../../config/prisma.js";

export const courseModel = {
  findById(id, db = prisma) {
    return db.course.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });
  },

  findBySlug(slug, db = prisma) {
    return db.course.findUnique({
      where: { slug },
    });
  },

  findMany(args, db = prisma) {
    return db.course.findMany(args);
  },

  count(args, db = prisma) {
    return db.course.count(args);
  },

  create(data, db = prisma) {
    return db.course.create({
      data,
      include: {
        category: true,
        instructor: true,
      },
    });
  },

  update(id, data, db = prisma) {
    return db.course.update({
      where: { id },
      data,
    });
  },

  softDelete(id, userId, db = prisma) {
    return db.course.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedById: userId,
      },
    });
  },
};
```

### Why `db = prisma` is useful

It allows the same model to work inside a Prisma transaction:

```js
await prisma.$transaction(async (tx) => {
  const user = await userModel.create(userData, tx);
  const student = await studentModel.create(studentData, tx);
});
```

The service owns the transaction; the model only performs database operations.

---

# 10. Zod Validation

`express-validator` should be removed.

Every feature keeps its own Zod schemas:

```text
feature/
└── course.schema.js
```

Example:

```js
import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid ID");

export const courseIdSchema = z.object({
  id: uuidSchema,
});

export const createCourseSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  content: z.string().trim().min(1),
  duration: z.string().trim().min(1),
  categoryId: uuidSchema,
  instructorId: uuidSchema,
  slug: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();
```

### Zod middleware

```js
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    req[source] = result.data;
    next();
  };
};
```

### Validation flow

```text
Request
  ↓
Multer (when file upload exists)
  ↓
Zod schema
  ↓
req.body / req.params / req.query becomes validated data
  ↓
Controller
```

There is no separate input sanitizer layer in this architecture.

Zod is responsible for:

```text
Type checking
Required fields
Optional fields
Enum validation
UUID validation
String trimming
Basic coercion where explicitly intended
Unknown-key handling
```

For security-sensitive business rules, validation in the service is still required. Zod validates the shape of input; it does not replace business logic.

---

# 11. Response Serialization / JSON Sanitization

The API should never expose raw Prisma records directly.

Use a serializer for every feature.

Example:

```js
export const courseSerializer = (course) => ({
  id: course.id,
  title: course.title,
  slug: course.slug,
  description: course.description,
  duration: course.duration,
  image: course.image,
  status: course.status,
  category: course.category
    ? {
        id: course.category.id,
        name: course.category.name,
        slug: course.category.slug,
      }
    : null,
  instructor: course.instructor
    ? {
        id: course.instructor.id,
        bio: course.instructor.bio,
      }
    : null,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});
```

### Serializer rule

```text
Database object
      ↓
Serializer
      ↓
Public API object
```

This protects fields such as:

```text
password
internal IDs when not needed
private metadata
internal audit fields
sensitive relations
```

Serializer = **output sanitization**.

Zod = **input validation**.

---

# 12. Authentication

Authentication answers:

```text
Who is this user?
```

Use JWT.

### `generateToken.js`

```js
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

export default generateToken;
```

### Authentication middleware

```js
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import prisma from "../config/prisma.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid token"));
  }
};
```

Authentication should only identify the user. Authorization decides what the user is allowed to do.

---

# 13. Role-Based Access Control (RBAC)

This project should use both **role-based** and **permission-based** authorization.

## Roles

For the reusable framework:

```js
export const ADMIN = "ADMIN";
export const USER = "USER";
export const MODERATOR = "MODERATOR";
```

The actual project can replace these roles with domain-specific roles such as `INSTRUCTOR` and `STUDENT` without changing the architecture.

## Permissions

Do not make every route depend directly on role checks like:

```js
authorize(ADMIN, MODERATOR)
```

For a scalable project, prefer named permissions:

```js
export const PERMISSIONS = {
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  COURSE_READ: "course:read",
  COURSE_CREATE: "course:create",
  COURSE_UPDATE: "course:update",
  COURSE_DELETE: "course:delete",
};
```

## Role → permissions

```js
export const ROLE_PERMISSIONS = {
  ADMIN: [
    "user:read",
    "user:create",
    "user:update",
    "user:delete",
    "course:read",
    "course:create",
    "course:update",
    "course:delete",
  ],

  MODERATOR: [
    "user:read",
    "course:read",
    "course:create",
    "course:update",
  ],

  USER: [
    "course:read",
  ],
};
```

---

# 14. Permission-Based Authorization Middleware

```js
import ApiError from "../utils/ApiError.js";
import { ROLE_PERMISSIONS } from "../constants/permissions.js";

export const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    const permissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (!permissions.includes(permission)) {
      return next(new ApiError(403, "Permission denied"));
    }

    next();
  };
};
```

Route usage:

```js
router.patch(
  "/:id",
  authenticate,
  authorize("course:update"),
  validate(courseIdSchema, "params"),
  updateCourse,
);
```

This keeps route definitions readable and avoids hard-coding role combinations everywhere.

---

# 15. Granular Resource-Level Permissions

Endpoint-level permission is not always enough.

For example:

```text
course:update
```

may allow a user to update courses, but the application may still need to check:

```text
Can this specific user update THIS specific course?
```

Use a resource-level authorization step for this.

Example pattern:

```js
export const authorizeResource = ({ permission, loadResource, can }) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      const permissions = ROLE_PERMISSIONS[req.user.role] || [];

      if (!permissions.includes(permission)) {
        throw new ApiError(403, "Permission denied");
      }

      const resource = await loadResource(req);

      if (!resource) {
        throw new ApiError(404, "Resource not found");
      }

      const allowed = await can(req.user, resource);

      if (!allowed) {
        throw new ApiError(403, "You cannot access this resource");
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

Example:

```js
router.patch(
  "/:id",
  authenticate,
  authorizeResource({
    permission: "course:update",
    loadResource: (req) => courseModel.findById(req.params.id),
    can: (user, course) =>
      user.role === "ADMIN" || course.createdById === user.id,
  }),
  validate(courseIdSchema, "params"),
  validate(updateCourseSchema, "body"),
  updateCourse,
);
```

Use resource-level checks when ownership, assignment, tenant boundaries, or record-specific rules matter.

---

# 16. Middleware Structure

Required global middleware:

```text
cors
morgan
express.json
express.urlencoded
notFoundMiddleware
errorMiddleware
```

Feature / conditional middleware:

```text
auth.middleware.js
authorization.middleware.js
upload.middleware.js
zod.middleware.js
```

### Ordering

```text
cors
↓
morgan
↓
express.json
↓
express.urlencoded
↓
route-specific middleware
↓
route handler
↓
notFoundMiddleware
↓
errorMiddleware
```

### `notFoundMiddleware`

```js
import ApiError from "../utils/ApiError.js";

const notFoundMiddleware = (req, res, next) => {
  next(new ApiError(404, "Route not found"));
};

export default notFoundMiddleware;
```

### Error middleware

The error middleware should be the single final place for API error formatting.

It should recognize at minimum:

```text
ApiError
ZodError
Multer errors
Prisma errors
Unknown errors
```

Example baseline:

```js
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client/index.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    message = "Database request failed";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  });
};

export default errorMiddleware;
```

Adjust the Prisma import to match the generated Prisma client used by the project.

---

# 17. Utility Layer

Keep the shared utilities intentionally small.

Required utilities for this framework:

```text
src/utils/ApiError.js
src/utils/file.utility.js
src/utils/generateToken.js
src/utils/queryBuilder.js
src/utils/toSlug.js
```

## `ApiError`

```js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ApiError;
```

## `file.utility.js`

Responsible for local file operations such as deleting an uploaded file when a database operation fails.

```js
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

export async function deleteLocalFile(dbPath, baseFolder = "public") {
  if (!dbPath) return;

  try {
    const cleanPath = dbPath.startsWith("/")
      ? dbPath.slice(1)
      : dbPath;

    const fullPath = path.join(process.cwd(), baseFolder, cleanPath);

    if (fsSync.existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  } catch (error) {
    console.error("File delete failed:", error.message);
  }
}
```

## `generateToken.js`

Only token creation logic.

## `queryBuilder.js`

This is an important shared utility because list endpoints commonly need:

```text
Pagination
Filtering
Sorting
Search
Default values
Maximum page size
```

The service should provide feature-specific allowed fields.

Example:

```js
const { skip, take, orderBy, meta, where } = buildQueryOptions({
  query,
  allowedSortFields: ["createdAt", "title"],
  defaultSortField: "createdAt",
});
```

Never allow a client to send an arbitrary Prisma `orderBy` field without a whitelist.

## `toSlug.js`

```js
const toSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default toSlug;
```

Use it in services when generating route-friendly unique slugs.

---

# 18. Query Builder Standard

Every paginated feature should use the same query convention.

Example request:

```text
GET /api/courses?page=1&limit=20&sortBy=createdAt&order=desc&status=ACTIVE
```

Recommended response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### Query builder rules

```text
Page starts at 1
Default limit = 10
Maximum limit = 100
Sort fields are explicitly whitelisted
Order accepts asc / desc only
Feature-specific filters are added by the feature service
Soft-delete filtering is centralized where practical
```

The query builder should build safe generic pagination/sorting options. Domain-specific filters belong in the feature service/schema.

---

# 19. Prisma Configuration

The project is already using Prisma with the PostgreSQL adapter.

## `prisma.config.ts`

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## `src/config/prisma.js`

```js
import { PrismaClient } from "../../generated/prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
```

### Prisma rule

Do not instantiate a new `PrismaClient` inside every feature.

Use one configured Prisma client and pass the transaction client (`tx`) to models when necessary.

### Generated client

```text
generated/prisma/client/
```

is generated code. Do not edit generated files manually.

---

# 20. Axios Configuration

The current Axios file mixes CommonJS and ES modules. Since the project is configured with:

```json
{
  "type": "module"
}
```

Axios configuration must also use ES module syntax.

## Recommended `src/config/axios.js`

```js
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXTERNAL_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Feature-specific external integrations should import this client rather than creating Axios instances repeatedly.

Example:

```js
import { apiClient } from "../../config/axios.js";

export const getExternalData = async () => {
  const response = await apiClient.get("/items");
  return response.data;
};
```

For authenticated external APIs, use Axios interceptors or an explicitly configured client.

---

# 21. ES6+ / ESM Rules

This architecture uses ES modules everywhere.

## Correct

```js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

export const createUser = () => {};
export default router;
```

## Do not use

```js
const express = require("express");
const axios = require("axios");
module.exports = router;
```

Because `package.json` contains:

```json
"type": "module"
```

All local imports should include the `.js` extension.

```js
import { something } from "../utils/something.js";
```

---

# 22. Theme Context

The uploaded backend does not currently contain a ThemeContext implementation.

If the new project requires backend-aware theme information, keep it as a request-scoped application context instead of treating it like a frontend React `ThemeContext`.

Suggested location:

```text
src/context/theme.context.js
```

Example:

```js
export const getThemeContext = (req) => {
  return req.context?.theme || "default";
};

export const setThemeContext = (req, theme) => {
  req.context ??= {};
  req.context.theme = theme;
};
```

Use this only when theme affects backend behavior such as:

```text
Tenant branding
Email templates
Theme-specific content
Asset selection
API response formatting
```

Do not introduce a backend ThemeContext only because the frontend has one.

---

# 23. Feature Example: Complete Course Module

```text
src/features/courses/
│
├── course.route.js
├── course.controller.js
├── course.service.js
├── course.model.js
├── course.schema.js
└── course.serializer.js
```

### Responsibilities

```text
course.route.js
    ↓
HTTP endpoints + middleware

course.schema.js
    ↓
Zod input contracts

course.controller.js
    ↓
HTTP layer

course.service.js
    ↓
Course business rules

course.model.js
    ↓
Prisma database operations

course.serializer.js
    ↓
Public JSON response
```

### Example full flow

```text
POST /api/courses
       ↓
authenticate
       ↓
authorize("course:create")
       ↓
multer
       ↓
validate(createCourseSchema)
       ↓
createCourse controller
       ↓
createCourseService
       ↓
courseCategoryModel
instructorModel
courseModel
       ↓
Prisma
       ↓
courseSerializer
       ↓
JSON response
```

---

# 24. Feature Example: Authentication

```text
src/features/auth/
├── auth.route.js
├── auth.controller.js
├── auth.service.js
├── auth.model.js
├── auth.schema.js
└── auth.serializer.js
```

### Login flow

```text
POST /api/auth/login
       ↓
Zod validation
       ↓
auth controller
       ↓
auth service
       ↓
user model
       ↓
bcrypt.compare
       ↓
generateToken
       ↓
auth serializer
       ↓
JSON response
```

### Security rule

Never serialize the password field.

---

# 25. Cross-Feature Rules

Features can depend on other features, but dependencies must flow toward business capabilities, not HTTP layers.

Allowed:

```text
Course Service
    ↓
Instructor Model / Service
```

Allowed:

```text
Student Service
    ↓
User Service
```

Not allowed:

```text
Course Service
    ↓
Course Controller
```

Not allowed:

```text
Student Model
    ↓
Express Route
```

Never import controllers or routes into services/models.

---

# 26. Central Route Registry

Use one route registry to mount features.

## `src/routes/index.js`

```js
import express from "express";

import authRoutes from "../features/auth/auth.route.js";
import userRoutes from "../features/users/user.route.js";
import studentRoutes from "../features/students/student.route.js";
import instructorRoutes from "../features/instructors/instructor.route.js";
import courseRoutes from "../features/courses/course.route.js";
import courseCategoryRoutes from "../features/course-categories/course-category.route.js";
import curriculumRoutes from "../features/curriculum/curriculum.route.js";
import overviewRoutes from "../features/overview/overview.route.js";
import enrollmentRoutes from "../features/enrollments/enrollment.route.js";
import paymentRoutes from "../features/payments/payment.route.js";
import reviewRoutes from "../features/reviews/review.route.js";
import blogRoutes from "../features/blogs/blog.route.js";
import blogCategoryRoutes from "../features/blog-categories/blog-category.route.js";
import tagRoutes from "../features/tags/tag.route.js";
import testimonialRoutes from "../features/testimonials/testimonial.route.js";
import spotlightRoutes from "../features/spotlights/spotlight.route.js";
import aboutRoutes from "../features/about/about.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/students", studentRoutes);
router.use("/instructors", instructorRoutes);
router.use("/courses", courseRoutes);
router.use("/course-categories", courseCategoryRoutes);
router.use("/curriculum", curriculumRoutes);
router.use("/overview", overviewRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/blogs", blogRoutes);
router.use("/blog-categories", blogCategoryRoutes);
router.use("/tags", tagRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/spotlights", spotlightRoutes);
router.use("/about", aboutRoutes);

export default router;
```

When a new feature is created, add only one route import and one `router.use()` entry here.

---

# 27. `server.js`

Keep the server bootstrap separate from the Express application.

```js
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

`server.js` should be responsible for starting the process, not feature configuration.

---

# 28. Package Configuration

Recommended package direction:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

Core packages from the analysed project:

```text
@prisma/adapter-pg
@prisma/client
axios
bcrypt
cors
dotenv
express
jsonwebtoken
moment
morgan
multer
openai
path-to-regexp
prisma (dev dependency)
zod
```

Remove from the baseline:

```text
express-validator
```

`cookie-parser` should remain only when the application uses cookies.

`path-to-regexp` is optional and should only remain when a project-specific feature really needs it. Do not build core architecture around Express private internals such as `app._router`.

---

# 29. Recommended `.env`

Example:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"

JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"

EXTERNAL_API_BASE_URL=""
EXTERNAL_API_KEY=""

OPENAI_API_KEY=""
```

Never commit `.env` to source control.

---

# 30. Soft Delete Standard

For models that use soft deletion:

```text
isDeleted Boolean @default(false)
```

The feature model should consistently filter active records.

Example:

```js
where: {
  id,
  isDeleted: false,
}
```

For list queries, `queryBuilder.js` may establish the default `isDeleted: false` condition, while feature-specific logic handles additional filters.

Do not mix soft-delete logic inconsistently across controllers.

---

# 31. File Upload Standard

Uploads remain a middleware concern, while file lifecycle decisions remain in the service.

Flow:

```text
Route
 ↓
Multer
 ↓
req.file / req.fileUrl
 ↓
Zod body validation
 ↓
Service
 ↓
DB operation
```

When database creation/update fails after a new file was uploaded:

```text
Service detects failure
↓
deleteLocalFile()
```

When a record is updated with a new image:

```text
Create/update DB reference
↓
Delete old file after successful DB update
```

Do not store absolute server filesystem paths in the database when a public URL/path is sufficient.

---

# 32. Database Transaction Standard

Use Prisma transactions in services for operations that must succeed or fail together.

Example:

```js
return prisma.$transaction(async (tx) => {
  const user = await userModel.create(userData, tx);

  const student = await studentModel.create(
    {
      ...studentData,
      userId: user.id,
    },
    tx,
  );

  return { user, student };
});
```

Transaction ownership belongs to the service/use-case layer.

Models should accept `tx` as the database client.

---

# 33. API Response Standard

Use a consistent response shape.

### Success

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {}
}
```

### List

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Keep response formatting consistent across every feature.

---

# 34. Naming Conventions

Use consistent naming across all projects.

```text
Feature folder:
course-categories/

Route:
course-category.route.js

Controller:
course-category.controller.js

Service:
course-category.service.js

Model:
course-category.model.js

Schema:
course-category.schema.js

Serializer:
course-category.serializer.js
```

Variables/functions should use camelCase.

Constants should use SCREAMING_SNAKE_CASE.

Classes should use PascalCase.

Environment variables should use SCREAMING_SNAKE_CASE.

---

# 35. What Should Be Global vs Feature-Owned

## Global

```text
config/
constants/
context/
middlewares/
routes/
utils/
```

These are shared application infrastructure.

## Feature-owned

```text
route
controller
service
model
schema
serializer
```

These belong to one business capability.

### Rule of thumb

If the file answers:

> "Does this belong specifically to Course?"

then put it inside:

```text
features/courses/
```

If it answers:

> "Is this shared by many features?"

then consider:

```text
config/
constants/
context/
middlewares/
utils/
```

---

# 36. Mapping the Current Edulink Project

The current project can be reorganized approximately as follows:

```text
CURRENT                                  TARGET
────────────────────────────────────────────────────────────
src/routes/auth.routes.js          →     features/auth/auth.route.js
src/controllers/auth.controller.js→     features/auth/auth.controller.js
src/services/auth.service.js       →     features/auth/auth.service.js
src/serializers/auth.serializer.js →     features/auth/auth.serializer.js
src/validators/auth.validator.js   →     features/auth/auth.schema.js

src/routes/students.routes.js      →     features/students/student.route.js
src/controllers/student.controller.js →  features/students/student.controller.js
src/services/student.service.js    →     features/students/student.service.js
src/serializers/student.serializer.js →  features/students/student.serializer.js
src/validators/student.validator.js →    features/students/student.schema.js

src/routes/instructors.routes.js  →     features/instructors/instructor.route.js
src/controllers/instructor.controller.js → features/instructors/instructor.controller.js
src/services/instructor.service.js →    features/instructors/instructor.service.js
src/serializers/instructor.serializer.js → features/instructors/instructor.serializer.js
src/validators/instructor.validator.js →  features/instructors/instructor.schema.js

src/routes/courses.routes.js       →     features/courses/course.route.js
src/controllers/course.controller.js →   features/courses/course.controller.js
src/services/course.service.js     →     features/courses/course.service.js
src/serializers/course.serializer.js →   features/courses/course.serializer.js
src/validators/course.validator.js →      features/courses/course.schema.js
```

Apply the same pattern to:

```text
course-categories
curriculum
overview
blog-categories
blogs
tags
enrollments
payments
reviews
testimonials
spotlights
about
users
```

---

# 37. Edulink-Specific Improvements Before Reusing the Architecture

The uploaded project has several patterns worth correcting before treating it as the reusable template.

## A. Remove `express-validator`

Use Zod schemas and a single Zod validation middleware.

## B. Fix mixed module syntax

These current files use `require()` inside the ES-module project:

```text
src/config/axios.js
src/config/openAPi.js
```

Convert them to ESM imports.

## C. Do not put all feature files in global folders

Move each feature's route/controller/service/validator/serializer together.

## D. Add a model layer

Services currently access Prisma directly. Move Prisma operations behind feature models.

## E. Use permission-based RBAC

Replace repeated route-level role lists with reusable permissions and resource checks.

## F. Keep authentication separate from authorization

```text
authenticate()
    ↓
Who are you?

authorize("course:update")
    ↓
Are you allowed to perform this action?

resource authorization
    ↓
Are you allowed to modify this specific record?
```

## G. Avoid global optional authentication unless required

The current `optionalAuth` is attached globally. Prefer explicit use on public endpoints that optionally change behavior when a user is logged in.

## H. Keep serialization mandatory

Never return raw Prisma user objects from controllers.

## I. Keep query building reusable

Use `queryBuilder.js` for pagination/sorting and feature services for domain filters.

## J. Skip Jira from the baseline

The Jira module is excluded from this architecture document as requested. If a future project has an external integration, isolate it as an integration feature instead of putting external API code into general services.

---

# 38. Suggested Development Order for a New Project

Use this order when starting the next backend.

```text
01. package.json + ESM
        ↓
02. dotenv / environment configuration
        ↓
03. Prisma + PostgreSQL
        ↓
04. app.js + server.js
        ↓
05. global middleware
        ↓
06. ApiError + error middleware
        ↓
07. Zod middleware
        ↓
08. authentication
        ↓
09. RBAC + permissions
        ↓
10. first feature
        ↓
11. serializer standard
        ↓
12. queryBuilder
        ↓
13. upload middleware
        ↓
14. remaining features
```

---

# 39. Golden Rules for Every Future Project

```text
1. Use ES modules only.

2. Keep app.js small.

3. Keep server.js only for bootstrapping.

4. Organize by feature, not by technical layer.

5. Every feature owns route/controller/service/model/schema/serializer.

6. Routes do not contain business logic.

7. Controllers do not contain Prisma queries.

8. Services own business rules.

9. Models own Prisma data access.

10. Zod owns input validation.

11. Serializers own output sanitization.

12. Never expose raw Prisma objects.

13. Authentication identifies the user.

14. Authorization decides permissions.

15. Resource authorization handles ownership / record-level access.

16. Use one Prisma client configuration.

17. Pass Prisma transaction clients into models.

18. Keep queryBuilder generic and feature filters specific.

19. Keep utilities small and reusable.

20. Do not introduce global files when the logic belongs to one feature.
```

---

# 40. Final Architecture Summary

```text
                    ┌──────────────────────────────┐
                    │          Express App         │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │      Global Middleware       │
                    │ cors / morgan / json / form  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │        Feature Routes        │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Auth + Permission + Zod      │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │          Controller          │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │            Service           │
                    │      Business / Use Case     │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │             Model            │
                    │       Prisma Data Access     │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │          PostgreSQL           │
                    └──────────────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │          Serializer          │
                    │      JSON / Output Shape     │
                    └──────────────────────────────┘
```

This is a **feature-based scalable monolith**: one deployment, one codebase, one database connection layer, but strong boundaries between business capabilities.

---

# 41. Architecture Decision Checklist

Before adding a new file, ask:

```text
Is this global infrastructure?
    → config / middleware / context / utils

Is this business-specific?
    → feature folder

Is this input validation?
    → feature.schema.js

Is this DB access?
    → feature.model.js

Is this business logic?
    → feature.service.js

Is this HTTP handling?
    → feature.controller.js

Is this response shaping?
    → feature.serializer.js

Is this route definition?
    → feature.route.js
```

When this rule is followed consistently, a new feature can be added without restructuring the rest of the application.
