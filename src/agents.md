# Frontend Application - Nexus HR Client

## Purpose

تطبيق React SPA (Single Page Application) لنظام إدارة الموارد البشرية. يوفر واجهة مستخدم حديثة وسريعة الاستجابة لإدارة الموظفين، الحضور، الإجازات، التقييمات، والرواتب مع دعم offline وPWA capabilities.

## Owned Scope

- **UI Components**: مكونات React قابلة لإعادة الاستخدام في `components/`
- **Pages/Routes**: صفحات التطبيق في `pages/`
- **API Services**: طبقة التواصل مع Backend في `services/`
- **State Management**: React Query للـ server state، Context API للـ local state
- **Hooks**: Custom React hooks في `hooks/`
- **Styling**: Tailwind CSS + shadcn/ui components
- **Offline Support**: Service Worker + IndexedDB في `mocks/` و`services/offlineService.ts`

## Key Files & Entry Points

### Core Files
- **`main.tsx`** - نقطة دخول التطبيق، MSW initialization، Service Worker registration
- **`App.tsx`** - Root component مع routing configuration
- **`package.json`** - Dependencies: React 18.3، Vite 5.4، TailwindCSS 3.4، shadcn/ui
- **`vite.config.ts`** - Vite build configuration، path aliases (`@/`)
- **`index.html`** - HTML template

### Providers & Contexts
- **`providers/QueryProvider.tsx`** - TanStack Query (React Query) setup
- **`contexts/AuthContext.tsx`** - Authentication state management (user، login، logout)

### Routing & Pages
- **`pages/Index.tsx`** - Dashboard الرئيسية
- **`pages/Employees.tsx`** - قائمة الموظفين
- **`pages/EmployeeProfile.tsx`** - تفاصيل موظف
- **`pages/Attendance.tsx`** - نظام الحضور
- **`pages/Performance.tsx`** - التقييمات والأهداف
- **`pages/LeaveManagement.tsx`** - إدارة الإجازات
- **`pages/Payroll.tsx`** - الرواتب

### API Services (Backend Communication)
- **`services/api.ts`** - Axios instance configuration، interceptors
- **`services/authService.ts`** - Login، register، profile
- **`services/attendanceService.ts`** - Clock-in/out، attendance records
- **`services/performanceService.ts`** - Reviews، goals، feedback

### UI Component Library
- **`components/ui/`** - shadcn/ui primitives (Button، Dialog، Input، Table، etc.)
- **`components/layout/`** - Layout components (Header، Sidebar، AppLayout)
- **`components/auth/`** - Login، Register forms
- **`components/employees/`** - Employee management UI

### Custom Hooks
- **`hooks/useAuth.ts`** - Authentication hooks
- **`hooks/useAttendance.ts`** - Attendance data management
- **`hooks/usePerformance.ts`** - Performance data management
- **`hooks/useEmployees.ts`** - Employee data management

### Configuration
- **`.env.example`** - Environment variables template:
  - `VITE_API_URL` - Backend API URL (default: `http://localhost:3001/api`)
  - `VITE_USE_MSW` - Enable/disable MSW mocking (`true`/`false`)

## Dependencies & Interfaces

### Backend Communication
- **Base URL**: `VITE_API_URL` من `.env` (default: `http://localhost:3001/api`)
- **HTTP Client**: Axios 1.13.2
- **Auth Token**: يُحفظ في `localStorage` (`auth_token`)
- **Interceptor**: في `services/api.ts` يضيف `Authorization: Bearer <token>` تلقائياً

### State Management
- **Server State**: TanStack Query v5.83 (React Query)
- **Local State**: React Context API (AuthContext)
- **Form State**: React Hook Form v7.53 + Zod validation

### UI Framework
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4
- **Icons**: lucide-react
- **Charts**: Recharts 2.12

## Local Rules / Patterns

### Component Structure
```typescript
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/useEmployees';

interface MyComponentProps {
  // Props definition
}

export const MyComponent: FC<MyComponentProps> = ({ prop1, prop2 }) => {
  const { data, isLoading } = useEmployees();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="p-4">
      {/* JSX */}
    </div>
  );
};
```

### API Call Pattern
```typescript
// في services/<feature>Service.ts
export const getEmployees = async () => {
  const { data } = await api.get('/employees');
  return data.data;
};

// في hooks/use<Feature>.ts
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });
};

// في component
const { data: employees, isLoading } = useEmployees();
```

### Authentication Flow
1. User يدخل email/password في `LoginForm`
2. `authService.login()` يرسل `POST /api/auth/login`
3. Token يُحفظ في `localStorage` كـ `auth_token`
4. `AuthContext` يحدّث state
5. Axios interceptor يضيف token لكل request تلقائياً

## How to Run / Test

### Initial Setup
```bash
# 1. تثبيت dependencies
npm install --legacy-peer-deps

# 2. إعداد environment
cp .env.example .env
```

### Development (مع Backend حقيقي)
```bash
# 1. تأكد من تشغيل Backend
cd server && npm run dev

# 2. في terminal آخر، شغّل Frontend
npm run dev

# يفتح على http://localhost:5173
```

### Development (مع Mock Data)
```bash
# 1. فعّل MSW في .env
echo "VITE_USE_MSW=true" > .env

# 2. شغّل Frontend
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Common Tasks for Agents

### 1. إضافة صفحة (Page) جديدة

```bash
# 1. أنشئ ملف Page
touch src/pages/MyNewPage.tsx

# 2. أضف route في App.tsx
# <Route path="/my-new-page" element={<MyNewPage />} />

# 3. أضف link في Sidebar/Navigation
```

### 2. إضافة API Service جديد

```bash
# 1. أنشئ service file
touch src/services/myFeatureService.ts

# 2. أنشئ custom hook
touch src/hooks/useMyFeature.ts

# 3. استخدم في component
# const { data, isLoading } = useMyFeature();
```

### 3. إضافة UI Component جديد

```bash
# إذا كان shadcn/ui component
npx shadcn-ui@latest add <component-name>

# إذا كان custom component
mkdir src/components/my-feature
touch src/components/my-feature/MyComponent.tsx
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **"VITE_API_URL is undefined"**
   - تأكد من `.env` موجود في root
   - أعد تشغيل dev server بعد تعديل `.env`

2. **"401 Unauthorized" على كل request**
   - تحقق من token في `localStorage`
   - راجع axios interceptor في `services/api.ts`

3. **MSW لا يعمل**
   - تأكد من `VITE_USE_MSW=true` في `.env`
   - احذف cache: `rm -rf .vite`

### 📝 Best Practices

- **دائماً** استخدم TypeScript types (لا `any`)
- **استخدم** React Query لكل API calls
- **لا تخزن** sensitive data في localStorage (فقط tokens)
- **استخدم** shadcn/ui components بدلاً من custom UI

### 📚 مراجع

- **Components**: `components/agents.md`
- **Services**: `services/agents.md`
- **Pages**: `pages/agents.md`
- **Frontend Dev Guide**: `../docs/DEVELOPER_GUIDE_FRONTEND.md`
