---
name: prisma-patterns
description: Prisma ORM schema patterns, client setup, common queries, optimization strategies. Use when creating Prisma schemas, setting up database clients, or writing queries. Can fetch latest Prisma docs.
allowed-tools: WebFetch, Read, Grep, Glob
last_verified: "2025-12-13"
target_versions:
  prisma: "5.x"
  prisma-client: "5.x"
---

# Prisma Standards

SQLite database with Prisma ORM.

## When to Use This Skill

- Creating or modifying Prisma schemas
- Setting up Prisma client
- Writing database queries
- Optimizing query performance
- Need to check latest Prisma patterns

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **Schema Reference**: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- **Queries**: https://www.prisma.io/docs/orm/prisma-client/queries
- **Relations**: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- **Performance**: https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance

## Schema Location

`prisma/schema.prisma`

## Schema Pattern

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Item {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  name      String
  status    String   @default("pending")

  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
}
```

## Rules

- Use `cuid()` for IDs, not autoincrement
- Always include `id`, `createdAt`, `updatedAt`
- Use `String` for status fields with `@default("value")`
- Relations need fields on both sides

## Client Setup

```tsx
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Common Queries

```tsx
await prisma.item.findMany({ orderBy: { createdAt: "desc" } });
await prisma.item.findUnique({ where: { id } });
await prisma.item.create({ data: { name, status } });
await prisma.item.update({ where: { id }, data: { status } });
await prisma.item.delete({ where: { id } });
```

## Query Optimization

**❌ N+1 Problem:**
```tsx
const items = await prisma.item.findMany();
// Then loop to fetch related data
for (const item of items) {
  const category = await prisma.category.findUnique({ where: { id: item.categoryId } });
}
```

**✅ Use include:**
```tsx
const items = await prisma.item.findMany({
  include: { category: true }
});
```

## Verify Schema Before Changes

```bash
# Find existing models
grep -r "model" prisma/schema.prisma

# Check for relations
grep -r "@relation" prisma/schema.prisma
```

## Do Not

- No integer IDs
- No raw SQL
- No missing timestamps
