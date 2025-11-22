# Documentation Center - Technical & User Guides

## Purpose

مركز توثيق شامل لنظام Nexus HR يحتوي على أدلة تقنية للمطورين، أدلة مستخدمين، مراجع API، وguides للـ deployment وsecurity وtesting.

## Owned Scope

- **Developer Guides**: وثائق تقنية للمطورين (frontend، backend، architecture)
- **User Guides**: أدلة للمستخدمين النهائيين
- **API Documentation**: مرجع شامل للـ REST API endpoints
- **Deployment Guides**: تعليمات نشر التطبيق (Docker، K8s، production)
- **Best Practices**: Security، testing، performance guidelines
- **Troubleshooting**: حلول للمشاكل الشائعة

## Key Files & Entry Points

### Navigation & Index
- **`INDEX.md`** - Complete documentation index وnavigation hub

### Getting Started
- **`GETTING_STARTED.md`** - ⭐ Quick setup guide (5 minutes)
- **`ARCHITECTURE.md`** - System architecture overview
- **`FRONTEND_BACKEND_INTEGRATION.md`** - How frontend/backend communicate

### Developer Guides
- **`DEVELOPER_GUIDE_FRONTEND.md`** - React/TypeScript frontend development
- **`DEVELOPER_GUIDE_BACKEND.md`** - Node.js/Express backend development
- **`CONTRIBUTING.md`** - Contribution guidelines وcoding standards

### API & Technical Reference
- **`API.md`** - Complete REST API documentation
- **`TESTING.md`** - Testing strategies (unit، integration، E2E)
- **`PERFORMANCE.md`** - Performance optimization guide

### Deployment & Operations
- **`DEPLOYMENT.md`** - Production deployment (Docker، K8s، CI/CD)
- **`ROLLBACK.md`** - Rollback procedures وdisaster recovery
- **`TROUBLESHOOTING.md`** - Common issues وsolutions

### Security & Best Practices
- **`SECURITY.md`** - Security best practices وvulnerability prevention

### End User Documentation
- **`USER_GUIDE.md`** - Complete user guide للموظفين والمديرين

## Dependencies & Interfaces

### Documentation Format
- **Markdown**: جميع الملفات بصيغة `.md`
- **GitHub-Flavored Markdown**: Tables، code blocks، checkboxes
- **Navigation**: Internal links بين الملفات

### Target Audiences
1. **Developers** - Technical implementation guides
2. **DevOps** - Deployment وinfrastructure guides
3. **End Users** - Feature usage guides
4. **Managers** - System overview

## Local Rules / Patterns

### Documentation Structure
```markdown
# Page Title

Brief description.

## Table of Contents

- [Section 1](#section-1)

## Section 1

Content...

## Examples

```bash
npm install
```

## See Also

- [Related Doc](./related.md)
```

### Code Block Conventions
```markdown
```bash
# Shell commands
npm install
```

```typescript
// TypeScript code
const example = "value";
```
```

### Cross-References Pattern
```markdown
See [Getting Started](./GETTING_STARTED.md) for setup.
Refer to [API Documentation](./API.md#authentication) for auth.
```

## How to Run / Test

### Reading Documentation

```bash
# View locally
cd docs
cat GETTING_STARTED.md

# Or open in browser on GitHub
```

### Updating Documentation

```bash
# 1. Edit file
vim docs/DEVELOPER_GUIDE_FRONTEND.md

# 2. Commit
git add docs/
git commit -m "docs: update frontend guide"
git push
```

## Common Tasks for Agents

### 1. إضافة Documentation جديد

```bash
# 1. أنشئ file جديد
touch docs/NEW_FEATURE_GUIDE.md

# 2. أضف content

# 3. أضف link في INDEX.md

# 4. Commit
git add docs/
git commit -m "docs: add new feature guide"
```

### 2. تحديث API Documentation

```markdown
<!-- في docs/API.md -->

### New Endpoint

**POST** `/api/training`

Create a new training session.

**Request:**
```json
{
  "title": "React Training"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {...}
}
```
```

### 3. إضافة Troubleshooting Entry

```markdown
<!-- في docs/TROUBLESHOOTING.md -->

### Database Connection Timeout

**Problem:** Application cannot connect to database.

**Solution:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in `.env`
```

## Notes / Gotchas

### ⚠️ ملاحظات مهمة

1. **Documentation Sync**
   - حافظ على documentation متزامنة مع code
   - Update docs عند إضافة features

2. **Code Examples Must Work**
   - اختبر كل code example قبل commit

3. **No Sensitive Data**
   - لا تضع passwords أو tokens في docs

### 📝 Documentation Best Practices

- **Clear Titles**: Descriptive واضح
- **Step-by-Step**: للـ guides، use numbered steps
- **Examples**: Real، working code examples
- **Cross-References**: Link to related docs
- **Update Regularly**: Keep in sync with code

### Documentation Hierarchy

```
docs/
├── INDEX.md                          # Central navigation
├── GETTING_STARTED.md                # ⭐ Start here
├── ARCHITECTURE.md                   # High-level overview
├── DEVELOPER_GUIDE_FRONTEND.md       # For frontend devs
├── DEVELOPER_GUIDE_BACKEND.md        # For backend devs
├── API.md                            # For API consumers
├── DEPLOYMENT.md                     # For DevOps
├── USER_GUIDE.md                     # For end users
└── TROUBLESHOOTING.md                # For debugging
```

### 📚 مراجع

- **Documentation Index**: `docs/INDEX.md`
- **Project README**: `../README.md`
- **Backend README**: `../server/README.md`
- **K8s README**: `../k8s/README.md`
