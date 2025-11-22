# Prisma - Database Schema & ORM

## Purpose

إدارة database schema، migrations، وPrisma Client generation لـ PostgreSQL database. يوفر type-safe ORM للتفاعل مع قاعدة البيانات.

## Owned Scope

- **Schema Definition**: `schema.prisma` - تعريف Models، Relations، Enums
- **Migrations**: `migrations/` - Database migration history
- **Seeding**: `seed.ts` - Sample data generation
- **Prisma Client**: Generated TypeScript client للـ database operations

## Key Files & Entry Points

### Core Files
- **`schema.prisma`** - Database schema definition (12 models)
- **`seed.ts`** - Database seeding script (sample data)
- **`migrations/`** - Migration history folder

### Database Models (12 total)
1. **User** - Authentication (email، password، role)
2. **Employee** - Employee records
3. **AttendanceRecord** - Daily attendance
4. **PerformanceReview** - Performance reviews
5. **Goal** - Employee goals
6. **Feedback** - 360° feedback
7. **Document** - Document metadata
8. **LeaveRequest** - Leave management
9. **PayrollRecord** - Payroll data
10. **OnboardingTask** - Onboarding checklists
11. **Asset** - Company assets
12. **AssetAssignment** - Asset allocations

### Enums
- **Role**: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`
- **EmployeeStatus**: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`
- **AttendanceStatus**: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `REMOTE`
- **LeaveStatus**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

## Dependencies & Interfaces

### Prisma Client Generation
```bash
npm run prisma:generate
# Generates: node_modules/.prisma/client
```

### Usage في Controllers
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Type-safe queries
const employees = await prisma.employee.findMany();
const user = await prisma.user.create({ data: { ... } });
```

### Database Connection
- **Database**: PostgreSQL 16
- **Connection String**: `DATABASE_URL` من `.env`
- **Format**: `postgresql://user:password@host:port/database`
- **Example**: `postgresql://postgres:postgres@localhost:5432/nexus_hr`

## Local Rules / Patterns

### Schema Structure
```prisma
model Employee {
  id String @id @default(uuid())
  userId String @unique
  firstName String
  // ... fields
  
  user User @relation(fields: [userId], references: [id])
  attendanceRecords AttendanceRecord[]
  // ... relations
  
  @@map("employees")  // Table name في database
}
```

### Relations
- **One-to-One**: `User` ↔ `Employee`
- **One-to-Many**: `Employee` → `AttendanceRecord[]`
- **Many-to-Many**: (future: Employee ↔ Training عبر join table)

### Cascade Deletes
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
// إذا User حُذف، Employee يُحذف تلقائياً
```

### Unique Constraints
```prisma
@@unique([employeeId, date])  // Composite unique
email String @unique          // Single unique
```

## How to Run / Test

### Initial Setup
```bash
cd server

# 1. Install dependencies
npm install

# 2. Set DATABASE_URL في .env
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_hr"' >> .env

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed database
npm run prisma:seed
```

### Database Management

```bash
# Open Prisma Studio (GUI)
npm run prisma:studio
# يفتح http://localhost:5555

# Create new migration
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Generate Prisma Client (بعد تعديل schema)
npm run prisma:generate

# Format schema file
npx prisma format
```

### Testing Database Connection

```bash
# Test connection
npx prisma db push --skip-generate

# View database
psql $DATABASE_URL
```

## Common Tasks for Agents

### 1. إضافة Field جديد لـ Model موجود

```bash
# 1. عدّل schema.prisma
# model Employee {
#   ...
#   middleName String?  // إضافة field جديد
# }

# 2. أنشئ migration
npx prisma migrate dev --name add_middle_name

# 3. Generate Prisma Client
npm run prisma:generate

# 4. استخدم في controller
# const employee = await prisma.employee.create({
#   data: { ..., middleName: 'Ali' }
# });
```

### 2. إضافة Model جديد

```prisma
// في schema.prisma
model Training {
  id String @id @default(uuid())
  title String
  description String?
  startDate DateTime
  endDate DateTime
  employeeId String
  
  employee Employee @relation(fields: [employeeId], references: [id])
  
  @@map("trainings")
}

// أضف relation في Employee model
model Employee {
  // ... existing fields
  trainings Training[]
}
```

```bash
# بعد التعديل
npx prisma migrate dev --name add_training_model
npm run prisma:generate
```

### 3. إضافة Enum جديد

```prisma
// في schema.prisma
enum TrainingStatus {
  SCHEDULED
  ONGOING
  COMPLETED
  CANCELLED
}

model Training {
  status TrainingStatus @default(SCHEDULED)
}
```

### 4. تعديل Relation

```prisma
// مثال: إضافة Many-to-Many relation
model Employee {
  id String @id @default(uuid())
  skills Skill[]
}

model Skill {
  id String @id @default(uuid())
  name String
  employees Employee[]
}

// Prisma سينشئ join table تلقائياً
```

### 5. إضافة Index للأداء

```prisma
model Employee {
  // ... fields
  
  @@index([department])  // Index للبحث السريع
  @@index([status, department])  // Composite index
}
```

### 6. Seed Data جديد

```typescript
// في seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.employee.create({
    data: {
      firstName: 'Ahmed',
      lastName: 'Ali',
      email: 'ahmed@example.com',
      // ...
    }
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

```bash
npm run prisma:seed
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **"Prisma Client not generated"**
   ```bash
   npm run prisma:generate
   ```

2. **Migration Conflicts**
   ```bash
   # إذا كان conflict مع migrations
   npx prisma migrate resolve --rolled-back <migration-name>
   # أو reset كل شيء (⚠️ يحذف البيانات)
   npx prisma migrate reset
   ```

3. **Foreign Key Constraint Errors**
   - تأكد من parent record موجود قبل create child
   - استخدم `onDelete: Cascade` للـ automatic cleanup

4. **"Column does not exist" في Production**
   ```bash
   # تأكد من تطبيق migrations في production
   npx prisma migrate deploy
   ```

5. **Performance Issues**
   - أضف indexes: `@@index([field])`
   - استخدم `select` للـ specific fields بدلاً من fetch all
   - استخدم `include` بحذر (can cause N+1 queries)

### 📝 Best Practices

- **دائماً** generate Prisma Client بعد schema changes
- **استخدم** migrations (لا `db push` في production)
- **لا تعدّل** migrations بعد commit
- **استخدم** `onDelete: Cascade` للـ cleanup automation
- **أضف** indexes للـ frequently queried fields
- **استخدم** `@@map()` للـ table/column naming
- **اتبع** naming conventions: PascalCase للـ models، camelCase للـ fields

### Migration Workflow

```bash
# Development
npx prisma migrate dev --name descriptive_name
# - Creates migration
# - Applies to dev database
# - Generates Prisma Client

# Production
npx prisma migrate deploy
# - Applies pending migrations only
# - No client generation (use separate build step)
```

### Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const employees = await prisma.employee.findMany();
for (const emp of employees) {
  emp.user = await prisma.user.findUnique({ where: { id: emp.userId } });
}

// ✅ Good: Single query with include
const employees = await prisma.employee.findMany({
  include: { user: true }
});

// ✅ Better: Select only needed fields
const employees = await prisma.employee.findMany({
  select: {
    id: true,
    firstName: true,
    user: { select: { email: true } }
  }
});
```

### 🔒 Security Notes

- **لا تخزن** sensitive data unencrypted (passwords → use bcrypt)
- **استخدم** `@unique` للـ unique constraints
- **validate** data قبل Prisma calls
- **Prisma يمنع** SQL injection تلقائياً

### 📚 مراجع

- **Prisma Docs**: https://www.prisma.io/docs
- **Schema Reference**: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Controllers**: `../src/controllers/agents.md` - Usage examples
- **Backend Guide**: `../../docs/DEVELOPER_GUIDE_BACKEND.md`
