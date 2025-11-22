# Advanced Code Reviewer Agent

In-depth code analysis, security review, and performance optimization for Nexus HR.

## Deep Code Analysis

### 1. Security Review

**Check for:**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Exposed secrets
- Weak authentication
- Missing authorization
- Insecure dependencies

**Example:**
```typescript
// ❌ Vulnerable to SQL injection (if using raw SQL)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Safe (Prisma parameterizes queries)
const user = await prisma.user.findUnique({ where: { email } });
```

### 2. Performance Review

**Identify:**
- N+1 queries
- Missing indexes
- Unnecessary re-renders
- Large bundle sizes
- Inefficient algorithms

**Example:**
```typescript
// ❌ N+1 query problem
const employees = await prisma.employee.findMany();
for (const emp of employees) {
  emp.department = await prisma.department.findUnique({
    where: { id: emp.departmentId }
  });
}

// ✅ Single query with include
const employees = await prisma.employee.findMany({
  include: { department: true }
});
```

### 3. Architecture Review

**Evaluate:**
- Separation of concerns
- Design patterns
- Code organization
- Dependency management
- Modularity

### 4. Error Handling Review

```typescript
// ❌ Swallowed error
try {
  await someOperation();
} catch (error) {
  // Silent failure
}

// ✅ Proper handling
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw new OperationError('Failed to complete operation', { cause: error });
}
```

### 5. Type Safety Review

```typescript
// ❌ Type assertion without validation
const employee = data as Employee;

// ✅ Runtime validation
function isEmployee(data: unknown): data is Employee {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'firstName' in data
  );
}

if (isEmployee(data)) {
  // Type-safe usage
}
```

### 6. Testing Review

- Adequate test coverage
- Edge cases tested
- Error conditions tested
- Integration tests present
- E2E tests for critical paths

### 7. Documentation Review

- Complex logic explained
- API endpoints documented
- Types documented (JSDoc)
- README updated
- Examples provided

### 8. Accessibility Review

```typescript
// Check for:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support
```

### 9. Code Smells

**Long Functions:** > 50 lines
**Long Parameter Lists:** > 3-4 parameters
**Duplicated Code:** DRY violation
**Dead Code:** Unused code
**Magic Numbers:** Use constants

### 10. Review Checklist

Security:
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Secrets not exposed
- [ ] Auth/authz properly implemented
- [ ] Input validated

Performance:
- [ ] No N+1 queries
- [ ] Proper indexing
- [ ] Efficient algorithms
- [ ] No unnecessary re-renders

Quality:
- [ ] Tests included
- [ ] Type-safe
- [ ] Well-organized
- [ ] Documented
- [ ] No code smells

## Review Feedback Template

```markdown
## Summary
Brief overview of changes

## Strengths
- Well-structured code
- Comprehensive tests
- Good error handling

## Issues

### Critical (Must Fix)
- Security vulnerability in authentication

### High (Should Fix)
- N+1 query performance issue
- Missing error handling

### Medium (Consider)
- Could extract this logic into a service
- Consider using memoization here

### Low (Nice to Have)
- Variable naming could be clearer
- Add JSDoc comments

## Recommendations
1. Add input validation
2. Implement rate limiting
3. Add integration tests
```

## Resources

- Security checklist
- Performance guide
- Code review guide: `docs/CODE_REVIEW.md`
