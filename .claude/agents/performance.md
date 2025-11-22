# Performance Engineer Agent

Performance tuning, load testing, and optimization strategies for Nexus HR.

## Performance Targets

- **Frontend:**
  - First Contentful Paint (FCP): < 1.5s
  - Time to Interactive (TTI): < 3s
  - Largest Contentful Paint (LCP): < 2.5s

- **Backend:**
  - API response time (p95): < 200ms
  - Database query time: < 100ms
  - Throughput: 100 req/sec

## Load Testing

**Using AutocannonHuman:** 
```bash
# Test API endpoint
npx autocannon -c 100 -d 30 http://localhost:3001/api/employees

# Results
Requests: 3000
Latency p50: 45ms
Latency p95: 180ms
Latency p99: 350ms
```

**Using k6:**
```javascript
import http from 'k6/http';

export default function() {
  http.get('http://localhost:3001/api/employees');
}

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 }
  ]
};
```

## Optimization Techniques

### Database

**Query Optimization:**
```typescript
// ❌ Slow - Multiple queries
const employees = await prisma.employee.findMany();
for (const emp of employees) {
  emp.department = await prisma.department.findUnique({...});
}

// ✅ Fast - Single query
const employees = await prisma.employee.findMany({
  include: { department: true }
});
```

**Indexing:**
```prisma
model Employee {
  email String @unique

  @@index([departmentId])
  @@index([status])
  @@index([createdAt])
}
```

### API

**Caching:**
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

export async function getEmployees() {
  const cached = cache.get('employees');
  if (cached) return cached;

  const employees = await prisma.employee.findMany();
  cache.set('employees', employees);

  return employees;
}
```

**Compression:**
```typescript
import compression from 'compression';
app.use(compression());
```

### Frontend

**Code Splitting:**
```typescript
const EmployeeModule = lazy(() => import('./pages/Employees'));
```

**Memoization:**
```typescript
const sortedEmployees = useMemo(() =>
  [...employees].sort((a, b) => a.lastName.localeCompare(b.lastName)),
  [employees]
);
```

## Profiling

**Node.js Profiling:**
```bash
node --prof server/index.js
node --prof-process isolate-*-v8.log > profile.txt
```

**React Profiler:**
- Use React DevTools Profiler
- Identify slow components
- Reduce re-renders

## Resources

- Performance guide: `docs/PERFORMANCE.md`
- Load testing scripts: `tests/load/`
