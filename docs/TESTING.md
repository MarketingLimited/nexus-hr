# Testing Guide - Nexus HR

This guide covers testing strategies, frameworks, and best practices for the Nexus HR platform.

## Table of Contents

- [Overview](#overview)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [E2E Testing](#e2e-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

---

## Overview

Nexus HR uses a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test full user workflows
- **Accessibility Tests**: Ensure WCAG compliance

### Test Coverage Goals

- **Frontend**: 80% overall, 90% for auth components
- **Backend**: 90% overall
- **Critical Paths**: 100% coverage

---

## Frontend Testing

### Framework & Tools

- **Vitest**: Fast unit test runner
- **Testing Library**: Component testing
- **MSW**: API mocking
- **jest-axe**: Accessibility testing

### Running Frontend Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- LoginForm.test.tsx
```

### Test File Structure

```typescript
// src/components/auth/__tests__/LoginForm.test.tsx
import { render, screen, userEvent } from '@/test-utils';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Assertions...
  });
});
```

### Testing Hooks

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { wrapper } from '@/test-utils';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.login('test@example.com', 'password');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

---

## Backend Testing

### Framework & Tools

- **Vitest**: Test runner
- **Supertest**: HTTP testing
- **Test Database**: Isolated PostgreSQL database

### Setup

```bash
# Install test dependencies
cd server
npm install --save-dev vitest supertest @types/supertest

# Create test database
createdb nexus_hr_test

# Set test environment
cp .env.test.example .env.test
```

### Running Backend Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.ts
```

### Test File Structure

```typescript
// server/src/__tests__/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../config/database';

describe('Auth API', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    });
  });
});
```

### Integration Tests

```typescript
// server/src/__tests__/integration/employee-flow.test.ts
describe('Employee Management Flow', () => {
  let authToken: string;
  let employeeId: string;

  it('should create employee', async () => {
    const response = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Developer',
        department: 'Engineering',
        location: 'Remote',
        hireDate: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    employeeId = response.body.data.id;
  });

  it('should get employee details', async () => {
    const response = await request(app)
      .get(`/api/employees/${employeeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('john@example.com');
  });
});
```

---

## E2E Testing

### Setup with Playwright

```bash
npm install --save-dev @playwright/test

# Install browsers
npx playwright install
```

### E2E Test Example

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('should complete login flow', async ({ page }) => {
  await page.goto('http://localhost:8080');

  await page.fill('[name="email"]', 'admin@nexushr.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});

test('should create employee', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:8080/login');
  // ... login flow

  await page.click('text=Employees');
  await page.click('text=Add Employee');

  await page.fill('[name="firstName"]', 'Jane');
  await page.fill('[name="lastName"]', 'Smith');
  await page.fill('[name="email"]', 'jane@example.com');

  await page.click('button:has-text("Save")');

  await expect(page.locator('.toast')).toContainText('Employee created');
});
```

---

## Writing Tests

### Best Practices

1. **Arrange-Act-Assert Pattern**

```typescript
it('should update employee', async () => {
  // Arrange
  const employee = await createTestEmployee();

  // Act
  const response = await request(app)
    .put(`/api/employees/${employee.id}`)
    .send({ position: 'Senior Developer' });

  // Assert
  expect(response.status).toBe(200);
  expect(response.body.data.position).toBe('Senior Developer');
});
```

2. **Test Isolation**: Each test should be independent

```typescript
beforeEach(async () => {
  // Clean database before each test
  await prisma.employee.deleteMany({});
});
```

3. **Descriptive Test Names**

```typescript
// Good
it('should return 401 when token is expired', async () => {});

// Bad
it('test auth', async () => {});
```

4. **Mock External Dependencies**

```typescript
import { vi } from 'vitest';

vi.mock('../services/emailService', () => ({
  sendEmail: vi.fn(),
}));
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

---

## CI/CD Integration

Tests run automatically on:

- **Every Push**: Unit tests run
- **Pull Requests**: Full test suite + coverage check
- **Before Deploy**: E2E tests run

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: |
          npm ci
          cd server && npm ci

      - name: Run frontend tests
        run: npm test -- --coverage

      - name: Run backend tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          cd server
          npx prisma migrate deploy
          npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Troubleshooting

### Common Issues

**Tests timing out**
```bash
# Increase timeout in vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000,
  },
});
```

**Database connection errors**
```bash
# Ensure test database exists
createdb nexus_hr_test

# Check DATABASE_URL in .env.test
```

**MSW not intercepting requests**
```typescript
// Ensure MSW is initialized in test setup
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)
