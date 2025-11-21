# Security Guide - Nexus HR

This document outlines security best practices, configurations, and procedures for the Nexus HR platform.

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Database Security](#database-security)
- [Deployment Security](#deployment-security)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

---

## Security Overview

### Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimal access rights
3. **Secure by Default**: Security enabled out of the box
4. **Fail Securely**: Graceful degradation
5. **Complete Mediation**: Check every access

### Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Resource-based authorization
- ✅ Input validation with Zod
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ HTTPS enforcement
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Password hashing (bcrypt)
- ✅ Secure password requirements

---

## Authentication & Authorization

### Password Requirements

Passwords must meet the following criteria:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (`!@#$%^&*(),.?":{}|<>`)

**Implementation**: `server/src/utils/password.ts`

```typescript
export const validatePasswordStrength = (password: string) => {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Minimum 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');

  return { valid: errors.length === 0, errors };
};
```

### JWT Configuration

**Token Storage**: Tokens should be stored securely
- ❌ **Don't**: Store in localStorage (XSS vulnerable)
- ✅ **Do**: Use httpOnly cookies (recommended)
- ⚠️ **Current**: localStorage (needs migration)

**Token Expiration**: 7 days (configurable via `JWT_EXPIRES_IN`)

**Token Refresh**: Implement token refresh before expiration

```typescript
// Recommended: Refresh token 1 hour before expiration
if (tokenExpiresIn < 3600) {
  await refreshToken();
}
```

### Role-Based Access Control (RBAC)

**Roles**:
- `ADMIN`: Full system access
- `HR`: HR management functions
- `MANAGER`: Team management
- `EMPLOYEE`: Self-service only

**Middleware Usage**:

```typescript
// Require specific roles
router.post('/payroll', authorize('ADMIN', 'HR'), processPayroll);

// Require owner or admin
router.get('/records/:id', authorizeOwnerOrAdmin('id'), getRecord);

// Require specific permission
router.delete('/data', hasPermission('delete_data'), deleteData);
```

### Multi-Factor Authentication (MFA)

**Status**: Backend prepared, frontend UI needed

**Implementation**:
1. User enables MFA in settings
2. QR code generated for authenticator app
3. User confirms with initial code
4. Backup codes provided
5. MFA required on subsequent logins

---

## Data Protection

### Encryption

**At Rest**:
- Database: PostgreSQL encryption enabled
- File storage: Encrypted S3 buckets (if using AWS)
- Backups: Encrypted with GPG

**In Transit**:
- HTTPS/TLS for all communications
- Certificate pinning for mobile apps

### Sensitive Data Handling

**PII (Personally Identifiable Information)**:
- Employee emails, phone numbers
- Bank details, tax information
- Performance reviews, feedback

**Protection Measures**:
```typescript
// Never log sensitive data
logger.info('User logged in', { userId, email: '[REDACTED]' });

// Sanitize output
const sanitizeEmployee = (employee) => {
  const { password, ssn, bankAccount, ...safe } = employee;
  return safe;
};
```

### GDPR Compliance

- **Right to Access**: API endpoint for data export
- **Right to Erasure**: Soft delete with anonymization
- **Data Portability**: JSON/CSV export
- **Consent Management**: Audit logs for consent

---

## API Security

### Rate Limiting

**Configuration**: `server/src/index.ts`

```typescript
// General API: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Auth endpoints: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
```

### Input Validation

All endpoints use Zod validation:

```typescript
router.post(
  '/employees',
  validate(createEmployeeSchema),
  createEmployee
);
```

**Validation Rules**:
- Email format validation
- Phone number format (E.164)
- Date format (ISO 8601)
- Numeric ranges
- String length limits
- Enum validation

### CORS Configuration

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Whitelist specific domain
  credentials: true,                 // Allow cookies
}));
```

**Production**: Set `CORS_ORIGIN` to exact domain (no wildcards)

### Security Headers

Helmet configuration applies:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

---

## Frontend Security

### XSS Prevention

1. **React Auto-Escaping**: React escapes by default
2. **Avoid `dangerouslySetInnerHTML`**
3. **Sanitize user input**

```typescript
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
```

### CSRF Protection

**Current**: Token-based (JWT in Authorization header)

**Recommended**: Add CSRF tokens for state-changing operations

```typescript
// Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex');

// Include in forms
<input type="hidden" name="_csrf" value={csrfToken} />
```

### Content Security Policy

Configured in Helmet (backend) and meta tag (frontend):

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

---

## Database Security

### Connection Security

```bash
# Use SSL connections
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Query Protection

**Prisma ORM**: Prevents SQL injection by using parameterized queries

```typescript
// Safe - Prisma uses parameters
await prisma.user.findMany({
  where: { email: userInput }
});

// Dangerous - Don't use raw SQL with user input
await prisma.$executeRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

### Access Control

```sql
-- Create limited user for application
CREATE USER nexus_app WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nexus_app;

-- Revoke dangerous permissions
REVOKE CREATE, DROP ON SCHEMA public FROM nexus_app;
```

### Audit Logging

Track all sensitive operations:

```typescript
await prisma.auditLog.create({
  data: {
    userId: req.user.id,
    action: 'DELETE_EMPLOYEE',
    resourceId: employeeId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  },
});
```

---

## Deployment Security

### Environment Variables

**Never commit**:
- `.env`
- `.env.production`
- Any file containing secrets

**Always commit**:
- `.env.example`
- `.env.production.example`

### Secrets Management

**Development**: `.env` file (local only)

**Staging/Production**: Use secure secret management:
- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets
- GitHub Secrets (for CI/CD)

### HTTPS Configuration

**nginx Configuration**:

```nginx
server {
    listen 443 ssl http2;
    server_name nexushr.com;

    ssl_certificate /etc/letsencrypt/live/nexushr.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexushr.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Other security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] `.env` files not committed to git
- [ ] Strong JWT secret (min 32 characters)
- [ ] HTTPS/TLS enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF protection implemented
- [ ] Security headers configured (Helmet)
- [ ] Password requirements enforced
- [ ] Default credentials changed
- [ ] Database access restricted
- [ ] Audit logging enabled
- [ ] Backup encryption enabled
- [ ] Monitoring and alerting configured

### Post-Deployment

- [ ] Penetration testing completed
- [ ] Security audit performed
- [ ] Vulnerability scanning automated
- [ ] Incident response plan documented
- [ ] Security training for team
- [ ] Regular security updates scheduled

---

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor logs, alerts, user reports
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze logs, identify breach
4. **Eradication**: Remove threat, patch vulnerabilities
5. **Recovery**: Restore systems, verify integrity
6. **Post-Incident**: Document, improve procedures

### Contact Information

- **Security Team**: security@nexushr.com
- **Incident Hotline**: +1-XXX-XXX-XXXX
- **PGP Key**: [Link to public key]

### Reporting Vulnerabilities

Submit security issues to: security@nexushr.com

**Please include**:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Bug Bounty**: Consider implementing a bug bounty program

---

## Regular Security Tasks

### Daily
- Monitor security alerts
- Review failed login attempts
- Check rate limit violations

### Weekly
- Review audit logs
- Update dependencies
- Scan for vulnerabilities

### Monthly
- Rotate credentials
- Review access permissions
- Security awareness training

### Quarterly
- Penetration testing
- Security audit
- Update security documentation

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
