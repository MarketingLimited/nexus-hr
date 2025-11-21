# Troubleshooting Guide - Nexus HR

This guide helps diagnose and resolve common issues encountered when developing, deploying, or using Nexus HR.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Environment](#development-environment)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [API Issues](#api-issues)
- [Frontend Issues](#frontend-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Problems](#performance-problems)
- [Common Error Messages](#common-error-messages)

---

## Installation Issues

### Node Modules Installation Fails

**Problem**: `npm install` fails or hangs

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

4. Try using a different registry:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

### Prisma Installation Issues

**Problem**: Prisma client generation fails

**Solutions**:
```bash
cd server
npx prisma generate --force
```

If still failing:
```bash
rm -rf node_modules/.prisma
npm install @prisma/client
npx prisma generate
```

---

## Development Environment

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5173`

**Solutions**:
1. Find and kill the process using the port:
   ```bash
   # macOS/Linux
   lsof -ti:5173 | xargs kill -9

   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

2. Change the port in configuration:
   ```bash
   # Frontend: vite.config.ts
   server: {
     port: 3000
   }

   # Backend: .env
   PORT=3002
   ```

### Environment Variables Not Loading

**Problem**: Application doesn't read `.env` file

**Solutions**:
1. Verify `.env` file location:
   ```bash
   # Backend .env should be in server/
   ls server/.env
   ```

2. Check `.env` file syntax (no spaces around `=`):
   ```
   ✓ DATABASE_URL=postgresql://...
   ✗ DATABASE_URL = postgresql://...
   ```

3. Restart the development server

4. Verify dotenv is imported:
   ```typescript
   // Should be at top of index.ts
   import dotenv from 'dotenv';
   dotenv.config();
   ```

### Hot Reload Not Working

**Problem**: Changes don't reflect in browser

**Solutions**:
1. Check if Vite dev server is running
2. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
3. Restart dev server
4. Check for TypeScript errors in console

---

## Database Issues

### Database Connection Failed

**Problem**: `Error: Can't reach database server`

**Solutions**:
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   systemctl status postgresql

   # Docker
   docker ps | grep postgres
   ```

2. Check DATABASE_URL format:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```

3. Test connection:
   ```bash
   psql -h localhost -U username -d database_name
   ```

4. Check firewall/security groups if using cloud database

### Migration Fails

**Problem**: `prisma migrate dev` fails

**Solutions**:
1. Check database connection first
2. Reset database if in development:
   ```bash
   cd server
   npx prisma migrate reset
   ```

3. If migration is in bad state:
   ```bash
   npx prisma migrate resolve --applied <migration-name>
   # or
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

4. For production, create a new migration:
   ```bash
   npx prisma migrate deploy
   ```

### Prisma Client Out of Sync

**Problem**: `PrismaClient does not match schema`

**Solutions**:
```bash
cd server
npx prisma generate
npm run build
```

### Database Lock Issues

**Problem**: `database is locked` error

**Solutions**:
1. Close all database connections
2. Restart PostgreSQL:
   ```bash
   # macOS
   brew services restart postgresql

   # Linux
   sudo systemctl restart postgresql
   ```

---

## Authentication Problems

### JWT Token Expired

**Problem**: `401 Unauthorized` after some time

**Solutions**:
1. This is expected behavior - tokens expire for security
2. Implement token refresh:
   ```typescript
   // Call refresh endpoint before token expires
   const refreshToken = async () => {
     const response = await api.post('/auth/refresh');
     localStorage.setItem('auth_token', response.data.token);
   };
   ```

3. Or log out and log in again

### Cannot Login

**Problem**: Login fails with correct credentials

**Solutions**:
1. Check browser console for errors
2. Verify API endpoint is correct
3. Check if backend is running:
   ```bash
   curl http://localhost:3001/api/auth/login
   ```

4. Check database for user:
   ```sql
   SELECT * FROM "User" WHERE email = 'your-email@example.com';
   ```

5. Reset password if needed:
   ```bash
   cd server
   npm run prisma:studio
   # Update password hash in UI
   ```

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solutions**:
1. Verify CORS configuration in backend:
   ```typescript
   // server/src/index.ts
   app.use(cors({
     origin: 'http://localhost:5173',  // Frontend URL
     credentials: true,
   }));
   ```

2. Check if frontend is calling correct API URL
3. Ensure credentials are included in requests:
   ```typescript
   axios.defaults.withCredentials = true;
   ```

---

## API Issues

### 404 Not Found

**Problem**: API endpoint returns 404

**Solutions**:
1. Verify endpoint URL:
   ```bash
   # Check all routes
   grep -r "router.get" server/src/routes
   ```

2. Check if route is registered:
   ```typescript
   // server/src/index.ts
   app.use('/api/employees', employeeRoutes);
   ```

3. Verify HTTP method (GET vs POST)

### 500 Internal Server Error

**Problem**: API returns 500 error

**Solutions**:
1. Check server logs:
   ```bash
   # In terminal running backend
   # Look for error stack trace
   ```

2. Check if database is running
3. Verify required fields in request body
4. Check for validation errors

### Rate Limit Exceeded

**Problem**: `429 Too Many Requests`

**Solutions**:
1. Wait for rate limit window to expire (15 minutes)
2. Adjust rate limits in development:
   ```typescript
   // server/src/index.ts
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100, // Increase for development
   });
   ```

### Request Timeout

**Problem**: Request takes too long

**Solutions**:
1. Check database query performance
2. Add indexes to frequently queried fields
3. Implement pagination for large datasets
4. Optimize complex queries

---

## Frontend Issues

### White Screen / App Won't Load

**Problem**: Application shows blank page

**Solutions**:
1. Check browser console for errors
2. Verify API connection
3. Check if JavaScript is enabled
4. Clear browser cache and localStorage:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

5. Rebuild frontend:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### React Query Not Working

**Problem**: Data not loading/caching

**Solutions**:
1. Verify QueryClient is set up:
   ```typescript
   // App.tsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   const queryClient = new QueryClient();
   ```

2. Check React Query DevTools
3. Verify API calls are returning data

### Styling Issues

**Problem**: Tailwind styles not applying

**Solutions**:
1. Verify Tailwind is configured:
   ```bash
   cat tailwind.config.ts
   ```

2. Check if PostCSS is set up
3. Restart dev server
4. Purge and rebuild:
   ```bash
   npm run build
   ```

---

## Deployment Issues

### Docker Build Fails

**Problem**: `docker build` fails

**Solutions**:
1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Verify Dockerfile syntax
3. Clean Docker cache:
   ```bash
   docker system prune -a
   ```

4. Check disk space:
   ```bash
   df -h
   ```

### Container Won't Start

**Problem**: Container exits immediately

**Solutions**:
1. Check container logs:
   ```bash
   docker logs <container-id>
   ```

2. Verify environment variables:
   ```bash
   docker exec <container-id> printenv
   ```

3. Check if ports are available:
   ```bash
   docker ps -a
   ```

### Database Migration in Production

**Problem**: Migrations fail in production

**Solutions**:
1. Backup database first
2. Run migrations explicitly:
   ```bash
   docker exec backend npx prisma migrate deploy
   ```

3. Check migration status:
   ```bash
   docker exec backend npx prisma migrate status
   ```

---

## Performance Problems

### Slow Page Load

**Problem**: Pages take long to load

**Solutions**:
1. Check network tab in DevTools
2. Implement lazy loading for routes:
   ```typescript
   const EmployeePage = lazy(() => import('./pages/EmployeePage'));
   ```

3. Optimize images
4. Enable caching in React Query
5. Use pagination for large lists

### High Memory Usage

**Problem**: Application uses too much memory

**Solutions**:
1. Check for memory leaks with DevTools
2. Clean up useEffect hooks:
   ```typescript
   useEffect(() => {
     // Setup
     return () => {
       // Cleanup
     };
   }, []);
   ```

3. Limit query cache size:
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         cacheTime: 1000 * 60 * 5, // 5 minutes
       },
     },
   });
   ```

### Slow Database Queries

**Problem**: Queries take too long

**Solutions**:
1. Add indexes:
   ```prisma
   model Employee {
     @@index([department])
     @@index([status])
   }
   ```

2. Use select to limit fields:
   ```typescript
   const user = await prisma.user.findUnique({
     select: { id: true, email: true },
   });
   ```

3. Implement pagination
4. Use database query analyzer:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM "Employee";
   ```

---

## Common Error Messages

### "Cannot read property of undefined"

**Cause**: Trying to access property on undefined object

**Solution**:
```typescript
// Use optional chaining
const name = user?.firstName;

// Or provide default
const name = user?.firstName || 'Unknown';
```

### "Network Error"

**Cause**: Cannot reach backend server

**Solutions**:
1. Verify backend is running
2. Check API base URL configuration
3. Check firewall settings
4. Verify CORS settings

### "ValidationError"

**Cause**: Input doesn't match schema

**Solution**:
1. Check Zod schema requirements
2. Verify all required fields are provided
3. Check field types match schema

### "Unique constraint failed"

**Cause**: Trying to create duplicate record

**Solution**:
1. Check if record already exists
2. Use `upsert` instead of `create`:
   ```typescript
   await prisma.user.upsert({
     where: { email },
     update: { ... },
     create: { ... },
   });
   ```

---

## Getting Further Help

If you still experience issues:

1. **Search GitHub Issues**: https://github.com/MarketingLimited/nexus-hr/issues
2. **Check Documentation**: `/docs` directory
3. **Create New Issue**: Include:
   - Detailed description
   - Steps to reproduce
   - Error messages/logs
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

---

## Preventive Measures

To avoid common issues:

1. **Keep dependencies updated**:
   ```bash
   npm outdated
   npm update
   ```

2. **Run tests before committing**:
   ```bash
   npm test
   ```

3. **Use TypeScript strictly**:
   ```typescript
   // Avoid 'any', use proper types
   ```

4. **Monitor logs regularly**
5. **Set up proper error tracking** (Sentry, etc.)
6. **Keep backups of database**

---

## Debug Mode

Enable debug mode for more verbose logging:

**Frontend**:
```typescript
// Set in .env
VITE_DEBUG=true
```

**Backend**:
```typescript
// Set in .env
DEBUG=*
LOG_LEVEL=debug
```

---

## Health Check Endpoints

Use these endpoints to verify system health:

```bash
# Backend health
curl http://localhost:3001/health

# Database connection
curl http://localhost:3001/api/health/db

# Get system info
curl http://localhost:3001/api/health/system
```

---

Remember: Most issues can be resolved by:
1. Checking logs
2. Verifying configuration
3. Restarting services
4. Clearing caches

When in doubt, restart everything fresh!
