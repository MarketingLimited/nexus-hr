# Claude Code Agents & Commands

This directory contains specialized AI agents and slash commands for the Nexus HR project to enhance development workflow and code quality.

## Overview

These agents are designed to work with Claude Code to automate common development tasks, maintain code quality, and ensure best practices.

## 🤖 Specialized Agents

### Tier 1: Critical Agents (Use Daily)

#### 1. **Test Generation Agent** (`agents/test-generator.md`)
- **Purpose**: Generate comprehensive tests for frontend and backend
- **When to use**: When adding new features or components without tests
- **Capabilities**:
  - Generate React component tests with RTL
  - Generate API endpoint integration tests
  - Create accessibility tests (jest-axe)
  - Generate test mocks and fixtures

#### 2. **API Documentation Agent** (`agents/api-documenter.md`)
- **Purpose**: Auto-generate and maintain API documentation
- **When to use**: After creating/updating API endpoints
- **Capabilities**:
  - Extract endpoint info from routes/controllers
  - Generate OpenAPI/Swagger specs
  - Create request/response examples
  - Update docs/API.md

#### 3. **Database Migration Agent** (`agents/database-migration.md`)
- **Purpose**: Safely manage Prisma database migrations
- **When to use**: Before making schema changes
- **Capabilities**:
  - Validate schema changes
  - Detect breaking changes
  - Generate safe migrations
  - Provide rollback procedures

#### 4. **Type Safety Agent** (`agents/type-safety.md`)
- **Purpose**: Improve TypeScript coverage and eliminate `any` types
- **When to use**: During code reviews or refactoring
- **Capabilities**:
  - Find and replace `any` types
  - Add missing type annotations
  - Create shared types
  - Generate type guards

### Tier 2: Important Agents (Use Weekly)

#### 5. **Deployment Validator Agent** (`agents/deployment-validator.md`)
- **Purpose**: Validate deployment readiness
- **When to use**: Before deploying to staging/production
- **Capabilities**:
  - Validate environment variables
  - Check build success
  - Verify migrations
  - Run health checks

#### 6. **Security Audit Agent** (`agents/security-audit.md`)
- **Purpose**: Identify security vulnerabilities
- **When to use**: Before releases, during security reviews
- **Capabilities**:
  - Scan for exposed secrets
  - Check authentication/authorization
  - Validate input sanitization
  - Audit dependencies

#### 7. **Code Review Agent** (`agents/code-review.md`)
- **Purpose**: Automated code review assistance
- **When to use**: On pull requests, before merging
- **Capabilities**:
  - Check coding standards
  - Identify bugs and edge cases
  - Verify test coverage
  - Suggest improvements

#### 8. **Performance Monitor Agent** (`agents/performance-monitor.md`)
- **Purpose**: Identify and fix performance issues
- **When to use**: During optimization sprints
- **Capabilities**:
  - Analyze bundle sizes
  - Detect unnecessary re-renders
  - Optimize database queries
  - Find N+1 problems

## ⚡ Slash Commands

Quick commands for common development tasks:

### Testing
- `/test` - Run full test suite (frontend + backend)
- `/test-coverage` - Run tests with coverage report
- `/generate-tests` - Generate tests for specific files

### Code Quality
- `/lint` - Run ESLint on entire codebase
- `/check-types` - TypeScript type checking
- `/review` - Perform code review on recent changes

### Build & Deploy
- `/build` - Build production bundles
- `/validate-deployment` - Pre-deployment validation

### Database
- `/migrate` - Create and apply Prisma migrations
- `/seed` - Seed database with test data

### Documentation
- `/document-api` - Generate/update API documentation

### Security & Performance
- `/audit-security` - Run security audit
- `/performance-check` - Analyze performance

## 🚀 How to Use

### Using Agents Directly

```
Use the Test Generation agent to create tests for EmployeeController
```

Claude will load the specialized agent and execute the task following the agent's guidelines.

### Using Slash Commands

```
/test
```

Claude will execute the predefined command and report results.

### Combining Agents and Commands

```
/test-coverage

# After seeing low coverage:
Use the Test Generation agent to improve coverage for the Attendance module
```

## 📋 Recommended Workflows

### Adding a New Feature

1. Develop the feature
2. `/lint` - Check code style
3. `/check-types` - Verify type safety
4. Use Test Generation agent for tests
5. `/test` - Verify all tests pass
6. `/review` - Code review check
7. `/document-api` - Update docs (if API changes)

### Before Deployment

1. `/test-coverage` - Ensure adequate coverage
2. `/audit-security` - Security scan
3. `/build` - Verify production build
4. `/validate-deployment` - Pre-flight checks
5. `/migrate` - Apply database migrations (if any)

### Performance Optimization

1. `/performance-check` - Identify bottlenecks
2. Use Performance Monitor agent for detailed analysis
3. Implement optimizations
4. `/test` - Ensure nothing broke
5. Re-run performance check to verify improvements

### Security Hardening

1. `/audit-security` - Initial scan
2. Use Security Audit agent for detailed review
3. Fix identified issues
4. `/test` - Verify fixes
5. Re-run security audit

## 📁 Directory Structure

```
.claude/
├── README.md                           # This file
├── agents/                             # Specialized AI agents
│   ├── test-generator.md              # Test generation
│   ├── api-documenter.md              # API documentation
│   ├── database-migration.md          # Database migrations
│   ├── type-safety.md                 # TypeScript improvements
│   ├── deployment-validator.md        # Deployment checks
│   ├── security-audit.md              # Security scanning
│   ├── code-review.md                 # Code review
│   └── performance-monitor.md         # Performance optimization
└── commands/                           # Slash commands
    ├── test.md
    ├── test-coverage.md
    ├── build.md
    ├── lint.md
    ├── check-types.md
    ├── migrate.md
    ├── seed.md
    ├── audit-security.md
    ├── review.md
    ├── generate-tests.md
    ├── performance-check.md
    ├── document-api.md
    └── validate-deployment.md
```

## 🎯 Agent Priority by Task

**Need tests?** → Test Generation Agent
**API changes?** → API Documentation Agent
**Schema changes?** → Database Migration Agent
**Type errors?** → Type Safety Agent
**Deploying?** → Deployment Validator Agent
**Security concerns?** → Security Audit Agent
**Code review?** → Code Review Agent
**Performance issues?** → Performance Monitor Agent

## 📖 Related Documentation

- **Project Docs**: `docs/`
- **Contributing Guide**: `docs/CONTRIBUTING.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Testing Guide**: `docs/TESTING.md`
- **Security Guide**: `docs/SECURITY.md`
- **Performance Guide**: `docs/PERFORMANCE.md`

## 💡 Tips

1. **Be Specific**: When using agents, provide context (file paths, module names)
2. **Chain Commands**: Use slash commands in sequence for complex workflows
3. **Review Agent Output**: Agents provide recommendations, review before applying
4. **Update Agents**: Keep agent instructions current with project changes
5. **Custom Commands**: Add project-specific commands as needed

## 🔄 Maintenance

- **Review quarterly**: Ensure agents align with current tech stack
- **Update with new patterns**: Add new best practices as they emerge
- **Archive outdated agents**: Remove agents for deprecated features
- **Gather feedback**: Track which agents are most/least useful

## 📊 Success Metrics

Track these to measure agent effectiveness:

- Test coverage trend
- Security vulnerabilities found
- Deployment success rate
- Code review time reduction
- Performance improvements
- Documentation completeness

---

**Created**: 2025-11-22
**Last Updated**: 2025-11-22
**Project**: Nexus HR Management System
**Version**: 1.0.0
