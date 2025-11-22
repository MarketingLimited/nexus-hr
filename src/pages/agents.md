# Frontend Pages - Application Routes

## Purpose

React components التي تمثل صفحات (routes) التطبيق. كل page يحتوي على layout، data fetching، وfeature-specific UI للوظيفة المطلوبة.

## Owned Scope

- **Route Pages**: Components لكل URL path
- **Page Layouts**: Structure وorganization للصفحات
- **Data Fetching**: استدعاء hooks للـ API data
- **Navigation**: Links وredirects بين الصفحات

## Key Files & Entry Points

### Main Pages
- **`Index.tsx`** - `/` - Dashboard الرئيسية
- **`Employees.tsx`** - `/employees` - قائمة الموظفين
- **`EmployeeProfile.tsx`** - `/employees/:id` - تفاصيل موظف
- **`Attendance.tsx`** - `/attendance` - نظام الحضور
- **`Performance.tsx`** - `/performance` - التقييمات
- **`LeaveManagement.tsx`** - `/leave` - إدارة الإجازات
- **`Payroll.tsx`** - `/payroll` - الرواتب
- **`Settings.tsx`** - `/settings` - الإعدادات
- **`NotFound.tsx`** - `/404` - صفحة غير موجودة

### Routing في `App.tsx`
```typescript
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/employees" element={<Employees />} />
  <Route path="/employees/:id" element={<EmployeeProfile />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Dependencies & Interfaces

### Routing
- **react-router-dom** v6.26 - `useNavigate()`, `useParams()`, `Link`

### Data Fetching
- Pages استخدام custom hooks من `hooks/`:
  - `useEmployees()`, `useAttendance()`, `usePerformance()`
- Data managed بواسطة React Query

### UI Components
- Import من `components/`:
  - Layout components (`AppLayout`)
  - Feature components (`EmployeeList`, `AttendanceTable`)

## Local Rules / Patterns

### Page Component Pattern
```typescript
import { FC } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { Button } from '@/components/ui/button';

export const Employees: FC = () => {
  const { data: employees, isLoading } = useEmployees();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button>Add Employee</Button>
      </div>
      
      <EmployeeList employees={employees} />
    </div>
  );
};
```

### Protected Routes Pattern
```typescript
// في App.tsx
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return children;
};

<Route 
  path="/admin" 
  element={
    <ProtectedRoute role="ADMIN">
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### Navigation Pattern
```typescript
import { useNavigate, Link } from 'react-router-dom';

// Programmatic navigation
const navigate = useNavigate();
const handleClick = () => {
  navigate('/employees/123');
};

// Declarative navigation
<Link to="/employees">Employees</Link>
```

## How to Run / Test

### Development
```bash
npm run dev
# يفتح http://localhost:5173
```

### Route Testing
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Employees } from '../Employees';

test('renders employees page', () => {
  render(
    <BrowserRouter>
      <Employees />
    </BrowserRouter>
  );
  expect(screen.getByText('Employees')).toBeInTheDocument();
});
```

## Common Tasks for Agents

### 1. إضافة Page جديدة

```typescript
// 1. أنشئ page file
// src/pages/Training.tsx
import { FC } from 'react';

export const Training: FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Training</h1>
      {/* Content */}
    </div>
  );
};

// 2. أضف route في App.tsx
import { Training } from './pages/Training';
<Route path="/training" element={<Training />} />

// 3. أضف link في Sidebar
<Link to="/training">Training</Link>
```

### 2. إضافة Protected Route

```typescript
<Route 
  path="/admin/settings" 
  element={
    user?.role === 'ADMIN' ? <AdminSettings /> : <Navigate to="/" />
  } 
/>
```

### 3. إضافة Dynamic Route

```typescript
// Route definition
<Route path="/employees/:id/reviews/:reviewId" element={<ReviewDetail />} />

// استخدام في component
import { useParams } from 'react-router-dom';

export const ReviewDetail = () => {
  const { id, reviewId } = useParams();
  const { data } = useReview(reviewId);
  
  return <div>Review {reviewId} for Employee {id}</div>;
};
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **Routes لا تعمل (404)**
   - تحقق من Route path في `App.tsx`
   - راجع BrowserRouter في `main.tsx`

2. **Data لا تُحدّث بعد Navigation**
   ```typescript
   const { data } = useQuery({
     queryKey: ['employee', id], // id من useParams()
     queryFn: () => getEmployee(id),
   });
   ```

### 📝 Best Practices

- **استخدم** semantic page titles
- **lazy load** pages: `const Page = lazy(() => import('./Page'))`
- **استخدم** loading states
- **handle** errors gracefully

### 📚 مراجع

- **React Router**: https://reactrouter.com/en/main
- **Components**: `../components/agents.md`
- **Services**: `../services/agents.md`
