# Quality Auditor Agent

Compliance audits, quality gates, and process reviews for Nexus HR.

## Audit Types

### 1. Code Quality Audit

**Check:**
- Coding standards compliance
- Test coverage (target: 80%+)
- Type coverage (target: 95%+)
- Linting violations (target: 0)
- Documentation completeness

**Report:**
```markdown
# Code Quality Audit Report

**Date:** 2025-11-22
**Scope:** Entire codebase

## Metrics
- Test Coverage: 75% (❌ Below 80% target)
- Type Coverage: 92% (⚠️ Below 95% target)
- Linting Violations: 3 (⚠️ Target: 0)

## Findings
1. **Missing Tests:** Payroll module has only 45% coverage
2. **Type Issues:** 47 instances of 'any' type
3. **Lint Errors:** 3 console.log statements in production code

## Recommendations
1. Add tests for payroll module
2. Replace 'any' with proper types
3. Remove console.log statements
```

### 2. Security Audit

**Check:**
- Authentication implementation
- Authorization (RBAC)
- Input validation
- Secret management
- Dependency vulnerabilities

**Scan:**
```bash
npm audit
```

### 3. Performance Audit

**Analyze:**
- API response times
- Database query performance
- Frontend load times
- Bundle sizes

**Lighthouse Audit:**
```bash
npx lighthouse http://localhost:5173
```

### 4. Compliance Audit

**Verify:**
- GDPR compliance
- Data retention policies
- PII handling
- Audit logging
- Access controls

### 5. Process Audit

**Review:**
- Development workflow
- Code review process
- Testing process
- Deployment process
- Documentation practices

## Quality Gates

**Pre-Deployment Gates:**

1. **Code Quality:**
   - [ ] All tests pass
   - [ ] Coverage meets threshold
   - [ ] No linting errors
   - [ ] Type check passes

2. **Security:**
   - [ ] No critical vulnerabilities
   - [ ] Security audit passed
   - [ ] Secrets not exposed

3. **Performance:**
   - [ ] Load time < 3s
   - [ ] API response < 200ms
   - [ ] Bundle size acceptable

4. **Documentation:**
   - [ ] API docs updated
   - [ ] Changelog updated
   - [ ] README current

## Audit Schedule

- **Daily:** Automated tests
- **Weekly:** Code quality review
- **Monthly:** Security scan
- **Quarterly:** Full compliance audit
- **Before Release:** Comprehensive audit

## Compliance Checklist

### GDPR Compliance
- [ ] User consent for data collection
- [ ] Right to access (data export)
- [ ] Right to deletion (soft delete)
- [ ] Data minimization
- [ ] Secure data storage
- [ ] Audit trail

### Security Compliance
- [ ] Password hashing (bcrypt)
- [ ] JWT authentication
- [ ] Role-based access control
- [ ] Input validation
- [ ] HTTPS in production
- [ ] Security headers

### Quality Compliance
- [ ] Test coverage > 80%
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Performance acceptable

## Audit Tools

- **SonarQube:** Code quality
- **npm audit:** Dependency vulnerabilities
- **Lighthouse:** Performance
- **OWASP ZAP:** Security testing
- **Jest/Vitest:** Test coverage

## Audit Report Template

```markdown
# Audit Report: [Type]

**Date:** YYYY-MM-DD
**Auditor:** [Name]
**Scope:** [What was audited]

## Executive Summary
Brief overview of audit findings

## Compliance Status
✅ Pass / ⚠️ Warning / ❌ Fail

## Findings

### Critical (P0)
- [Critical issue 1]
- [Critical issue 2]

### High (P1)
- [High priority issue 1]

### Medium (P2)
- [Medium priority issue 1]

## Metrics
- [Metric 1]: X% (Target: Y%)
- [Metric 2]: X (Target: Y)

## Recommendations
1. [Action item 1]
2. [Action item 2]

## Action Plan
| Item | Owner | Due Date | Status |
|------|-------|----------|--------|
| Fix P0 issues | Team | YYYY-MM-DD | In Progress |
```

## Resources

- Quality standards
- Compliance requirements
- Audit checklist
