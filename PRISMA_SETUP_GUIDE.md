# 🚀 Complete Prisma ORM Setup Guide

A production-ready, step-by-step setup guide for integrating **Prisma ORM** into a Node.js / Express / TypeScript / JavaScript backend project.

---

## 📋 Table of Contents
1. [Prerequisites & Installation](#1-prerequisites--installation)
2. [Initialize Prisma](#2-initialize-prisma)
3. [Environment Configuration (`.env`)](#3-environment-configuration-env)
4. [Prisma Configuration File (`prisma.config.ts` / `prisma.config.js`)](#4-prisma-configuration-file)
5. [Schema Definition (`prisma/schema.prisma`)](#5-schema-definition-prismaschemaprisma)
6. [Prisma Client Singleton Setup](#6-prisma-client-singleton-setup)
   - [Option A: Standard Prisma Setup (Recommended for most projects)](#option-a-standard-prisma-setup)
   - [Option B: Modern Driver Adapter Setup (Prisma v6 / v7 + PostgreSQL)](#option-b-modern-driver-adapter-setup)
7. [Database Migrations & Generation](#7-database-migrations--generation)
8. [Database Seeding (`prisma/seed.js`)](#8-database-seeding-prismaseedjs)
9. [`package.json` Scripts](#9-packagejson-scripts)
10. [Handling Common Prisma Errors](#10-handling-common-prisma-errors)
11. [Cheat Sheet: Essential Commands](#11-cheat-sheet-essential-commands)

---

## 1. Prerequisites & Installation

### Option A: Standard Setup
```bash
# Production dependencies
npm install @prisma/client dotenv

# Development dependencies
npm install -D prisma
```

### Option B: Modern Setup with Driver Adapter (Prisma v6 / v7 + PostgreSQL)
```bash
# Production dependencies
npm install @prisma/client @prisma/adapter-pg pg dotenv

# Development dependencies
npm install -D prisma
```

*(If using TypeScript, also install `@types/node` and `@types/pg`)*

---

## 2. Initialize Prisma

Run the init command to bootstrap the `prisma/` folder and `.env` template:

```bash
npx prisma init --datasource-provider postgresql
```
> Supported providers: `postgresql`, `mysql`, `sqlite`, `sqlserver`, `mongodb`, `cockroachdb`.

This creates:
- `prisma/schema.prisma`
- `.env` (or appends to existing `.env`)

---

## 3. Environment Configuration (`.env`)

Add your database connection string to your `.env` file:

```env
# PostgreSQL
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME?schema=public"

# MySQL
# DATABASE_URL="mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME"

# SQLite
# DATABASE_URL="file:./dev.db"

# MongoDB
# DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/DB_NAME?retryWrites=true&w=majority"
```

---

## 4. Prisma Configuration File

*(Available in Prisma v6 / v7)*

Create `prisma.config.ts` (or `prisma.config.js` for ESM JavaScript) at the project root:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js", // Command to execute seed
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

---

## 5. Schema Definition (`prisma/schema.prisma`)

Here is a clean, scalable starter schema with Enums, Relationships, and Timestamps:

```prisma
generator client {
  provider = "prisma-client-js"
  // Optional: Custom output directory if desired
  // output   = "../generated/prisma/client"
}

datasource db {
  provider = "postgresql"
  // Note: When using prisma.config.ts, url can be omitted or read from env
  url      = env("DATABASE_URL")
}

// ==========================================
// ENUMS
// ==========================================
enum Role {
  USER
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}

// ==========================================
// MODELS
// ==========================================
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  role      Role     @default(USER)
  status    Status   @default(ACTIVE)

  // Relations
  profile   Profile?
  posts     Post[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([email])
  @@map("users")
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio       String?
  avatarUrl String?  @map("avatar_url")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("profiles")
}

model Post {
  id        String   @id @default(uuid())
  title     String
  slug      String   @unique
  content   String?
  published Boolean  @default(false)
  authorId  String   @map("author_id")
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([authorId])
  @@index([slug])
  @@map("posts")
}
```

---

## 6. Prisma Client Singleton Setup

To prevent exhausting database connection pools during local development and hot-reloading, instantiate a **singleton** client.

### Option A: Standard Prisma Setup
Create `src/config/prisma.js` (or `src/config/prisma.ts`):

```javascript
// src/config/prisma.js
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### Option B: Modern Driver Adapter Setup
*(Used with `@prisma/adapter-pg` and custom generated client)*

```javascript
// src/config/prisma.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

## 7. Database Migrations & Generation

### Development Migration:
Whenever you update `schema.prisma`, create and apply a migration:
```bash
npx prisma migrate dev --name init_schema
```

### Generate Prisma Client:
If you updated the schema without migrating (or on build):
```bash
npx prisma generate
```

### Production Migration:
On staging/production CI/CD pipelines:
```bash
npx prisma migrate deploy
```

---

## 8. Database Seeding (`prisma/seed.js`)

Create `prisma/seed.js` for initial test/admin data:

```javascript
// prisma/seed.js
import "dotenv/config";
import prisma from "../src/config/prisma.js";

async function main() {
  console.log("🌱 Starting database seed...");

  // Upsert Super Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: "$2b$10$YourHashedPasswordHere", // replace with hashed password
      firstName: "Super",
      lastName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      profile: {
        create: {
          bio: "System Administrator",
        },
      },
    },
  });

  console.log(`✅ Seeded admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Add Seeding Configuration
If not using `prisma.config.ts`, add this to your `package.json`:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

Run seed:
```bash
npx prisma db seed
```

---

## 9. `package.json` Scripts

Add these helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset",
    "build": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

> **Note:** `postinstall: prisma generate` ensures that the client is automatically generated whenever dependencies are installed in Docker / CI/CD environments.

---

## 10. Handling Common Prisma Errors

Prisma throws `PrismaClientKnownRequestError` with specific error codes. You can catch them cleanly in your global error middleware:

```javascript
import { Prisma } from "@prisma/client";

export function errorHandler(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        // Unique constraint failed
        const fields = err.meta?.target ? err.meta.target.join(", ") : "field";
        return res.status(409).json({
          status: "fail",
          message: `A record with this ${fields} already exists.`,
        });
      }
      case "P2025": {
        // Record not found
        return res.status(404).json({
          status: "fail",
          message: err.meta?.cause || "Record not found.",
        });
      }
      case "P2003": {
        // Foreign key constraint failed
        return res.status(400).json({
          status: "fail",
          message: "Foreign key constraint failed.",
        });
      }
      default:
        return res.status(500).json({
          status: "error",
          message: `Database error code: ${err.code}`,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid query parameters or missing required fields.",
    });
  }

  return res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
}
```

---

## 11. Cheat Sheet: Essential Commands

| Action | Command |
|---|---|
| Initialize Prisma | `npx prisma init` |
| Create & apply migration (Dev) | `npx prisma migrate dev --name <migration_name>` |
| Apply pending migrations (Prod) | `npx prisma migrate deploy` |
| Generate Prisma Client | `npx prisma generate` |
| Open visual database GUI | `npx prisma studio` |
| Sync schema to DB (Prototyping / No migrations) | `npx prisma db push` |
| Pull DB schema into `schema.prisma` | `npx prisma db pull` |
| Run Seed script | `npx prisma db seed` |
| Reset database & re-run seeds | `npx prisma migrate reset` |
| Format schema file | `npx prisma format` |
| Validate schema file | `npx prisma validate` |
