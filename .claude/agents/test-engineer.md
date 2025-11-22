# Test Engineer Agent

Test strategy, framework setup, and QA processes for Nexus HR.

## Testing Stack

**Frontend:**
- Vitest (test runner)
- React Testing Library
- jest-axe (accessibility)
- MSW (API mocking)

**Backend:**
- Vitest
- Supertest (API testing)
- Prisma test database

## Testing Strategy

### Test Pyramid
```
     /\
    /E2E\      ← Few (critical user flows)
   /------\
  / Integ  \   ← Some (API endpoints, workflows)
 /----------\
/    Unit    \ ← Many (functions, components)
--------------
```

### Coverage Targets
- Frontend: 80% line coverage
- Backend: 90% line coverage
- Critical paths: 100% coverage

## Test Types

### 1. Unit Tests

**Component Tests:**
```typescript
describe('EmployeeCard', () => {
  it('renders employee information', () => {
    const employee = { id: '1', firstName: 'John', lastName: 'Doe' };
    render(<EmployeeCard employee={employee} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit when button clicked', async () => {
    const onEdit = vi.fn();
    const { user } = render(<EmployeeCard employee={employee} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

**Function Tests:**
```typescript
describe('calculateSalary', () => {
  it('calculates total salary correctly', () => {
    const result = calculateSalary(5000, 500, 200);
    expect(result).toBe(5300);
  });

  it('throws error for negative values', () => {
    expect(() => calculateSalary(-1000, 0, 0)).toThrow();
  });
});
```

### 2. Integration Tests

**API Tests:**
```typescript
describe('POST /api/employees', () => {
  beforeEach(async () => {
    await prisma.employee.deleteMany();
  });

  it('creates employee with valid data', async () => {
    const response = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send(employeeData);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });

  it('returns 400 with invalid data', async () => {
    const response = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(400);
  });
});
```

### 3. E2E Tests

**User Flow Tests:**
```typescript
describe('Employee Creation Flow', () => {
  it('allows admin to create employee', async () => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navigate to employees
    await page.click('text=Employees');
    await page.click('text=Add Employee');

    // Fill form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');

    // Submit
    await page.click('button[type="submit"]');

    // Verify
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});
```

### 4. Accessibility Tests

```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<EmployeeForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Test Organization

```
src/
  components/
    EmployeeCard/
      EmployeeCard.tsx
      EmployeeCard.test.tsx
  services/
    employeeService.ts
    employeeService.test.ts
  __tests__/
    integration/
      employeeAPI.test.ts
    e2e/
      employeeFlow.test.ts
```

## Mocking

**API Mocking (MSW):**
```typescript
// src/mocks/handlers/employeeHandlers.ts
export const employeeHandlers = [
  http.get('/api/employees', () => {
    return HttpResponse.json({
      status: 'success',
      data: mockEmployees
    });
  }),

  http.post('/api/employees', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 'success',
      data: { ...body, id: 'new-id' }
    }, { status: 201 });
  })
];
```

**Database Mocking:**
```typescript
// Use test database
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_TEST_URL }
  }
});

beforeEach(async () => {
  // Clean database
  await prisma.employee.deleteMany();
});
```

## CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Test Commands

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# Specific file
npm test -- EmployeeCard.test.tsx

# Update snapshots
npm test -- -u
```

## Best Practices

- Write tests before or with code (TDD)
- Test behavior, not implementation
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies
- Clean up after tests
- Run tests in CI/CD
- Maintain high coverage
- Test edge cases
- Test error conditions

## Resources

- Testing guide: `docs/TESTING.md`
- Test utils: `src/test-utils/`
- Mock data: `src/mocks/`
