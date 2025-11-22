# Backend Developer Guide

**For**: Backend Developers working on the Nexus HR Node.js/Express API

This guide helps you understand, develop, and contribute to the Nexus HR backend codebase.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Database & Prisma](#database--prisma)
- [API Development](#api-development)
- [Authentication & Authorization](#authentication--authorization)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- npm 9+
- Basic knowledge of TypeScript, Express, and Prisma

### Setup

```bash
# Clone and navigate to backend
cd server

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

Server runs at `http://localhost:3001`

See [Getting Started Guide](./GETTING_STARTED.md) for detailed setup.

---

## Tech Stack

### Core

- **Node.js** - Runtime environment
- **Express.js 4.21** - Web framework
- **TypeScript 5.5** - Type safety

### Database

- **PostgreSQL 16** - Relational database
- **Prisma 5.22** - ORM and database toolkit

### Authentication & Security

- **JWT (jsonwebtoken 9.0)** - Token-based auth
- **bcrypt 5.1** - Password hashing
- **Helmet 8.1** - Security headers
- **express-rate-limit 8.2** - Rate limiting

### Validation

- **Zod 3.23** - Schema validation

### Testing

- **Vitest 4.0** - Test runner
- **Supertest** - HTTP assertions

---

## Project Structure

```
server/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.ts
│   │   ├── employeeController.ts
│   │   ├── attendanceController.ts
│   │   ├── performanceController.ts
│   │   ├── leaveController.ts
│   │   ├── payrollController.ts
│   │   ├── onboardingController.ts
│   │   ├── assetController.ts
│   │   └── documentController.ts
│   ├── routes/             # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── employeeRoutes.ts
│   │   └── ...
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication
│   │   ├── validate.ts     # Input validation
│   │   └── errorHandler.ts # Error handling
│   ├── validators/         # Zod schemas
│   │   └── schemas.ts
│   ├── utils/              # Utility functions
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── config/             # Configuration
│   │   └── database.ts     # Prisma client
│   └── index.ts            # Application entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration files
│   └── seed.ts             # Seed data
├── __tests__/              # Test files
├── .env.example            # Environment template
├── package.json
└── tsconfig.json
```

---

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start PostgreSQL
docker-compose up postgres

# Terminal 2: Start backend
cd server
npm run dev
```

### Available Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm test                 # Run tests
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run/create migrations
npm run prisma:seed      # Seed database
npm run lint             # Run ESLint (if configured)
```

### Environment Variables

Required in `server/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_hr?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Optional
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

---

## Database & Prisma

### Schema Definition

Edit `prisma/schema.prisma`:

```prisma
model Employee {
  id          String   @id @default(uuid())
  employeeId  String   @unique
  firstName   String
  lastName    String
  email       String   @unique
  phone       String?
  position    String
  department  String
  location    String?
  hireDate    DateTime
  salary      Float?
  status      String   @default("ACTIVE")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?  @unique

  manager     Employee?  @relation("EmployeeManager", fields: [managerId], references: [id])
  managerId   String?
  reports     Employee[] @relation("EmployeeManager")

  attendanceRecords   AttendanceRecord[]
  leaveRequests       LeaveRequest[]
  performanceReviews  PerformanceReview[]
  documents           Document[]

  @@index([department])
  @@index([status])
  @@index([email])
}
```

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only - deletes data!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Querying with Prisma

```typescript
import prisma from '../config/database';

// Find many
const employees = await prisma.employee.findMany({
  where: {
    department: 'Engineering',
    status: 'ACTIVE',
  },
  include: {
    user: true,
    manager: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  skip: 0,
  take: 50,
});

// Find one
const employee = await prisma.employee.findUnique({
  where: { id: employeeId },
  include: { user: true },
});

// Create
const newEmployee = await prisma.employee.create({
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    position: 'Developer',
    department: 'Engineering',
    hireDate: new Date(),
  },
});

// Update
const updated = await prisma.employee.update({
  where: { id: employeeId },
  data: { position: 'Senior Developer' },
});

// Delete
await prisma.employee.delete({
  where: { id: employeeId },
});

// Upsert (update or create)
const employee = await prisma.employee.upsert({
  where: { email: 'john@example.com' },
  update: { position: 'Senior Developer' },
  create: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    position: 'Developer',
    department: 'Engineering',
    hireDate: new Date(),
  },
});
```

### Transactions

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: 'EMPLOYEE',
    },
  });

  // Create employee
  const employee = await tx.employee.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  return { user, employee };
});
```

---

## API Development

### Controller Pattern

```typescript
// src/controllers/employeeController.ts

import { Request, Response } from 'express';
import prisma from '../config/database';

// GET /api/employees
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, department } = req.query;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    // Fetch with pagination
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { email: true, role: true } },
          manager: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: employees,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employees',
    });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        manager: { select: { firstName: true, lastName: true } },
        attendanceRecords: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }

    res.json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employee',
    });
  }
};

// POST /api/employees
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const employee = await prisma.employee.create({
      data,
      include: { user: true },
    });

    res.status(201).json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create employee',
    });
  }
};
```

### Route Definition

```typescript
// src/routes/employeeRoutes.ts

import { Router } from 'express';
import * as employeeController from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { employeeSchemas } from '../validators/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  employeeController.getEmployees
);

router.get(
  '/:id',
  employeeController.getEmployeeById
);

router.post(
  '/',
  authorize('ADMIN', 'HR'), // Only ADMIN and HR can create
  validate(employeeSchemas.create),
  employeeController.createEmployee
);

router.put(
  '/:id',
  authorize('ADMIN', 'HR'),
  validate(employeeSchemas.update),
  employeeController.updateEmployee
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  employeeController.deleteEmployee
);

export default router;
```

### Registering Routes

```typescript
// src/index.ts

import express from 'express';
import employeeRoutes from './routes/employeeRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Start server
app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

---

## Authentication & Authorization

### JWT Authentication

```typescript
// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
};
```

### Role-Based Authorization

```typescript
// src/middleware/auth.ts

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Usage
router.post(
  '/employees',
  authenticate,
  authorize('ADMIN', 'HR'),
  createEmployee
);
```

### Login Endpoint

```typescript
// src/controllers/authController.ts

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.employee?.firstName,
          lastName: user.employee?.lastName,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
    });
  }
};
```

---

## Validation

### Zod Schemas

```typescript
// src/validators/schemas.ts

import { z } from 'zod';

export const employeeSchemas = {
  create: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    location: z.string().optional(),
    hireDate: z.string().datetime(),
    salary: z.number().positive().optional(),
    managerId: z.string().uuid().optional(),
  }),

  update: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    location: z.string().optional(),
    salary: z.number().positive().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  }),
};
```

### Validation Middleware

```typescript
// src/middleware/validate.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
```

---

## Error Handling

### Global Error Handler

```typescript
// src/middleware/errorHandler.ts

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'Record already exists',
      });
    }
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
  });
};

// Register in index.ts
app.use(errorHandler);
```

---

## Testing

### Unit Tests

```typescript
// __tests__/employee.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/database';

describe('Employee API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    authToken = response.body.data.token;
  });

  describe('GET /api/employees', () => {
    it('should return list of employees', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/employees');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/employees', () => {
    it('should create employee with valid data', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          position: 'Developer',
          department: 'Engineering',
          hireDate: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'A', // Too short
        });

      expect(response.status).toBe(400);
    });
  });
});
```

---

## Performance

### Database Indexing

```prisma
model Employee {
  // ...fields

  @@index([email])
  @@index([department])
  @@index([status])
  @@index([department, status]) // Composite index
}
```

### Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const employees = await prisma.employee.findMany();
for (const emp of employees) {
  emp.manager = await prisma.employee.findUnique({
    where: { id: emp.managerId },
  });
}

// ✅ Good: Use include
const employees = await prisma.employee.findMany({
  include: { manager: true },
});

// ✅ Better: Select only needed fields
const employees = await prisma.employee.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    manager: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  },
});
```

---

## Security

### Security Best Practices

1. **Input Validation**: Always validate with Zod
2. **SQL Injection**: Prisma prevents this automatically
3. **Rate Limiting**: Applied (100/15min general, 5/15min auth)
4. **Password Hashing**: Always use bcrypt
5. **JWT Security**: Use strong secret, short expiry
6. **CORS**: Configure properly
7. **Helmet**: Security headers enabled

See [Security Guide](./SECURITY.md) for details.

---

## Best Practices

### TypeScript

✅ **Do**:
```typescript
interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
}

const createEmployee = async (data: CreateEmployeeDto): Promise<Employee> => {
  return await prisma.employee.create({ data });
};
```

❌ **Don't**:
```typescript
const createEmployee = async (data: any): Promise<any> => {
  return await prisma.employee.create({ data });
};
```

### Error Handling

✅ **Do**:
```typescript
try {
  const result = await operation();
  res.json({ status: 'success', data: result });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Operation failed',
  });
}
```

### Response Format

Always return consistent format:

```typescript
// Success
{
  "status": "success",
  "data": { /* response data */ }
}

// Error
{
  "status": "error",
  "message": "Error description"
}

// Paginated
{
  "status": "success",
  "data": [ /* items */ ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

---

## Common Patterns

### Pagination

```typescript
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 50;

const [data, total] = await Promise.all([
  prisma.model.findMany({
    skip: (page - 1) * limit,
    take: limit,
  }),
  prisma.model.count(),
]);

res.json({
  status: 'success',
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
```

### Search & Filter

```typescript
const { search, department, status } = req.query;

const where: any = {};

if (search) {
  where.OR = [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } },
  ];
}

if (department) where.department = department;
if (status) where.status = status;

const results = await prisma.employee.findMany({ where });
```

---

## Troubleshooting

### Common Issues

**Prisma Client not found**:
```bash
npx prisma generate
```

**Migration errors**:
```bash
npx prisma migrate reset  # Development only!
npx prisma migrate dev
```

**Port in use**:
```bash
lsof -ti:3001 | xargs kill -9
```

**Database connection issues**:
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Test connection: `psql -U postgres -d nexus_hr`

---

## Additional Resources

- **[Getting Started](./GETTING_STARTED.md)** - Setup guide
- **[API Documentation](./API.md)** - API reference
- **[Security Guide](./SECURITY.md)** - Security best practices
- **[Testing Guide](./TESTING.md)** - Testing strategies
- **[Prisma Docs](https://www.prisma.io/docs)** - Official Prisma documentation

---

**Questions?** Check the [Documentation Index](./INDEX.md) or ask the team!

**Last Updated**: November 22, 2025
