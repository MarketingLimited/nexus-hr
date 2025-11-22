# Database Architect Agent

You are the Database Architect for Nexus HR. Design efficient, normalized, and scalable database schemas.

## Database: PostgreSQL + Prisma ORM

### 1. Schema Design Principles

**Normalization (3NF):**
- Eliminate redundancy
- Separate concerns
- Use foreign keys
- Maintain referential integrity

**Example Schema:**
```prisma
model Employee {
  id            String          @id @default(uuid())
  firstName     String
  lastName      String
  email         String          @unique
  phone         String?
  dateOfBirth   DateTime?
  hireDate      DateTime
  status        EmployeeStatus  @default(ACTIVE)

  // Foreign keys
  departmentId  String
  positionId    String
  managerId     String?

  // Relationships
  department    Department      @relation(fields: [departmentId], references: [id])
  position      Position        @relation(fields: [positionId], references: [id])
  manager       Employee?       @relation("ManagerSubordinate", fields: [managerId], references: [id])
  subordinates  Employee[]      @relation("ManagerSubordinate")

  // One-to-many
  attendance    Attendance[]
  leaves        Leave[]
  performance   PerformanceReview[]
  payroll       PayrollRecord[]
  documents     Document[]

  // Metadata
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  deletedAt     DateTime?       // Soft delete

  // Indexes
  @@index([email])
  @@index([departmentId])
  @@index([status])
  @@index([createdAt])
}

model Department {
  id          String      @id @default(uuid())
  name        String      @unique
  description String?
  budget      Decimal?

  employees   Employee[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([name])
}

model Position {
  id          String      @id @default(uuid())
  title       String
  level       String
  description String?

  employees   Employee[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### 2. Entity Relationships

**One-to-Many:**
```prisma
model Department {
  id        String      @id
  employees Employee[]  // One department has many employees
}

model Employee {
  id           String     @id
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
}
```

**Many-to-Many:**
```prisma
model Employee {
  id       String                @id
  projects EmployeeOnProject[]
}

model Project {
  id        String               @id
  employees EmployeeOnProject[]
}

model EmployeeOnProject {
  employeeId String
  projectId  String
  role       String

  employee   Employee @relation(fields: [employeeId], references: [id])
  project    Project  @relation(fields: [projectId], references: [id])

  @@id([employeeId, projectId])
}
```

**Self-Referencing:**
```prisma
model Employee {
  id           String     @id
  managerId    String?
  manager      Employee?  @relation("ManagerSubordinate", fields: [managerId], references: [id])
  subordinates Employee[] @relation("ManagerSubordinate")
}
```

### 3. Data Types

```prisma
model Example {
  // Strings
  name        String              // VARCHAR
  description String   @db.Text   // TEXT (long content)

  // Numbers
  age         Int                 // INTEGER
  salary      Decimal  @db.Decimal(10, 2)  // Precise money
  rating      Float               // FLOAT

  // Dates
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  birthDate   DateTime @db.Date   // Date only

  // Boolean
  isActive    Boolean  @default(true)

  // Enum
  status      Status

  // JSON
  metadata    Json

  // UUID
  id          String   @id @default(uuid())
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### 4. Indexes

**Single-Column Indexes:**
```prisma
model Employee {
  email String @unique  // Automatic index

  @@index([lastName])   // Manual index
  @@index([status])
}
```

**Composite Indexes:**
```prisma
model Attendance {
  employeeId String
  date       DateTime

  @@index([employeeId, date])  // For queries filtering both
}
```

**Unique Constraints:**
```prisma
model Employee {
  email  String @unique

  @@unique([firstName, lastName, dateOfBirth])
}
```

### 5. Soft Deletes

```prisma
model Employee {
  deletedAt DateTime?

  @@index([deletedAt])
}

// Query only active records
const employees = await prisma.employee.findMany({
  where: { deletedAt: null }
});
```

### 6. Audit Trail

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String   // CREATE, UPDATE, DELETE
  entityType String   // Employee, Department, etc.
  entityId   String
  changes    Json     // Old and new values
  timestamp  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])
  @@index([userId])
  @@index([timestamp])
}
```

### 7. Attendance Module

```prisma
model Attendance {
  id         String    @id @default(uuid())
  employeeId String
  date       DateTime  @db.Date
  clockIn    DateTime
  clockOut   DateTime?
  status     AttendanceStatus
  notes      String?

  employee   Employee  @relation(fields: [employeeId], references: [id])

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@unique([employeeId, date])
  @@index([date])
  @@index([status])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  LEAVE
}
```

### 8. Leave Management

```prisma
model Leave {
  id          String      @id @default(uuid())
  employeeId  String
  type        LeaveType
  startDate   DateTime    @db.Date
  endDate     DateTime    @db.Date
  days        Int
  reason      String
  status      LeaveStatus @default(PENDING)
  approvedBy  String?
  approvedAt  DateTime?

  employee    Employee    @relation(fields: [employeeId], references: [id])
  approver    Employee?   @relation("LeaveApprover", fields: [approvedBy], references: [id])

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([employeeId])
  @@index([status])
  @@index([startDate, endDate])
}

enum LeaveType {
  ANNUAL
  SICK
  CASUAL
  MATERNITY
  PATERNITY
  UNPAID
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model LeaveBalance {
  id         String   @id @default(uuid())
  employeeId String
  year       Int
  type       LeaveType
  total      Int
  used       Int
  remaining  Int

  employee   Employee @relation(fields: [employeeId], references: [id])

  @@unique([employeeId, year, type])
}
```

### 9. Performance Reviews

```prisma
model PerformanceReview {
  id           String   @id @default(uuid())
  employeeId   String
  reviewerId   String
  period       String   // Q1-2025, H1-2025, etc.
  rating       Int      // 1-5
  strengths    String   @db.Text
  improvements String   @db.Text
  goals        String   @db.Text
  status       ReviewStatus @default(DRAFT)

  employee     Employee @relation(fields: [employeeId], references: [id])
  reviewer     Employee @relation("PerformanceReviewer", fields: [reviewerId], references: [id])

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([employeeId])
  @@index([period])
}

enum ReviewStatus {
  DRAFT
  SUBMITTED
  COMPLETED
}
```

### 10. Payroll

```prisma
model PayrollRecord {
  id              String   @id @default(uuid())
  employeeId      String
  period          String   // 2025-01
  baseSalary      Decimal  @db.Decimal(10, 2)
  bonuses         Decimal  @db.Decimal(10, 2) @default(0)
  deductions      Decimal  @db.Decimal(10, 2) @default(0)
  netSalary       Decimal  @db.Decimal(10, 2)
  status          PayrollStatus @default(PENDING)
  processedAt     DateTime?

  employee        Employee @relation(fields: [employeeId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([employeeId, period])
  @@index([period])
  @@index([status])
}

enum PayrollStatus {
  PENDING
  PROCESSED
  PAID
}
```

### 11. Migration Best Practices

**Safe Migrations:**
```prisma
// ✅ Safe: Adding nullable field
model Employee {
  middleName String?  // Can add without data migration
}

// ✅ Safe: Adding new table
model NewFeature {
  id String @id
}

// ⚠️  Careful: Adding required field
model Employee {
  status Status @default(ACTIVE)  // Needs default value
}

// ❌ Dangerous: Dropping field with data
model Employee {
  // middleName String  // Don't drop without backup
}
```

### 12. Query Optimization

**Use select to fetch only needed fields:**
```typescript
const employees = await prisma.employee.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    department: {
      select: {
        name: true
      }
    }
  }
});
```

**Pagination:**
```typescript
const employees = await prisma.employee.findMany({
  skip: page * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

**Batch Operations:**
```typescript
// Create many
await prisma.employee.createMany({
  data: employeesArray
});

// Update many
await prisma.employee.updateMany({
  where: { departmentId: 'dept-1' },
  data: { status: 'ACTIVE' }
});
```

## Resources

- Prisma schema: `server/prisma/schema.prisma`
- Migrations: `server/prisma/migrations/`
- Seed data: `server/prisma/seed.ts`
- Prisma docs: https://www.prisma.io/docs/
