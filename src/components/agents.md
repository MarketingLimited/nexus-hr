# Frontend Components - UI Component Library

## Purpose

مجموعة React components قابلة لإعادة الاستخدام لبناء واجهة نظام Nexus HR. تتضمن feature-specific components وshadcn/ui primitives مع Tailwind CSS styling.

## Owned Scope

- **Feature Components**: مكونات خاصة بكل module (employees، attendance، performance، etc.)
- **UI Primitives**: shadcn/ui components (Button، Dialog، Table، Form، etc.)
- **Layout Components**: Header، Sidebar، AppLayout
- **Shared Components**: Reusable UI elements

## Key Files & Entry Points

### UI Primitives (`components/ui/`)
- shadcn/ui components generated via CLI
- **Examples**: `button.tsx`, `dialog.tsx`, `input.tsx`, `table.tsx`, `card.tsx`
- **⚠️ لا تعدّل مباشرة** - regenerate عبر `npx shadcn-ui add <component>`

### Layout Components (`components/layout/`)
- **`AppLayout.tsx`** - Main application layout wrapper
- **`Header.tsx`** - Top navigation bar
- **`Sidebar.tsx`** - Side navigation menu

### Feature Components (Feature-Based Folders)
- **`components/auth/`** - Login، Register forms
- **`components/employees/`** - Employee lists، cards، forms
- **`components/attendance/`** - Clock-in/out، attendance tables
- **`components/performance/`** - Reviews، goals، feedback UI
- **`components/dashboard/`** - Dashboard widgets، stats cards

## Dependencies & Interfaces

### Core Dependencies
- **React** 18.3.1
- **shadcn/ui** - Component primitives (Radix UI)
- **Tailwind CSS** - Styling
- **lucide-react** - Icons
- **React Hook Form** - Form handling
- **Zod** - Form validation

### Data Fetching
- Components استخدام custom hooks من `hooks/` للـ data fetching
- Data managed بواسطة React Query

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

### Styling Conventions
- **Utility-First**: استخدم Tailwind classes
- **Responsive**: `sm:`, `md:`, `lg:` breakpoints
- **Dark Mode**: `dark:` prefix
- **Spacing**: `p-4`, `m-2`, `gap-6`

### shadcn/ui Usage
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

<Button variant="default" size="sm" onClick={handleClick}>
  Click Me
</Button>

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## How to Run / Test

### Development
```bash
npm run dev
# Components ستُحدّث تلقائياً (Hot Module Replacement)
```

### Adding shadcn/ui Component
```bash
# Add specific component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

### Component Testing
```bash
npm test
npm run test:watch
```

## Common Tasks for Agents

### 1. إنشاء Component جديد

```typescript
// src/components/my-feature/MyComponent.tsx
import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
}

export const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
    </Card>
  );
};
```

### 2. إضافة Form Component

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email(),
});

export const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  );
};
```

### 3. إضافة Table Component

```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEmployees } from '@/hooks/useEmployees';

export const EmployeeTable = () => {
  const { data: employees } = useEmployees();
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees?.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>{emp.firstName}</TableCell>
            <TableCell>{emp.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **shadcn/ui components لا تعمل**
   - تأكد من `components.json` موجود
   - أعد install: `npx shadcn-ui@latest add <component>`

2. **Tailwind classes لا تُطبّق**
   - تحقق من `tailwind.config.ts`
   - أعد تشغيل dev server

### 📝 Best Practices

- **استخدم** TypeScript types لكل props
- **استخدم** shadcn/ui components بدلاً من custom UI
- **اتبع** Tailwind responsive design (mobile-first)
- **استخدم** semantic HTML

### 📚 مراجع

- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Services**: `../services/agents.md`
- **Pages**: `../pages/agents.md`
