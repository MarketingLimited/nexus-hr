# Claude Code Agents & Commands

Comprehensive AI agent framework for Nexus HR with 39 specialized agents and 13 slash commands.

## Overview

This framework provides specialized AI agents organized into 9 domains to enhance development workflow, maintain code quality, and ensure best practices.

## 📊 Agent Statistics

- **Total Agents:** 39
- **Slash Commands:** 13
- **Domains:** 9
- **Coverage:** Full-stack development, security, infrastructure, product, and operations

## 🤖 Specialized Agents by Domain

### 1. Architecture & Design (5 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **System Architect** | `architect.md` | Critical | System design, architecture decisions, design patterns |
| **System Designer** | `system-design.md` | High | Scalability, distributed systems, system integration |
| **API Designer** | `api-design.md` | High | REST API design, API standards, interface contracts |
| **Database Architect** | `db-architect.md` | Critical | Database design, schema modeling, data relationships |
| **Migration Specialist** | `migration-specialist.md` | High | Data migration, system migration, version upgrades |

### 2. Development (4 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **Frontend Developer** | `frontend-development.md` | High | React development, UI components, state management |
| **Backend Developer** | `backend-development.md` | High | API development, business logic, database operations |
| **Feature Builder** | `feature-builder.md` | High | End-to-end features, full-stack implementation, integration |
| **Technical Lead** | `tech-lead.md` | Critical | Technical decisions, team coordination, architecture review |

### 3. Quality & Testing (7 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **Test Generator** | `test-generator.md` | Critical | Generate tests, test automation, coverage improvement |
| **Test Engineer** | `test-engineer.md` | High | Test strategy, test frameworks, QA processes |
| **Testing Specialist** | `testing.md` | High | Test execution, test planning, bug verification |
| **Code Quality Analyst** | `code-quality.md` | High | Code standards, quality metrics, technical debt |
| **Code Reviewer** | `code-review.md` | High | PR reviews, code feedback, best practices |
| **Advanced Code Reviewer** | `code-reviewer.md` | High | Deep code analysis, security review, performance review |
| **Quality Auditor** | `auditor.md` | Medium | Quality audits, compliance checks, process review |

### 4. Security & Compliance (4 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **Security Auditor** | `security-audit.md` | Critical | Security scans, vulnerability detection, security review |
| **Application Security** | `application-security.md` | Critical | App security, auth/authz, input validation |
| **Security Engineer** | `security.md` | Critical | Security best practices, threat modeling, security architecture |
| **Compliance Specialist** | `compliance.md` | High | GDPR compliance, data privacy, regulatory compliance |

### 5. Infrastructure & Operations (4 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **DevOps Engineer** | `devops.md` | Critical | CI/CD, automation, deployment pipelines |
| **Cloud Infrastructure** | `cloud-infrastructure.md` | High | Cloud deployment, infrastructure as code, resource management |
| **Site Reliability Engineer** | `site-reliability.md` | Critical | Monitoring, incident response, system reliability |
| **Platform Integration** | `platform-integration.md` | Medium | Third-party integration, APIs, webhooks |

### 6. Performance & Data (5 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **Performance Monitor** | `performance-monitor.md` | High | Performance analysis, bottleneck detection, optimization |
| **Performance Engineer** | `performance.md` | High | Performance tuning, load testing, optimization strategies |
| **Database Optimization** | `database-optimization.md` | High | Query optimization, indexing, database performance |
| **Data Pipeline Engineer** | `data-pipeline.md` | Medium | ETL processes, data transformation, data workflows |
| **Machine Learning Engineer** | `machine-learning.md` | Low | ML models, AI features, predictive analytics |

### 7. Documentation (2 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **API Documentation** | `api-documenter.md` | High | API docs, OpenAPI specs, endpoint documentation |
| **Documentation Writer** | `documentation.md` | High | Technical docs, user guides, architecture docs |

### 8. Product & Strategy (4 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **Product Strategist** | `product-strategy.md` | High | Product roadmap, feature planning, requirements |
| **Growth Strategist** | `growth-strategy.md` | Medium | Growth planning, scaling strategy, market expansion |
| **UX Designer** | `user-experience.md` | High | UI/UX design, user research, usability |
| **Customer Support** | `customer-support.md` | Medium | User support, troubleshooting, training |

### 9. Specialized Operations (3 agents)

| Agent | File | Priority | Use Cases |
|-------|------|----------|-----------|
| **Deployment Validator** | `deployment-validator.md` | Critical | Deployment validation, pre-flight checks, release verification |
| **TypeScript Safety** | `type-safety.md` | High | Type improvements, TypeScript migration, type safety |

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
Use the [Agent Name] to [task description]

Examples:
- Use the Test Generation agent to create tests for EmployeeController
- Use the Security Audit agent to scan for vulnerabilities
- Use the Database Architect to design leave management schema
```

### Using Slash Commands

```
/command

Examples:
- /test
- /audit-security
- /migrate
```

### Agent Orchestration

See `ORCHESTRATION.md` for multi-agent workflows and coordination patterns.

## 📋 Recommended Workflows

### New Feature Development

1. `/` → Plan requirements
2. `product-strategy.md` → Define requirements
3. `architect.md` → Design architecture
4. `api-design.md` → Design API
5. `db-architect.md` → Design schema
6. `feature-builder.md` → Implement
7. `/generate-tests` → Create tests
8. `/review` → Code review
9. `/audit-security` → Security scan
10. `/document-api` → Update docs

### Pre-Deployment

1. `/test-coverage` → Ensure adequate coverage
2. `/audit-security` → Security scan
3. `/build` → Verify production build
4. `/validate-deployment` → Pre-flight checks
5. `/migrate` → Apply database migrations (if any)

### Performance Optimization

1. `/performance-check` → Identify bottlenecks
2. `performance-monitor.md` → Detailed analysis
3. Implement optimizations
4. `/test` → Verify nothing broke
5. Re-run performance check

### Security Hardening

1. `/audit-security` → Initial scan
2. `security-audit.md` → Detailed review
3. Fix identified issues
4. `/test` → Verify fixes
5. Re-run security audit

## 📁 Directory Structure

```
.claude/
├── README.md                    # This file
├── ORCHESTRATION.md             # Multi-agent workflows
├── agents-registry.json         # Agent metadata
├── agents/                      # Specialized agents (39)
│   ├── architect.md
│   ├── system-design.md
│   ├── api-design.md
│   ├── db-architect.md
│   ├── migration-specialist.md
│   ├── frontend-development.md
│   ├── backend-development.md
│   ├── feature-builder.md
│   ├── tech-lead.md
│   ├── test-generator.md
│   ├── test-engineer.md
│   ├── testing.md
│   ├── code-quality.md
│   ├── code-review.md
│   ├── code-reviewer.md
│   ├── auditor.md
│   ├── security-audit.md
│   ├── application-security.md
│   ├── security.md
│   ├── compliance.md
│   ├── devops.md
│   ├── cloud-infrastructure.md
│   ├── site-reliability.md
│   ├── platform-integration.md
│   ├── performance-monitor.md
│   ├── performance.md
│   ├── database-optimization.md
│   ├── data-pipeline.md
│   ├── machine-learning.md
│   ├── api-documenter.md
│   ├── documentation.md
│   ├── product-strategy.md
│   ├── growth-strategy.md
│   ├── user-experience.md
│   ├── customer-support.md
│   ├── deployment-validator.md
│   └── type-safety.md
└── commands/                    # Slash commands (13)
    ├── test.md
    ├── test-coverage.md
    ├── generate-tests.md
    ├── lint.md
    ├── check-types.md
    ├── review.md
    ├── build.md
    ├── validate-deployment.md
    ├── migrate.md
    ├── seed.md
    ├── document-api.md
    ├── audit-security.md
    └── performance-check.md
```

## 🎯 Agent Selection Quick Reference

| Need | Agent |
|------|-------|
| New Feature | product-strategy → architect → feature-builder |
| Bug Fix | auditor → backend/frontend-development → test-generator |
| Performance Issue | performance-monitor → performance → database-optimization |
| Security Concern | security-audit → application-security |
| Schema Change | db-architect → migration-specialist |
| Deployment | devops → deployment-validator → site-reliability |
| Integration | platform-integration → api-design |
| Documentation | documentation → api-documenter |
| Tests | test-generator → test-engineer |
| Code Review | code-review → code-reviewer |

## 📖 Related Documentation

- **Orchestration Guide:** `ORCHESTRATION.md`
- **Agent Registry:** `agents-registry.json`
- **Project Docs:** `../docs/`
- **Contributing Guide:** `../docs/CONTRIBUTING.md`
- **Architecture:** `../docs/ARCHITECTURE.md`

## 💡 Best Practices

1. **Be Specific:** Provide context (file paths, module names) when using agents
2. **Chain Commands:** Use slash commands in sequence for complex workflows
3. **Review Output:** Agents provide recommendations - review before applying
4. **Multi-Agent:** Use orchestration patterns for complex tasks
5. **Documentation:** Keep agent instructions current with project changes

## 🔄 Maintenance

- **Review quarterly:** Ensure agents align with current tech stack
- **Update patterns:** Add new best practices as they emerge
- **Track usage:** Monitor which agents are most/least useful
- **Gather feedback:** Improve based on team experience

---

**Created:** 2025-11-22
**Version:** 2.0.0
**Agents:** 39
**Commands:** 13
**Project:** Nexus HR Management System
