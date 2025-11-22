# Backend Routes - API Endpoint Definitions

## Purpose

تعريف API endpoints لنظام Nexus HR. كل route file يحتوي على Express Router يربط HTTP methods (GET، POST، PUT، DELETE) بـ controller functions مع middleware للـ authentication وvalidation.

## Owned Scope

- **Route Definitions**: Express Router configuration لكل resource
- **Middleware Chaining**: تطبيق auth، validation، rate limiting
- **HTTP Method Mapping**: ربط endpoints بـ controllers
- **URL Structure**: تنظيم API paths (`/api/<resource>`)

## Key Files & Entry Points

### Route Files
- **`authRoutes.ts`** - `/api/auth/*` (login، register، profile، logout)
- **`employeeRoutes.ts`** - `/api/employees/*` (CRUD operations)
- **`attendanceRoutes.ts`** - `/api/attendance/*` (clock-in/out، records، stats)
- **`performanceRoutes.ts`** - `/api/performance/*` (reviews، goals، feedback)
- **`documentRoutes.ts`** - `/api/documents/*` (document management)
- **`leaveRoutes.ts`** - `/api/leave/*` (leave requests، approvals، balance)
- **`payrollRoutes.ts`** - `/api/payroll/*` (payroll records، generation)
- **`onboardingRoutes.ts`** - `/api/onboarding/*` (tasks، checklists، progress)
- **`assetRoutes.ts`** - `/api/assets/*` (assets، assignments، categories)

### Registration في `src/index.ts`
```typescript
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
// ...etc
```

## Dependencies & Interfaces

### Imported من Modules أخرى
- **Controllers**: `../controllers/<resource>Controller` - Business logic handlers
- **Middleware**: 
  - `../middleware/auth` - `authenticate`, `requireRole()`
  - `../middleware/validate` - `validate(schema)`
- **Validators**: `../validators/` - Zod schemas (optional في بعض routes)

### Express Router
```typescript
import { Router } from 'express';
const router = Router();
export default router;
```

## Local Rules / Patterns

### Route Structure Pattern
```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getAll, getOne, create, update, remove } from '../controllers/resourceController';

const router = Router();

// Public routes (no auth)
router.post('/register', create);

// Protected routes (all require authentication)
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, requireRole('ADMIN', 'HR'), create);
router.put('/:id', authenticate, requireRole('ADMIN', 'HR'), update);
router.delete('/:id', authenticate, requireRole('ADMIN'), remove);

export default router;
```

### Middleware Order
1. **Rate Limiting** (applied في `src/index.ts` globally)
2. **Authentication** - `authenticate` middleware
3. **Authorization** - `requireRole(...)` middleware
4. **Validation** - `validate(schema)` middleware
5. **Controller** - Business logic function

### RBAC في Routes
```typescript
// مثال من employeeRoutes.ts
router.post('/', authenticate, requireRole('ADMIN', 'HR'), createEmployee);
// فقط ADMIN وHR يمكنهم إنشاء موظفين
```

### Validation في Routes
```typescript
import { validate } from '../middleware/validate';
import { createEmployeeSchema } from '../validators/employeeValidators';

router.post('/', authenticate, validate(createEmployeeSchema), createEmployee);
```

## How to Run / Test

### Testing Routes Manually

```bash
# 1. تشغيل Backend
cd server && npm run dev

# 2. Test public endpoint
curl http://localhost:3001/health

# 3. Login للحصول على token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexushr.com","password":"admin123"}' \
  | jq -r '.data.token')

# 4. Test protected endpoint
curl http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### Testing مع Postman/Thunder Client

1. **Login**: `POST /api/auth/login` → حفظ token
2. **Add Token**: في Headers: `Authorization: Bearer <token>`
3. **Test Endpoints**: `GET /api/employees`، `POST /api/attendance/clock-in`، etc.

## Common Tasks for Agents

### 1. إضافة Route جديد لـ Resource موجود

```typescript
// في employeeRoutes.ts
router.get('/:id/manager', authenticate, getEmployeeManager);
// ثم أضف controller function في employeeController.ts
```

### 2. إضافة Validation لـ Endpoint

```typescript
// 1. أنشئ schema في validators/
import { z } from 'zod';
export const updateEmployeeSchema = z.object({
  body: z.object({
    position: z.string().optional(),
    salary: z.number().positive().optional(),
  })
});

// 2. استخدم في route
import { validate } from '../middleware/validate';
router.put('/:id', authenticate, validate(updateEmployeeSchema), updateEmployee);
```

### 3. تقييد Endpoint لـ Role معين

```typescript
// فقط ADMIN يمكنه حذف موظفين
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteEmployee);

// HR وMANAGER يمكنهم عرض التقارير
router.get('/reports', authenticate, requireRole('HR', 'MANAGER'), getReports);
```

### 4. إضافة Resource جديد (مثلاً Training)

```bash
# 1. أنشئ route file
touch src/routes/trainingRoutes.ts

# 2. أضف routes
# import router, controllers, middleware
# router.get('/', authenticate, getAllTraining);
# ...

# 3. سجّل في src/index.ts
# import trainingRoutes from './routes/trainingRoutes';
# app.use('/api/training', trainingRoutes);
```

## Notes / Gotchas

### ⚠️ ملاحظات مهمة

1. **Middleware Order مهم جداً**
   - Authentication يجب أن يكون **قبل** Authorization
   - Validation يجب أن تكون **قبل** Controller
   - ❌ `router.post('/', validate(...), authenticate, create)` - خطأ!
   - ✅ `router.post('/', authenticate, validate(...), create)` - صحيح

2. **Route Parameters**
   ```typescript
   router.get('/:id', getOne);  // req.params.id
   router.get('/', getAll);     // req.query.page, req.query.limit
   ```

3. **لا تضع Business Logic في Routes**
   - Routes فقط للـ routing
   - Logic يجب أن يكون في Controllers
   - ❌ `router.get('/', async (req, res) => { /* logic here */ })`
   - ✅ `router.get('/', authenticate, controllerFunction)`

4. **CORS Issues**
   - CORS يُطبّق globally في `src/index.ts`
   - إذا واجهت CORS errors، تحقق من `CORS_ORIGIN` في `.env`

### 📝 Route Conventions

- **GET** - Retrieve resource(s)
- **POST** - Create new resource
- **PUT** - Update existing resource (full replacement)
- **PATCH** - Partial update (نستخدم PUT بدلاً منها حالياً)
- **DELETE** - Remove resource

### URL Patterns
- **Collection**: `/api/employees` (GET all، POST create)
- **Single Item**: `/api/employees/:id` (GET one، PUT update، DELETE)
- **Nested**: `/api/employees/:id/attendance` (GET employee's attendance)
- **Actions**: `/api/attendance/clock-in` (POST action)

### 📚 مراجع

- **Controllers**: `../controllers/agents.md`
- **Middleware**: `../middleware/agents.md`
- **API Documentation**: `../../docs/API.md`
