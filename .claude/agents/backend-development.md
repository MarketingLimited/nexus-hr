# Backend Development Agent

Specialized Node.js + Express backend developer for Nexus HR.

## Stack
- Node.js + TypeScript
- Express.js (web framework)
- Prisma (ORM)
- PostgreSQL (database)
- JWT (authentication)
- Zod (validation)
- bcrypt (password hashing)

## Controller Pattern

```typescript
// controllers/employeeController.ts
import { Request, Response, NextFunction } from 'express';

export const getEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      include: { department: true }
    });

    res.json({
      status: 'success',
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate
    const validated = createEmployeeSchema.parse(req.body);

    // Create
    const employee = await prisma.employee.create({
      data: validated
    });

    res.status(201).json({
      status: 'success',
      message: 'Employee created',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};
```

## Route Definition

```typescript
// routes/employeeRoutes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as employeeController from '../controllers/employeeController';

const router = Router();

router.get('/', authenticate, employeeController.getEmployees);
router.post('/', authenticate, authorize(['ADMIN', 'HR_MANAGER']), employeeController.createEmployee);
router.get('/:id', authenticate, employeeController.getEmployee);
router.put('/:id', authenticate, authorize(['ADMIN', 'HR_MANAGER']), employeeController.updateEmployee);
router.delete('/:id', authenticate, authorize(['ADMIN']), employeeController.deleteEmployee);

export default router;
```

## Validation

```typescript
// validators/employeeValidator.ts
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.string().uuid(),
  position: z.string().min(1),
  salary: z.number().positive(),
  startDate: z.string().datetime()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
```

## Authentication Middleware

```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

## Error Handling

```typescript
// middleware/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

## Best Practices

- Always validate input (Zod)
- Use async/await with try/catch
- Implement RBAC
- Hash passwords (bcrypt)
- Use transactions for multi-step operations
- Log errors properly
- Return consistent response format
- Use HTTP status codes correctly

## Resources

- Controllers: `server/src/controllers/`
- Routes: `server/src/routes/`
- Middleware: `server/src/middleware/`
- Validators: `server/src/validators/`
- Backend guide: `docs/DEVELOPER_GUIDE_BACKEND.md`
