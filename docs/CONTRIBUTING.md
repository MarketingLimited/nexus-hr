# Contributing to Nexus HR

Thank you for considering contributing to Nexus HR! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 16
- Docker (optional, for containerized development)
- Git

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/nexus-hr.git
   cd nexus-hr
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/MarketingLimited/nexus-hr.git
   ```

4. **Install dependencies**:
   ```bash
   # Frontend
   npm install

   # Backend
   cd server && npm install
   ```

5. **Set up environment variables**:
   ```bash
   # Backend
   cp server/.env.example server/.env
   # Edit server/.env with your local configuration
   ```

6. **Set up the database**:
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

7. **Start development servers**:
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   cd server && npm run dev
   ```

8. **Verify setup**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001/api

---

## Development Workflow

### Branching Strategy

We use **Git Flow** branching model:

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `release/*`: Release preparation

### Creating a Feature Branch

```bash
# Update your local develop branch
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on latest develop
git checkout feature/your-feature-name
git rebase upstream/develop

# Resolve conflicts if any
# Then push (force with lease for safety)
git push origin feature/your-feature-name --force-with-lease
```

---

## Coding Standards

### TypeScript/JavaScript

- **Style Guide**: Follow Airbnb JavaScript Style Guide
- **Linting**: ESLint (run `npm run lint`)
- **Formatting**: Prettier (automatic on save)
- **Type Safety**: Avoid `any` types, use proper TypeScript types

### Code Quality Principles

1. **SOLID Principles**: Follow SOLID design principles
2. **DRY**: Don't Repeat Yourself
3. **YAGNI**: You Aren't Gonna Need It
4. **KISS**: Keep It Simple, Stupid
5. **Separation of Concerns**: Clear component/module boundaries

### Naming Conventions

#### Variables and Functions
```typescript
// Use camelCase
const userName = 'John';
function calculateTotal() {}

// Boolean variables start with is/has/can
const isActive = true;
const hasPermission = false;
const canEdit = true;
```

#### Components
```typescript
// Use PascalCase
function EmployeeList() {}
const LoginForm = () => {};
```

#### Constants
```typescript
// Use UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

#### Files
```
// Components: PascalCase.tsx
LoginForm.tsx
EmployeeList.tsx

// Utilities: camelCase.ts
apiClient.ts
formatters.ts

// Tests: [name].test.ts
LoginForm.test.tsx
apiClient.test.ts
```

### Component Structure

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';

// 1. Type definitions
interface Props {
  userId: string;
  onUpdate?: () => void;
}

// 2. Component definition
export function UserProfile({ userId, onUpdate }: Props) {
  // 3. Hooks
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 4. Event handlers
  const handleUpdate = async () => {
    setLoading(true);
    // Logic here
    setLoading(false);
    onUpdate?.();
  };

  // 5. Render
  return (
    <div className="user-profile">
      {/* JSX */}
    </div>
  );
}
```

### Backend Structure

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// 1. Type definitions
interface CreateEmployeeBody {
  firstName: string;
  lastName: string;
  email: string;
}

// 2. Controller function
export const createEmployee = async (req: Request, res: Response) => {
  try {
    // 3. Input validation (via middleware)
    const data: CreateEmployeeBody = req.body;

    // 4. Business logic
    const employee = await prisma.employee.create({
      data,
    });

    // 5. Response
    res.status(201).json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    // 6. Error handling
    throw new AppError('Failed to create employee', 500);
  }
};
```

---

## Testing Guidelines

### Test Coverage Requirements

- **Overall**: 80% minimum
- **Critical Paths**: 90% minimum (auth, payroll, etc.)
- **New Features**: 90% minimum
- **Bug Fixes**: Include regression test

### Testing Best Practices

1. **Test Naming**: Use descriptive names
   ```typescript
   it('should login user with valid credentials')
   it('should throw error when password is incorrect')
   ```

2. **Test Structure**: Arrange-Act-Assert (AAA)
   ```typescript
   it('should calculate total correctly', () => {
     // Arrange
     const items = [{ price: 10 }, { price: 20 }];

     // Act
     const total = calculateTotal(items);

     // Assert
     expect(total).toBe(30);
   });
   ```

3. **Mock External Dependencies**:
   ```typescript
   vi.mock('../api', () => ({
     fetchUser: vi.fn(),
   }));
   ```

4. **Test One Thing**: Each test should verify one behavior

5. **Avoid Implementation Details**: Test behavior, not implementation

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Commit Message Guidelines

We follow the **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (deps, config, etc.)
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(auth): add password reset functionality

Implement password reset flow with email verification.
- Add reset token generation
- Create reset email template
- Add reset password API endpoint

Closes #123

---

fix(leave): correct leave balance calculation

The previous calculation didn't account for half-day leaves.
Now properly handles decimal days.

Fixes #456

---

docs(api): update authentication documentation

Add examples for JWT token refresh.
```

### Commit Message Rules

1. Use imperative mood ("add" not "added")
2. Keep subject line under 50 characters
3. Capitalize subject line
4. Don't end subject with period
5. Separate subject from body with blank line
6. Wrap body at 72 characters
7. Use body to explain what and why, not how

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest develop
2. **Run tests**: `npm test` (both frontend and backend)
3. **Run linter**: `npm run lint`
4. **Run type check**: `tsc --noEmit`
5. **Update documentation** if needed
6. **Add tests** for new features

### PR Title

Follow commit message format:
```
feat(employees): add bulk import functionality
fix(leave): correct balance calculation bug
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated Checks**: CI must pass
   - Linting
   - Type checking
   - Tests
   - Build

2. **Code Review**: At least 1 approval required
   - Review comments must be addressed
   - Discussions must be resolved

3. **Merge**: Squash and merge into develop

---

## Documentation

### Documentation Requirements

1. **Code Comments**:
   - Complex logic
   - Non-obvious decisions
   - TODO items with issue numbers

2. **API Documentation**:
   - Update `docs/API.md` for API changes
   - Include request/response examples
   - Document error cases

3. **README Updates**:
   - Update if adding dependencies
   - Update if changing setup process

4. **Architecture Documentation**:
   - Update for significant architectural changes
   - Document new patterns or approaches

### Documentation Style

- Use clear, concise language
- Include examples
- Keep documentation up-to-date with code
- Use proper markdown formatting

---

## Bug Reports

### Before Submitting a Bug Report

1. **Search existing issues** to avoid duplicates
2. **Update to latest version** to see if bug still exists
3. **Collect information**:
   - Node.js version
   - npm version
   - OS and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs if applicable

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable

## Environment
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Node.js version: [e.g. 18.0.0]
- npm version: [e.g. 9.0.0]

## Additional Context
Any other relevant information
```

---

## Feature Requests

### Before Submitting

1. **Search existing issues** to avoid duplicates
2. **Clarify the need** and use case
3. **Consider alternatives**

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Mockups, examples, related features, etc.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

---

## Getting Help

### Resources

- **Documentation**: `/docs` directory
- **API Docs**: `docs/API.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Security**: `docs/SECURITY.md`

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Request Comments**: Code-specific discussions

---

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes for significant contributions
- Project README

Thank you for contributing to Nexus HR!
