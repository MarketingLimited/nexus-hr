# Backend API - Nexus HR Server

## Purpose

REST API مبني على Express.js يوفر خدمات شاملة لإدارة الموارد البشرية (HR Management System). يتعامل مع Authentication، CRUD operations للموظفين، الحضور، التقييمات، الإجازات، الرواتب، والوثائق مع قاعدة بيانات PostgreSQL.

## Owned Scope

- **API Routes**: `/api/*` endpoints في `src/routes/`
- **Controllers**: Business logic في `src/controllers/`
- **Middleware**: Auth، validation، error handling في `src/middleware/`
- **Database**: Prisma ORM مع PostgreSQL schema في `prisma/`
- **Validators**: Zod schemas للـ input validation في `src/validators/`
- **Utils**: Helper functions في `src/utils/`
- **Config**: Environment وconfiguration في `src/config/`

## Key Files & Entry Points

### Core Files
- **`src/index.ts`** - Express server initialization وroute mounting
- **`package.json`** - Dependencies: Express 4.21, Prisma 5.22, JWT 9.0, bcrypt 5.1
- **`tsconfig.json`** - TypeScript configuration
- **`.env.example`** - Environment variables template

### Routes (API Endpoints)
- **`src/routes/authRoutes.ts`** - `/api/auth/*` (login, register, profile)
- **`src/routes/employeeRoutes.ts`** - `/api/employees/*` (CRUD operations)
- **`src/routes/attendanceRoutes.ts`** - `/api/attendance/*` (clock-in/out, stats)
- **`src/routes/performanceRoutes.ts`** - `/api/performance/*` (reviews, goals, feedback)
- **`src/routes/documentRoutes.ts`** - `/api/documents/*` (document management)
- **`src/routes/leaveRoutes.ts`** - `/api/leave/*` (leave requests, approvals)
- **`src/routes/payrollRoutes.ts`** - `/api/payroll/*` (payroll records)
- **`src/routes/onboardingRoutes.ts`** - `/api/onboarding/*` (onboarding tasks)
- **`src/routes/assetRoutes.ts`** - `/api/assets/*` (asset management)

### Controllers (Business Logic)
- **`src/controllers/authController.ts`** - User registration، login، JWT generation
- **`src/controllers/employeeController.ts`** - Employee CRUD، search، filtering
- **`src/controllers/attendanceController.ts`** - Attendance tracking، statistics
- **`src/controllers/performanceController.ts`** - Reviews، goals، 360° feedback
- **`src/controllers/documentController.ts`** - Document storage metadata
- **`src/controllers/leaveController.ts`** - Leave management workflow
- **`src/controllers/payrollController.ts`** - Payroll processing
- **`src/controllers/onboardingController.ts`** - Onboarding checklists
- **`src/controllers/assetController.ts`** - Asset tracking

### Middleware
- **`src/middleware/auth.ts`** - JWT verification، RBAC (Role-Based Access Control)
- **`src/middleware/validate.ts`** - Zod schema validation wrapper
- **`src/middleware/errorHandler.ts`** - Centralized error handling

### Database
- **`prisma/schema.prisma`** - Database schema (12 models: User، Employee، AttendanceRecord، etc.)
- **`prisma/seed.ts`** - Sample data seeding script
- **`prisma/migrations/`** - Database migration history

### Configuration
- **`src/config/env.ts`** - Environment variables validation وexport

## Dependencies & Interfaces

### Database Connection
- **Prisma Client**: `@prisma/client` v5.22.0
- **Connection URL**: `DATABASE_URL` من `.env` (PostgreSQL)
- **Schema**: `prisma/schema.prisma`
- **Example**: `postgresql://postgres:password@localhost:5432/nexus_hr`

### Frontend Communication
- **CORS Origin**: `CORS_ORIGIN` من `.env` (default: `http://localhost:5173`)
- **Content Type**: JSON (`application/json`)
- **Authentication**: JWT token في `Authorization: Bearer <token>` header
- **Response Format**: 
  ```json
  {
    "status": "success" | "error",
    "data": { ... },
    "message": "..."
  }
  ```

### External Libraries
- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting للـ DoS protection
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **zod**: Runtime validation
- **multer**: File uploads (documents)

### Port Configuration
- **Default Port**: `3001` (من `PORT` env variable)
- **Health Check**: `GET /health` → `{ status: 'ok' }`

## Local Rules / Patterns

### Architecture Pattern
- **Layered Architecture**: Routes → Controllers → Prisma (ORM)
- **No Service Layer**: Business logic في Controllers مباشرة
- **RESTful Design**: Resource-based URLs (`/api/<resource>`)

### Authentication Flow
1. User يرسل `POST /api/auth/login` مع email/password
2. Controller يتحقق من credentials عبر bcrypt
3. JWT يُنشأ مع payload: `{ userId, email, role }`
4. Frontend يحفظ token ويرسله في `Authorization` header
5. Middleware `authenticate` يفك token لكل protected route

### RBAC (Role-Based Access Control)
- **4 Roles**: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE` (في `prisma/schema.prisma`)
- **Middleware**: `requireRole(...roles)` في `src/middleware/auth.ts`
- **Example**: 
  ```typescript
  router.post('/employees', authenticate, requireRole('ADMIN', 'HR'), createEmployee);
  ```

### Error Handling
- **Centralized**: كل الأخطاء تمر عبر `src/middleware/errorHandler.ts`
- **HTTP Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)
- **Error Format**: `{ status: 'error', message: '...' }`

### Validation Pattern
- **Zod Schemas**: في `src/validators/` لكل endpoint
- **Middleware**: `validate(schema)` يُطبّق قبل controller
- **Example**:
  ```typescript
  router.post('/employees', authenticate, validate(createEmployeeSchema), createEmployee);
  ```

### Database Queries
- **Prisma ORM**: جميع الاستعلامات عبر Prisma Client
- **No Raw SQL**: استخدم Prisma methods (`findMany`, `create`, `update`, `delete`)
- **Transactions**: استخدم `prisma.$transaction([...])` للعمليات المركبة
- **Soft Deletes**: استخدم `status: 'TERMINATED'` بدلاً من `delete()` للموظفين

### Testing
- **Framework**: Vitest v4.0.12
- **Coverage**: `@vitest/coverage-v8`
- **Test Files**: `*.test.ts` بجانب الملف الأصلي
- **Example**: `src/controllers/authController.test.ts`

## How to Run / Test

### Initial Setup
```bash
cd server

# 1. تثبيت Dependencies
npm install

# 2. إعداد Environment
cp .env.example .env
# عدّل DATABASE_URL، JWT_SECRET، CORS_ORIGIN

# 3. Database Setup
npm run prisma:generate    # توليد Prisma Client
npm run prisma:migrate     # تطبيق migrations
npm run prisma:seed        # إضافة بيانات تجريبية
```

### Development
```bash
# تشغيل مع hot reload
npm run dev

# Server سيعمل على http://localhost:3001
# Test: curl http://localhost:3001/health
```

### Production Build
```bash
npm run build       # تحويل TypeScript → JavaScript في dist/
npm start           # تشغيل dist/index.js
```

### Database Management
```bash
# فتح Prisma Studio (GUI للـ database)
npm run prisma:studio
# يفتح على http://localhost:5555

# إنشاء migration جديد
npx prisma migrate dev --name add_new_field

# تطبيق migrations في production
npx prisma migrate deploy

# إعادة تعيين database (⚠️ يحذف كل البيانات)
npx prisma migrate reset
```

### Testing
```bash
# تشغيل كل الـ tests
npm test

# تشغيل مع watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### API Testing (Manual)
```bash
# 1. Login للحصول على token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexushr.com","password":"admin123"}'

# 2. استخدم token للـ authenticated requests
TOKEN="eyJhbGc..."
curl http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### Default Test Accounts (After Seeding)
| Email | Password | Role |
|-------|----------|------|
| admin@nexushr.com | admin123 | ADMIN |
| john.doe@nexushr.com | password123 | EMPLOYEE |
| jane.smith@nexushr.com | password123 | EMPLOYEE (HR) |

## Common Tasks for Agents

### 1. إضافة API Endpoint جديد

**مثال: إضافة `/api/training` endpoint**

```bash
# 1. أضف route file
touch src/routes/trainingRoutes.ts

# 2. أضف controller
touch src/controllers/trainingController.ts

# 3. (اختياري) أضف validation
touch src/validators/trainingValidators.ts

# 4. سجّل route في src/index.ts
# أضف: import trainingRoutes from './routes/trainingRoutes';
# أضف: app.use('/api/training', trainingRoutes);

# 5. إذا احتجت model جديد، عدّل prisma/schema.prisma
# ثم شغّل: npx prisma migrate dev --name add_training_model
```

### 2. إضافة Field جديد لجدول موجود

**مثال: إضافة `middleName` لجدول Employee**

```bash
# 1. عدّل prisma/schema.prisma
# أضف: middleName String? في model Employee

# 2. أنشئ migration
npx prisma migrate dev --name add_middle_name

# 3. حدّث controller/validator ليستخدم الحقل الجديد
```

### 3. إصلاح Authentication Bug

```bash
# 1. تحقق من JWT_SECRET في .env
# 2. راجع src/middleware/auth.ts → authenticate function
# 3. تأكد من Frontend يرسل header صحيح: 
#    Authorization: Bearer <token>
# 4. تحقق من CORS settings في src/index.ts
```

### 4. تغيير RBAC Permissions

**مثال: السماح لـ MANAGER بإنشاء employees**

```typescript
// في src/routes/employeeRoutes.ts
// عدّل من:
router.post('/', authenticate, requireRole('ADMIN', 'HR'), createEmployee);
// إلى:
router.post('/', authenticate, requireRole('ADMIN', 'HR', 'MANAGER'), createEmployee);
```

### 5. Debug Database Issue

```bash
# 1. افتح Prisma Studio
npm run prisma:studio

# 2. تحقق من البيانات manually
# 3. راجع schema في prisma/schema.prisma
# 4. اعرض logs: console.log في controller
# 5. إذا كان migration issue، راجع: prisma/migrations/
```

### 6. إضافة Rate Limiting لـ Endpoint معين

```typescript
// في src/index.ts
import rateLimit from 'express-rate-limit';

const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 دقيقة
  max: 10,                   // 10 requests كحد أقصى
});

app.use('/api/sensitive-endpoint', customLimiter);
```

### 7. كتابة Test لـ Controller

```typescript
// src/controllers/myController.test.ts
import { describe, it, expect } from 'vitest';
import { myController } from './myController';

describe('myController', () => {
  it('should return success', async () => {
    // Mock request/response
    const req = { body: { ... } };
    const res = { json: vi.fn(), status: vi.fn() };
    
    await myController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **"Prisma Client not generated"**
   ```bash
   cd server
   npm run prisma:generate
   ```

2. **"Cannot connect to database"**
   - تأكد من PostgreSQL يعمل: `docker-compose up -d postgres`
   - تحقق من `DATABASE_URL` في `.env`
   - Test connection: `psql $DATABASE_URL`

3. **"JWT malformed" أو "Invalid token"**
   - تأكد من `JWT_SECRET` مطابق بين .env وtoken generation
   - تحقق من Frontend يرسل header صحيح
   - تأكد من token لم ينتهي (`JWT_EXPIRES_IN=7d`)

4. **CORS Errors من Frontend**
   - عدّل `CORS_ORIGIN` في `server/.env` لتطابق frontend URL
   - Default: `http://localhost:5173`
   - تأكد من `credentials: true` في `src/index.ts`

5. **Rate Limit "Too many requests"**
   - `/api/auth/login` limited لـ 5 requests/15min
   - General API limited لـ 100 requests/15min
   - للتطوير، عطّل rate limiting مؤقتاً في `src/index.ts`

6. **Port 3001 Already in Use**
   ```bash
   lsof -ti:3001 | xargs kill
   # أو غيّر PORT في .env
   ```

### 📝 Best Practices

- **دائماً** استخدم Prisma بدلاً من raw SQL
- **لا تحفظ** passwords بدون hashing (استخدم bcrypt)
- **استخدم** Zod validation لكل input
- **اتبع** RESTful conventions (`GET /resource`, `POST /resource`, `PUT /resource/:id`)
- **لا تعرض** sensitive data في error messages
- **استخدم** transactions للعمليات المركبة
- **اكتب** tests لكل endpoint جديد
- **عدّل** `docs/API.md` عند إضافة endpoints

### 🔒 Security Checklist

- ✅ Passwords hashed بـ bcrypt (cost factor: 10)
- ✅ JWT tokens مع expiration
- ✅ Rate limiting على login endpoints
- ✅ Helmet middleware للـ security headers
- ✅ Input validation بـ Zod
- ✅ SQL injection protection بـ Prisma
- ✅ CORS configured صحيح
- ⚠️ **لا تنسى** تغيير `JWT_SECRET` في production
- ⚠️ **لا تنسى** استخدام HTTPS في production

### 📚 Related Documentation

- **API Endpoints**: `server/README.md` أو `docs/API.md`
- **Database Schema**: `prisma/schema.prisma`
- **Backend Dev Guide**: `docs/DEVELOPER_GUIDE_BACKEND.md`
- **Security Guide**: `docs/SECURITY.md`
- **Deployment**: `docs/DEPLOYMENT.md`

### 🗺️ Sub-Modules

| Module | Path | Purpose | Agent File |
|--------|------|---------|------------|
| **Routes** | `src/routes/` | API endpoint definitions | `src/routes/agents.md` |
| **Controllers** | `src/controllers/` | Business logic handlers | `src/controllers/agents.md` |
| **Middleware** | `src/middleware/` | Auth، validation، errors | `src/middleware/agents.md` |
| **Prisma** | `prisma/` | Database schema & migrations | `prisma/agents.md` |
