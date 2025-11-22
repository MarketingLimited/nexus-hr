# Nexus HR - خريطة المعمارية للـ Agents

## Purpose

نظام إدارة موارد بشرية متكامل (Full-stack HR Management System) يوفر إدارة شاملة للموظفين، الحضور، الإجازات، الرواتب، التقييمات، والوثائق. المشروع عبارة عن **monorepo** يحتوي على frontend وbackend مفصولين مع قاعدة بيانات PostgreSQL.

## Owned Scope

- **Frontend**: تطبيق React SPA في `src/`
- **Backend**: REST API في `server/`
- **Database**: Prisma schema وmigrations في `server/prisma/`
- **Deployment**: Docker compose وKubernetes configs في `k8s/`
- **Documentation**: وثائق تقنية ومستخدمين في `docs/`
- **Monitoring**: Prometheus/Grafana setup في `monitoring/`

## Key Files & Entry Points

### Frontend
- `src/main.tsx` - نقطة دخول التطبيق
- `src/App.tsx` - Root component مع routing
- `package.json` - Dependencies: React 18.3, Vite, TailwindCSS, shadcn/ui, TanStack Query
- `vite.config.ts` - Vite build configuration

### Backend
- `server/src/index.ts` - Express server entry point
- `server/package.json` - Dependencies: Express, Prisma, JWT, bcrypt
- `server/prisma/schema.prisma` - Database schema (Users, Employees, Attendance, etc.)

### Infrastructure
- `docker-compose.yml` - Development environment (PostgreSQL)
- `docker-compose.dev.yml` - Development with hot reload
- `k8s/deployment.yaml` - Kubernetes deployment manifests
- `nginx.conf` - Reverse proxy configuration

### Configuration
- `.env.example` - Frontend environment variables template
- `server/.env.example` - Backend environment variables template
- `.env.production.example` - Production configuration

## Dependencies & Interfaces

### Frontend → Backend
- **Base URL**: `http://localhost:3001/api` (dev) عبر `VITE_API_URL`
- **Auth**: JWT token في `Authorization: Bearer <token>` header
- **Protocol**: REST API مع axios client في `src/services/`

### Backend → Database
- **Connection**: PostgreSQL via Prisma ORM
- **URL**: `postgresql://user:pass@localhost:5432/nexus_hr`
- **Migrations**: `npx prisma migrate dev`

### External Services
- **MSW (Mock Service Worker)**: للتطوير بدون backend (يُفعّل عبر `VITE_USE_MSW=true`)
- **Monitoring**: Prometheus metrics على `http://localhost:9090`

## Local Rules / Patterns

### Architecture Style
- **Monorepo** مع workspaces منفصلة لـ frontend/backend
- **REST API** - لا GraphQL
- **JWT Authentication** مع bcrypt password hashing
- **RBAC**: 4 أدوار (ADMIN, HR, MANAGER, EMPLOYEE)

### Code Organization
- **Frontend**: Feature-based modules في `src/components/` (auth, attendance, payroll, etc.)
- **Backend**: Layered architecture (routes → controllers → Prisma)
- **Shared Types**: TypeScript types مشتركة بين frontend/backend

### Naming Conventions
- **Files**: camelCase للملفات، PascalCase للمكونات
- **Routes**: `/api/<resource>` (مثلاً `/api/employees`, `/api/attendance`)
- **Database**: snake_case للجداول (users, attendance_records, etc.)

### Testing Strategy
- **Frontend**: Vitest + React Testing Library
- **Backend**: Vitest لـ unit tests
- **Commands**: `npm test` في root أو `cd server && npm test`

## How to Run / Test

### Initial Setup (5 دقائق)
```bash
# 1. استنساخ المشروع
git clone <YOUR_GIT_URL>
cd nexus-hr

# 2. تشغيل PostgreSQL
docker-compose up -d postgres

# 3. إعداد Backend
cd server
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 4. إعداد Frontend (في terminal جديد)
cd ..
npm install --legacy-peer-deps
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Database UI**: `cd server && npm run prisma:studio` → http://localhost:5555

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexushr.com | admin123 |
| Employee | john.doe@nexushr.com | password123 |

### Testing
```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test

# Coverage
npm run test:coverage
```

### Docker Deployment
```bash
# تشغيل كل الخدمات
docker-compose up -d

# عرض logs
docker-compose logs -f

# إيقاف الخدمات
docker-compose down
```

## Common Tasks for Agents

### 1. إضافة Feature جديدة
- **Frontend**: أنشئ component في `src/components/<feature>/`
- **Backend**: أضف route في `server/src/routes/`, controller في `server/src/controllers/`
- **Database**: عدّل `server/prisma/schema.prisma` ثم `npx prisma migrate dev`

### 2. إصلاح Bug
- ابحث في `src/` للـ frontend issues، `server/src/` للـ backend
- تحقق من `docs/TROUBLESHOOTING.md` للمشاكل الشائعة
- راجع logs: `docker-compose logs backend` أو browser console

### 3. إضافة API Endpoint جديد
- أنشئ route في `server/src/routes/<module>Routes.ts`
- أنشئ controller في `server/src/controllers/<module>Controller.ts`
- أضف validation في `server/src/validators/`
- وثّق في `docs/API.md`

### 4. Database Migration
```bash
cd server
npx prisma migrate dev --name <migration_name>
npm run prisma:generate
```

### 5. إضافة Tests
- Frontend: `src/__tests__/<component>.test.tsx`
- Backend: `server/src/controllers/<controller>.test.ts`
- استخدم existing tests كtemplate

### 6. Deployment لـ Production
- راجع `docs/DEPLOYMENT.md`
- عدّل `.env.production`
- Build: `npm run build` (frontend), `cd server && npm run build`
- Deploy: `kubectl apply -f k8s/`

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **Frontend لا يتصل بـ Backend**
   - تأكد من `VITE_API_URL=http://localhost:3001/api` في `.env`
   - تحقق من CORS settings في `server/src/index.ts`

2. **Database Connection Errors**
   - تأكد من تشغيل PostgreSQL: `docker-compose up -d postgres`
   - تحقق من `DATABASE_URL` في `server/.env`

3. **MSW (Mock Data) لا يعمل**
   - فعّل MSW: `VITE_USE_MSW=true` في `.env`
   - تحقق من `src/mocks/browser.ts` initialization

4. **Prisma Generate Errors**
   - شغّل `cd server && npm run prisma:generate` بعد أي تغيير في schema
   - احذف `node_modules/.prisma` وأعد التشغيل

5. **Port Already in Use**
   - Frontend (5173): `lsof -ti:5173 | xargs kill`
   - Backend (3001): `lsof -ti:3001 | xargs kill`

### 📝 Best Practices

- **دائماً** اقرأ `docs/GETTING_STARTED.md` أولاً
- **لا تعدّل** `prisma/schema.prisma` مباشرة في production
- **استخدم** `npm run prisma:migrate` لتغييرات Database
- **اتبع** TypeScript strict mode - لا `any` types
- **اكتب** tests لكل feature جديد

### 🗺️ Agent Map (خريطة الـ Modules)

| Module | Path | Purpose | Agent File |
|--------|------|---------|------------|
| **Backend API** | `server/` | Express REST API | `server/agents.md` |
| ├─ Routes | `server/src/routes/` | API endpoints | `server/src/routes/agents.md` |
| ├─ Controllers | `server/src/controllers/` | Business logic | `server/src/controllers/agents.md` |
| ├─ Middleware | `server/src/middleware/` | Auth & validation | `server/src/middleware/agents.md` |
| └─ Prisma | `server/prisma/` | Database schema | `server/prisma/agents.md` |
| **Frontend** | `src/` | React SPA | `src/agents.md` |
| ├─ Components | `src/components/` | UI components | `src/components/agents.md` |
| ├─ Services | `src/services/` | API clients | `src/services/agents.md` |
| └─ Pages | `src/pages/` | Route pages | `src/pages/agents.md` |
| **K8s** | `k8s/` | Kubernetes deployment | `k8s/agents.md` |
| **Docs** | `docs/` | Documentation | `docs/agents.md` |

### 📚 Documentation Quick Links

- **Getting Started**: `docs/GETTING_STARTED.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Reference**: `docs/API.md`
- **Frontend Dev**: `docs/DEVELOPER_GUIDE_FRONTEND.md`
- **Backend Dev**: `docs/DEVELOPER_GUIDE_BACKEND.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
