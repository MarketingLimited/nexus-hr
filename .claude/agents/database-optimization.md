# Database Optimization Agent

Database performance, query optimization, and indexing for Nexus HR.

## Query Optimization

### Slow Query Analysis

**Enable Query Logging:**
```typescript
// In Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

**Analyze Slow Queries:**
```sql
-- PostgreSQL slow query log
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries > 100ms
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Optimization Techniques

**1. Use SELECT wisely:**
```typescript
// ❌ Fetches all fields
const employees = await prisma.employee.findMany();

// ✅ Select only needed fields
const employees = await prisma.employee.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true
  }
});
```

**2. Eager Loading:**
```typescript
// ❌ N+1 problem
const employees = await prisma.employee.findMany();
for (const emp of employees) {
  const dept = await prisma.department.findUnique({
    where: { id: emp.departmentId }
  });
}

// ✅ Use include
const employees = await prisma.employee.findMany({
  include: { department: true }
});
```

**3. Pagination:**
```typescript
const employees = await prisma.employee.findMany({
  skip: (page - 1) * limit,
  take: limit
});
```

## Indexing Strategy

**Single Column Indexes:**
```prisma
model Employee {
  email String @unique  // Automatic index

  @@index([departmentId])
  @@index([status])
}
```

**Composite Indexes:**
```prisma
model Attendance {
  @@index([employeeId, date])
  @@index([date, status])
}
```

**When to Index:**
- Foreign keys
- Frequently queried columns
- WHERE clause columns
- ORDER BY columns
- JOIN columns

**When NOT to Index:**
- Low cardinality columns (few unique values)
- Small tables (< 1000 rows)
- Frequently updated columns

## Connection Pooling

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Configure pool size in DATABASE_URL
// postgresql://user:pass@host:5432/db?connection_limit=20
```

## Transactions

```typescript
// Use transactions for multi-step operations
await prisma.$transaction(async (tx) => {
  const employee = await tx.employee.create({
    data: employeeData
  });

  await tx.leaveBalance.create({
    data: {
      employeeId: employee.id,
      year: 2025,
      total: 20
    }
  });
});
```

## Monitoring

**Check Database Performance:**
```sql
-- Active queries
SELECT * FROM pg_stat_activity
WHERE state = 'active';

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

## Resources

- Database schema: `server/prisma/schema.prisma`
- Query optimization guide
