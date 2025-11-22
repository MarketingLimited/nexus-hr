# Code Quality Agent

Code standards, quality metrics, and technical debt management for Nexus HR.

## Code Quality Standards

### 1. TypeScript Best Practices

**No any types:**
```typescript
// ❌ Bad
function processData(data: any) { }

// ✅ Good
function processData(data: Employee[]) { }
```

**Explicit return types:**
```typescript
// ❌ Bad
function getEmployee(id) { }

// ✅ Good
function getEmployee(id: string): Promise<Employee | null> { }
```

### 2. Naming Conventions

- **Variables/Functions:** camelCase
- **Classes/Interfaces:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** kebab-case or PascalCase (components)

### 3. Code Organization

```
src/
  components/       # Reusable UI components
    EmployeeCard/
      EmployeeCard.tsx
      EmployeeCard.test.tsx
      index.ts
  pages/           # Route pages
  hooks/           # Custom hooks
  services/        # API services
  utils/           # Utility functions
  types/           # Type definitions
```

### 4. DRY Principle

❌ **Bad:**
```typescript
const fullName1 = employee1.firstName + ' ' + employee1.lastName;
const fullName2 = employee2.firstName + ' ' + employee2.lastName;
```

✅ **Good:**
```typescript
function getFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`;
}
```

### 5. SOLID Principles

**Single Responsibility:**
```typescript
// ❌ Bad: Class does too much
class Employee {
  save() { }
  sendEmail() { }
  generateReport() { }
}

// ✅ Good: Separate responsibilities
class EmployeeRepository {
  save(employee: Employee) { }
}
class EmailService {
  send(to: string, subject: string) { }
}
```

### 6. Error Handling

```typescript
// Always handle errors
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else {
    // Handle unexpected error
    logger.error(error);
  }
}
```

### 7. Code Comments

```typescript
// Good comments explain WHY, not WHAT
// Calculate prorated salary based on employment start date
const proratedSalary = calculateProratedSalary(employee);

// Bad comment (obvious from code)
// Set firstName to employee.firstName
const firstName = employee.firstName;
```

### 8. Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**.eslintrc.js:**
```javascript
module.exports = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```

### 9. Code Complexity

**Cyclomatic Complexity:** Max 10
- Break down complex functions
- Extract logic into helpers
- Use early returns

### 10. Technical Debt

**Track Debt:**
```typescript
// TODO: Refactor to use service layer
// DEBT: Need proper error handling
// OPTIMIZE: This query causes N+1 problem
// FIXME: Race condition in concurrent requests
```

**Debt Register:**
```markdown
| Debt | Severity | Effort | Priority |
|------|----------|--------|----------|
| Refactor auth middleware | High | 2 days | P1 |
| Add proper logging | Medium | 1 day | P2 |
```

## Quality Metrics

Track:
- Test coverage (target: 80%+)
- Linting violations (target: 0)
- Type coverage (target: 95%+)
- Cyclomatic complexity (target: < 10)
- Duplicate code (target: < 5%)

## Tools

- **ESLint:** Linting
- **Prettier:** Code formatting
- **SonarQube:** Code quality analysis
- **TypeScript:** Type checking

## Resources

- Coding standards: `docs/CONTRIBUTING.md`
- Code review checklist
- Quality gates
