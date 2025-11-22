# Backend Controllers - Business Logic Handlers

## Purpose

معالجة business logic لكل API endpoint. Controllers تستقبل HTTP requests، تتفاعل مع Prisma ORM للـ database operations، وترجع responses منسقة.

## Owned Scope

- **Request Handling**: استقبال وتحليل HTTP requests
- **Business Logic**: معالجة البيانات، حسابات، validations
- **Database Operations**: CRUD عبر Prisma Client
- **Response Formatting**: إرجاع JSON responses موحدة
- **Error Handling**: رمي أخطاء واضحة للـ error handler middleware

## Key Files & Entry Points

### Controller Files
- **`authController.ts`** - User registration، login، JWT generation، profile
- **`employeeController.ts`** - Employee CRUD، search، filtering، pagination
- **`attendanceController.ts`** - Clock-in/out، attendance records، statistics، reports
- **`performanceController.ts`** - Reviews، goals، 360° feedback، analytics
- **`documentController.ts`** - Document metadata management
- **`leaveController.ts`** - Leave requests، approvals، balance calculations
- **`payrollController.ts`** - Payroll records، salary calculations
- **`onboardingController.ts`** - Onboarding tasks، checklists، progress tracking
- **`assetController.ts`** - Asset management، assignments، tracking

### Test Files
- **`authController.test.ts`** - Auth controller tests
- **`employeeController.test.ts`** - Employee controller tests
- **`attendanceController.test.ts`** - Attendance controller tests
- **`leaveController.test.ts`** - Leave controller tests

## Dependencies & Interfaces

### Prisma Client
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Example usage
const employees = await prisma.employee.findMany();
```

### External Libraries
- **bcrypt**: Password hashing في `authController`
- **jsonwebtoken**: JWT generation في `authController`
- **zod**: Runtime validation (optional، أغلب validation في middleware)

### Request/Response Types
```typescript
import { Request, Response } from 'express';

// Request يحتوي على:
// - req.body: JSON body
// - req.params: URL parameters (:id)
// - req.query: Query strings (?page=1)
// - req.user: User object (من authenticate middleware)
```

## Local Rules / Patterns

### Controller Function Pattern
```typescript
export const getResource = async (req: Request, res: Response) => {
  try {
    const data = await prisma.resource.findMany();
    
    res.status(200).json({
      status: 'success',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch resource'
    });
  }
};
```

### Response Format (Standardized)
```json
{
  "status": "success" | "error",
  "data": { ... },           // للـ successful responses
  "message": "..."           // للـ errors أو success messages
}
```

### HTTP Status Codes
- **200**: Success (GET، PUT)
- **201**: Created (POST)
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (no token)
- **403**: Forbidden (wrong role)
- **404**: Not Found
- **500**: Internal Server Error

### Authentication في Controllers
```typescript
// User object متاح من authenticate middleware
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user.userId; // من JWT payload
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // ...
};
```

### Pagination Pattern
```typescript
export const getAll = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    prisma.resource.findMany({ skip, take: limit }),
    prisma.resource.count()
  ]);
  
  res.json({
    status: 'success',
    data: {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};
```

### Search & Filter Pattern
```typescript
// في employeeController.ts
const searchTerm = req.query.search as string;
const department = req.query.department as string;

const where = {
  ...(searchTerm && {
    OR: [
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }),
  ...(department && { department })
};

const employees = await prisma.employee.findMany({ where });
```

## How to Run / Test

### Manual Testing

```bash
# 1. تشغيل Backend
cd server && npm run dev

# 2. Test controller via curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexushr.com","password":"admin123"}'
```

### Unit Testing

```bash
# تشغيل tests
npm test

# Watch mode
npm run test:watch

# Test specific file
npm test authController.test.ts
```

### Example Test
```typescript
import { describe, it, expect, vi } from 'vitest';
import { login } from './authController';

describe('authController - login', () => {
  it('should return token on valid credentials', async () => {
    const req = { body: { email: 'test@test.com', password: 'pass' } };
    const res = { 
      status: vi.fn().mockReturnThis(),
      json: vi.fn() 
    };
    
    await login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });
});
```

## Common Tasks for Agents

### 1. إضافة Controller Function جديد

```typescript
// في employeeController.ts
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.employee.aggregate({
      _count: { id: true },
      _avg: { salary: true }
    });
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stats'
    });
  }
};

// ثم سجّله في routes:
// router.get('/stats', authenticate, getEmployeeStats);
```

### 2. إضافة Search/Filter

```typescript
export const searchEmployees = async (req: Request, res: Response) => {
  const { search, department, status } = req.query;
  
  const where = {
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(department && { department }),
    ...(status && { status })
  };
  
  const employees = await prisma.employee.findMany({ where });
  res.json({ status: 'success', data: employees });
};
```

### 3. إضافة Validation في Controller

```typescript
export const createEmployee = async (req: Request, res: Response) => {
  // Validation (إذا لم تكن في middleware)
  if (!req.body.email || !req.body.firstName) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and firstName are required'
    });
  }
  
  // Check for duplicates
  const existing = await prisma.employee.findUnique({
    where: { email: req.body.email }
  });
  
  if (existing) {
    return res.status(400).json({
      status: 'error',
      message: 'Employee with this email already exists'
    });
  }
  
  // Create
  const employee = await prisma.employee.create({ data: req.body });
  res.status(201).json({ status: 'success', data: employee });
};
```

### 4. استخدام Transactions

```typescript
// مثال: إنشاء موظف + user account في نفس الوقت
export const createEmployeeWithUser = async (req: Request, res: Response) => {
  const { user, employee } = req.body;
  
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({ data: user });
    const newEmployee = await tx.employee.create({
      data: { ...employee, userId: newUser.id }
    });
    return { user: newUser, employee: newEmployee };
  });
  
  res.status(201).json({ status: 'success', data: result });
};
```

### 5. حساب Statistics/Aggregations

```typescript
// في attendanceController.ts
export const getAttendanceStats = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = await prisma.attendanceRecord.groupBy({
    by: ['status'],
    where: { date: { gte: today } },
    _count: { id: true }
  });
  
  res.json({ status: 'success', data: stats });
};
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **Prisma Client لم يُولّد**
   ```bash
   cd server && npm run prisma:generate
   ```

2. **Foreign Key Constraint Errors**
   - تأكد من relations موجودة قبل create
   - استخدم transactions للعمليات المركبة
   - مثلاً: user يجب أن يُنشأ قبل employee (لأن employee.userId foreign key)

3. **Unique Constraint Violations**
   ```typescript
   // تحقق قبل create
   const existing = await prisma.employee.findUnique({
     where: { email: newEmail }
   });
   if (existing) throw new Error('Already exists');
   ```

4. **N+1 Query Problem**
   ```typescript
   // ❌ Bad: N+1 queries
   const employees = await prisma.employee.findMany();
   for (const emp of employees) {
     emp.user = await prisma.user.findUnique({ where: { id: emp.userId } });
   }
   
   // ✅ Good: Single query with include
   const employees = await prisma.employee.findMany({
     include: { user: true }
   });
   ```

5. **Password Hashing في Auth**
   ```typescript
   import bcrypt from 'bcrypt';
   
   // Always hash passwords
   const hashedPassword = await bcrypt.hash(password, 10);
   
   // Never return passwords in response
   const { password, ...userWithoutPassword } = user;
   res.json({ data: userWithoutPassword });
   ```

### 📝 Best Practices

- **دائماً** استخدم try-catch في controllers
- **لا ترجع** sensitive data (passwords، JWT secrets)
- **استخدم** Prisma transactions للعمليات المركبة
- **validate** inputs (في middleware أو controller)
- **استخدم** `include` للـ relations بدلاً من multiple queries
- **لا تكتب** raw SQL إلا للضرورة
- **اتبع** response format الموحد
- **اكتب** tests لكل controller function

### 🔒 Security Checklist

- ✅ Hash passwords بـ bcrypt
- ✅ لا ترجع passwords في responses
- ✅ Validate user permissions (via req.user.role)
- ✅ Sanitize inputs (Prisma يمنع SQL injection تلقائياً)
- ✅ استخدم rate limiting (applied في routes)

### 📚 مراجع

- **Routes**: `../routes/agents.md`
- **Prisma Schema**: `../../prisma/schema.prisma`
- **Middleware**: `../middleware/agents.md`
- **API Docs**: `../../../docs/API.md`
