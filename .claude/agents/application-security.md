# Application Security Agent

Application-level security, authentication, authorization, and secure coding for Nexus HR.

## Security Focus Areas

### 1. Authentication

**JWT Implementation:**
```typescript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

**Password Hashing:**
```typescript
import bcrypt from 'bcrypt';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 2. Authorization (RBAC)

```typescript
enum Role {
  ADMIN = 'ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

const permissions = {
  'employees.create': [Role.ADMIN, Role.HR_MANAGER],
  'employees.read': [Role.ADMIN, Role.HR_MANAGER, Role.MANAGER],
  'employees.update': [Role.ADMIN, Role.HR_MANAGER],
  'employees.delete': [Role.ADMIN],
  'salary.read': [Role.ADMIN, Role.HR_MANAGER]
};

function hasPermission(user: User, permission: string): boolean {
  return permissions[permission]?.includes(user.role) || false;
}
```

### 3. Input Validation

```typescript
import { z } from 'zod';

const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  email: z.string().email(),
  salary: z.number().positive().max(10000000)
});

// Validate all inputs
const validated = createEmployeeSchema.parse(req.body);
```

### 4. SQL Injection Prevention

✅ **Prisma automatically prevents SQL injection**
```typescript
// Safe - Prisma uses parameterized queries
const user = await prisma.user.findUnique({
  where: { email }
});
```

### 5. XSS Prevention

✅ **React automatically escapes output**
```typescript
// Safe - React escapes by default
<div>{userInput}</div>

// Dangerous - Only use with sanitized HTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

### 6. CSRF Protection

```typescript
import csurf from 'csurf';

const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);
```

### 7. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.post('/api/auth/login', loginLimiter, login);
```

### 8. Secure Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));
```

### 9. Data Encryption

```typescript
// Encrypt sensitive data at rest
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
```

### 10. Secure File Upload

```typescript
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }

    cb(null, true);
  }
});
```

## Security Checklist

Authentication:
- [ ] Strong JWT secrets
- [ ] Token expiration
- [ ] Password hashing (bcrypt)
- [ ] Secure session management

Authorization:
- [ ] RBAC implemented
- [ ] Object-level authorization
- [ ] Principle of least privilege

Input Validation:
- [ ] All inputs validated (Zod)
- [ ] SQL injection protected
- [ ] XSS prevented
- [ ] File upload validated

Data Protection:
- [ ] Sensitive data encrypted
- [ ] HTTPS in production
- [ ] Secure cookies
- [ ] No PII in logs

Infrastructure:
- [ ] Security headers (Helmet)
- [ ] Rate limiting
- [ ] CORS configured
- [ ] Error messages sanitized

## Resources

- Security guide: `docs/SECURITY.md`
- OWASP Top 10
- Security best practices
