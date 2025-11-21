# Performance Optimization Guide - Nexus HR

This guide provides strategies and best practices for optimizing the performance of Nexus HR.

## Table of Contents

- [Performance Targets](#performance-targets)
- [Frontend Optimization](#frontend-optimization)
- [Backend Optimization](#backend-optimization)
- [Database Optimization](#database-optimization)
- [Caching Strategies](#caching-strategies)
- [Monitoring & Profiling](#monitoring--profiling)
- [Load Testing](#load-testing)

---

## Performance Targets

### Key Metrics

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Page Load Time | < 1s | < 2s | > 3s |
| API Response Time | < 200ms | < 500ms | > 1s |
| Time to Interactive | < 2s | < 3s | > 5s |
| First Contentful Paint | < 1s | < 1.5s | > 2.5s |
| Database Query Time | < 100ms | < 300ms | > 500ms |

### Capacity Targets

- **Concurrent Users**: 1000
- **Requests/Second**: 100
- **Database Connections**: 50
- **Response Time P95**: < 500ms
- **Error Rate**: < 0.1%

---

## Frontend Optimization

### Code Splitting

Implement route-based code splitting:

```typescript
import { lazy, Suspense } from 'react';

const EmployeePage = lazy(() => import('./pages/EmployeePage'));
const LeavePage = lazy(() => import('./pages/LeavePage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/leave" element={<LeavePage />} />
      </Routes>
    </Suspense>
  );
}
```

### Component Lazy Loading

Load heavy components only when needed:

```typescript
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### Memoization

Use React.memo for expensive components:

```typescript
import { memo } from 'react';

export const EmployeeRow = memo(({ employee }: Props) => {
  return (
    <tr>
      <td>{employee.name}</td>
      {/* ... */}
    </tr>
  );
});
```

Use useMemo for expensive calculations:

```typescript
const totalSalary = useMemo(() => {
  return employees.reduce((sum, emp) => sum + emp.salary, 0);
}, [employees]);
```

### Virtual Scrolling

For large lists, implement virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function EmployeeList({ employees }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: employees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <EmployeeRow key={virtualRow.index} employee={employees[virtualRow.index]} />
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

1. **Use appropriate formats**:
   - WebP for photos
   - SVG for icons
   - PNG for transparency

2. **Implement lazy loading**:
   ```html
   <img src="..." loading="lazy" alt="..." />
   ```

3. **Responsive images**:
   ```html
   <picture>
     <source srcset="image-small.webp" media="(max-width: 600px)">
     <source srcset="image-large.webp" media="(min-width: 601px)">
     <img src="image.png" alt="Fallback">
   </picture>
   ```

### Bundle Optimization

Configure Vite for optimal bundles:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

## Backend Optimization

### Request Optimization

1. **Enable compression**:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Implement caching headers**:
   ```typescript
   res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
   ```

3. **Use ETags**:
   ```typescript
   app.use((req, res, next) => {
     res.setHeader('ETag', generateETag(data));
     next();
   });
   ```

### Database Connection Pooling

Configure Prisma connection pool:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 10
  pool_size = 10
}
```

### Query Optimization

1. **Select only needed fields**:
   ```typescript
   const user = await prisma.user.findUnique({
     where: { id },
     select: { id: true, email: true, firstName: true },
   });
   ```

2. **Use pagination**:
   ```typescript
   const employees = await prisma.employee.findMany({
     skip: (page - 1) * limit,
     take: limit,
   });
   ```

3. **Implement cursor-based pagination for large datasets**:
   ```typescript
   const employees = await prisma.employee.findMany({
     take: 10,
     skip: 1,
     cursor: { id: lastEmployeeId },
   });
   ```

### Async Processing

Move long-running tasks to background:

```typescript
import Bull from 'bull';

const payrollQueue = new Bull('payroll-processing');

// Add job to queue
payrollQueue.add({ employeeId, month });

// Process in background
payrollQueue.process(async (job) => {
  await processPayroll(job.data);
});
```

---

## Database Optimization

### Indexing Strategy

Add indexes for frequently queried fields:

```prisma
model Employee {
  id         String   @id @default(uuid())
  email      String   @unique
  department String
  status     String
  hireDate   DateTime

  @@index([department])
  @@index([status])
  @@index([hireDate])
  @@index([department, status])
}
```

### Query Analysis

Use EXPLAIN ANALYZE to identify slow queries:

```sql
EXPLAIN ANALYZE
SELECT * FROM "Employee"
WHERE department = 'Engineering'
  AND status = 'ACTIVE';
```

### Materialized Views

For complex aggregations, create materialized views:

```sql
CREATE MATERIALIZED VIEW employee_stats AS
SELECT
  department,
  COUNT(*) as total_employees,
  AVG(salary) as avg_salary
FROM "Employee"
GROUP BY department;

-- Refresh periodically
REFRESH MATERIALIZED VIEW employee_stats;
```

### Database Maintenance

Regular maintenance tasks:

```bash
# Analyze tables
ANALYZE "Employee";

# Vacuum to reclaim storage
VACUUM FULL "Employee";

# Update statistics
ANALYZE;
```

---

## Caching Strategies

### Client-Side Caching (React Query)

Configure caching behavior:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Server-Side Caching (Redis)

Implement Redis caching:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache API responses
export const getCachedEmployee = async (id: string) => {
  const cached = await redis.get(`employee:${id}`);

  if (cached) {
    return JSON.parse(cached);
  }

  const employee = await prisma.employee.findUnique({ where: { id } });
  await redis.setex(`employee:${id}`, 300, JSON.stringify(employee)); // 5 min cache

  return employee;
};

// Invalidate cache on update
export const updateEmployee = async (id: string, data: any) => {
  const employee = await prisma.employee.update({ where: { id }, data });
  await redis.del(`employee:${id}`);
  return employee;
};
```

### HTTP Caching

Configure nginx caching:

```nginx
# /etc/nginx/nginx.conf
http {
  proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

  server {
    location /api/employees {
      proxy_cache api_cache;
      proxy_cache_valid 200 5m;
      proxy_cache_key "$request_uri";
      add_header X-Cache-Status $upstream_cache_status;
    }
  }
}
```

---

## Monitoring & Profiling

### Frontend Performance Monitoring

Use React DevTools Profiler:

```typescript
import { Profiler } from 'react';

<Profiler id="EmployeeList" onRender={onRenderCallback}>
  <EmployeeList />
</Profiler>
```

### Backend Performance Monitoring

Implement request timing:

```typescript
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });

  next();
});
```

### Database Query Monitoring

Enable Prisma query logging:

```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});
```

### Prometheus Metrics

Expose custom metrics:

```typescript
import { Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
```

---

## Load Testing

### Using Apache Bench

```bash
# Test single endpoint
ab -n 1000 -c 100 http://localhost:3001/api/employees

# With authentication
ab -n 1000 -c 100 -H "Authorization: Bearer <token>" http://localhost:3001/api/employees
```

### Using k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3001/api/employees');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

Run test:
```bash
k6 run load-test.js
```

---

## Performance Checklist

### Frontend
- [ ] Code splitting implemented
- [ ] Lazy loading for routes and heavy components
- [ ] React.memo used for expensive components
- [ ] useMemo/useCallback for expensive operations
- [ ] Virtual scrolling for long lists
- [ ] Images optimized and lazy loaded
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90

### Backend
- [ ] Compression enabled
- [ ] Connection pooling configured
- [ ] Query optimization applied
- [ ] Pagination implemented
- [ ] Caching strategy in place
- [ ] Rate limiting enabled
- [ ] Request logging minimal
- [ ] Response time < 200ms (P95)

### Database
- [ ] Indexes on frequently queried fields
- [ ] N+1 queries eliminated
- [ ] Connection pool sized appropriately
- [ ] Regular maintenance scheduled
- [ ] Query performance monitored
- [ ] Backup strategy in place

### Monitoring
- [ ] Performance metrics tracked
- [ ] Alerts configured
- [ ] Error tracking enabled
- [ ] Load testing performed
- [ ] Regular performance audits

---

## Continuous Performance Optimization

1. **Regular Audits**: Run performance audits monthly
2. **Monitor Metrics**: Track key metrics in Prometheus/Grafana
3. **Load Testing**: Perform load tests before major releases
4. **User Feedback**: Collect real-user performance data
5. **Incremental Improvements**: Make small, measurable improvements

---

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
