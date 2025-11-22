# Backend Middleware - Authentication & Validation

## Purpose

Express middleware functions للـ authentication، authorization (RBAC)، input validation، وerror handling. تُطبّق قبل controllers لتأمين endpoints والتحقق من صحة البيانات.

## Owned Scope

- **Authentication**: JWT token verification
- **Authorization (RBAC)**: Role-Based Access Control
- **Validation**: Zod schema validation wrapper
- **Error Handling**: Centralized error handler
- **Request Processing**: Modify req/res objects

## Key Files & Entry Points

### Middleware Files
- **`auth.ts`** - Authentication وauthorization functions:
  - `authenticate` - JWT verification
  - `authorize(...roles)` - RBAC (Role-Based Access Control)
  - `authorizeOwnerOrAdmin` - Resource ownership check
  - `hasPermission(...permissions)` - Fine-grained permissions
  
- **`validate.ts`** - Zod schema validation wrapper:
  - `validate(schema)` - Validates req.body/params/query
  
- **`errorHandler.ts`** - Global error handler:
  - `errorHandler(err, req, res, next)` - Catches all errors

### TypeScript Interfaces
```typescript
// في auth.ts
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
```

## Dependencies & Interfaces

### External Libraries
- **jsonwebtoken**: JWT verification (`jwt.verify()`)
- **zod**: Schema validation
- **express**: Request، Response، NextFunction types

### Environment Variables
- **`JWT_SECRET`**: Secret key لـ JWT verification (من `config/env.ts`)
- **`JWT_EXPIRES_IN`**: Token expiration time (default: 7d)

## Local Rules / Patterns

### Authentication Middleware
```typescript
import { authenticate } from './middleware/auth';

router.get('/protected', authenticate, controller);
// req.user will contain { id, email, role }
```

**Flow:**
1. Extract token من `Authorization: Bearer <token>` header
2. Verify token باستخدام `JWT_SECRET`
3. Decode payload وأضفه إلى `req.user`
4. إذا invalid/missing token → رجّع 401 Unauthorized
5. إذا valid → call `next()`

### Authorization (RBAC) Middleware
```typescript
import { authorize } from './middleware/auth';

// فقط ADMIN وHR
router.post('/employees', authenticate, authorize('ADMIN', 'HR'), createEmployee);

// فقط ADMIN
router.delete('/employees/:id', authenticate, authorize('ADMIN'), deleteEmployee);
```

**Roles Available:**
- `ADMIN` - Full access
- `HR` - HR operations
- `MANAGER` - Team management
- `EMPLOYEE` - Basic access

### Resource Ownership Check
```typescript
import { authorizeOwnerOrAdmin } from './middleware/auth';

// User يمكنه فقط access his own profile أو إذا كان ADMIN/HR
router.get('/employees/:employeeId/profile', 
  authenticate, 
  authorizeOwnerOrAdmin('employeeId'), 
  getProfile
);
```

### Validation Middleware
```typescript
import { validate } from './middleware/validate';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    email: z.string().email(),
    salary: z.number().positive().optional()
  })
});

router.post('/employees', 
  authenticate, 
  validate(createEmployeeSchema), 
  createEmployee
);
```

**Schema Structure:**
```typescript
z.object({
  body: z.object({ ... }),      // validates req.body
  params: z.object({ ... }),     // validates req.params
  query: z.object({ ... })       // validates req.query
})
```

### Error Handler
```typescript
// في src/index.ts (آخر middleware)
app.use(errorHandler);

// Usage في controller:
throw new Error('Something went wrong'); // سيُلتقط بواسطة errorHandler
```

## How to Run / Test

### Testing Authentication

```bash
# 1. Login للحصول على token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexushr.com","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Test protected endpoint
curl http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN"

# 3. Test without token (should return 401)
curl http://localhost:3001/api/employees
```

### Testing Authorization

```bash
# Login as EMPLOYEE
TOKEN_EMP=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@nexushr.com","password":"password123"}' \
  | jq -r '.data.token')

# Try to create employee (should return 403 Forbidden)
curl -X POST http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN_EMP" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"test@test.com"}'
```

### Testing Validation

```bash
# Invalid email (should return 400)
curl -X POST http://localhost:3001/api/employees \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"invalid-email"}'
```

## Common Tasks for Agents

### 1. إضافة Permission جديد

```typescript
// في auth.ts
export const canManagePayroll = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
    return next();
  }
  
  return res.status(403).json({ error: 'Insufficient permissions' });
};

// في route
router.get('/payroll', authenticate, canManagePayroll, getPayroll);
```

### 2. إضافة Custom Validation

```typescript
// في validators/customValidators.ts
import { z } from 'zod';

export const phoneNumberValidator = z.string().regex(/^\+?[1-9]\d{1,14}$/);

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    phone: phoneNumberValidator.optional()
  })
});
```

### 3. Conditional Authorization

```typescript
// مثال: MANAGER يمكنه فقط access his team
export const authorizeManagerOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
    return next();
  }
  
  if (req.user.role === 'MANAGER') {
    // Check if employee belongs to manager's team
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id }
    });
    
    if (employee?.manager === req.user.id) {
      return next();
    }
  }
  
  return res.status(403).json({ error: 'Insufficient permissions' });
};
```

### 4. Rate Limiting Middleware (Already في index.ts)

```typescript
// في src/index.ts
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // 100 requests
  message: 'Too many requests'
});

app.use('/api/', apiLimiter);
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **"Authentication required" على كل request**
   - تحقق من JWT_SECRET في `.env`
   - تأكد من Frontend يرسل `Authorization: Bearer <token>`
   - راجع token expiration (`JWT_EXPIRES_IN`)

2. **"Insufficient permissions" رغم أن الـ role صحيح**
   - تحقق من order: `authenticate` يجب أن يكون **قبل** `authorize`
   - تأكد من role name مطابق (`'ADMIN'` not `'admin'`)

3. **Validation errors غير واضحة**
   ```typescript
   // في validate.ts، أضف error formatting
   const result = schema.safeParse(req);
   if (!result.success) {
     return res.status(400).json({
       status: 'error',
       errors: result.error.flatten()  // Better error format
     });
   }
   ```

4. **req.user undefined في controller**
   - تأكد من استخدام `AuthRequest` type:
   ```typescript
   import { AuthRequest } from '../middleware/auth';
   export const myController = (req: AuthRequest, res: Response) => {
     const userId = req.user.id; // ✅ TypeScript safe
   };
   ```

### 📝 Best Practices

- **دائماً** استخدم `authenticate` قبل أي protected route
- **استخدم** `authorize()` للـ role-based protection
- **لا تضع** business logic في middleware (فقط checks)
- **استخدم** Zod للـ validation (type-safe)
- **اتبع** principle of least privilege (أقل permissions ممكنة)
- **log** authentication failures للـ security monitoring

### Middleware Order في Routes
```typescript
// ✅ Correct order
router.post('/resource',
  authenticate,        // 1. Check if user logged in
  authorize('ADMIN'),  // 2. Check if user has role
  validate(schema),    // 3. Validate input
  controller          // 4. Execute business logic
);

// ❌ Wrong order
router.post('/resource',
  validate(schema),    // قبل auth؟ security issue!
  authorize('ADMIN'),  // قبل authenticate؟ سيفشل!
  authenticate,
  controller
);
```

### 🔒 Security Checklist

- ✅ JWT_SECRET يجب أن يكون complex (32+ characters)
- ✅ Tokens تنتهي (JWT_EXPIRES_IN)
- ✅ Validate inputs قبل database operations
- ✅ Don't expose sensitive errors للـ users
- ✅ Use HTTPS في production
- ✅ Implement rate limiting

### 📚 مراجع

- **Routes**: `../routes/agents.md`
- **Controllers**: `../controllers/agents.md`
- **Config**: `../config/env.ts`
- **Security Guide**: `../../../docs/SECURITY.md`
