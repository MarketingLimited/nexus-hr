# Frontend Developer Guide

**For**: Frontend Developers working on the Nexus HR React application

This guide helps you understand, develop, and contribute to the Nexus HR frontend codebase.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Component Development](#component-development)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Routing](#routing)
- [Styling](#styling)
- [Forms](#forms)
- [Testing](#testing)
- [Performance](#performance)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setup

```bash
# Clone and install
git clone <repo-url>
cd nexus-hr
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

See [Getting Started Guide](./GETTING_STARTED.md) for detailed setup.

---

## Tech Stack

### Core

- **React 18.3** - UI library
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool and dev server

### State & Data

- **TanStack Query (React Query)** - Server state management
- **React Context** - Client state (auth, theme)
- **React Hook Form** - Form state

### UI & Styling

- **Tailwind CSS 3.4** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI primitives)
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Routing & Navigation

- **React Router DOM 6.26** - Client-side routing

### Data Fetching

- **Axios 1.13** - HTTP client
- **MSW 2.10** - API mocking (development)

### Testing

- **Vitest 3.2** - Unit test runner
- **Testing Library** - Component testing
- **jest-axe** - Accessibility testing

---

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── auth/           # Authentication components
│   ├── employees/      # Employee management
│   ├── attendance/     # Attendance tracking
│   ├── leave/          # Leave management
│   ├── performance/    # Performance reviews
│   ├── documents/      # Document management
│   ├── payroll/        # Payroll components
│   ├── dashboard/      # Dashboard widgets
│   ├── layout/         # Layout components
│   └── common/         # Shared components
├── pages/              # Page-level components
│   ├── Dashboard.tsx
│   ├── Employees.tsx
│   ├── Login.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useEmployees.ts
│   ├── useAttendance.ts
│   └── ...
├── services/           # API service layer
│   ├── api.ts          # Base API client
│   ├── dataService.ts  # Main data services
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/                # Utility functions
│   ├── utils.ts
│   └── query-optimization.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── mocks/              # MSW mock handlers
│   ├── handlers/
│   └── data/
├── test-utils/         # Testing utilities
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

---

## Development Workflow

### Starting Development

```bash
# Start dev server
npm run dev

# In another terminal - start backend
cd server
npm run dev
```

### Available Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Environment Variables

Create `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Use mock data (MSW) instead of real API
VITE_USE_MSW=false
```

### Hot Module Replacement (HMR)

Vite provides fast HMR. Your changes will reflect immediately without full page reload.

---

## Component Development

### Component Structure

Follow this pattern for consistency:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types';

// 1. Type definitions
interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
}

// 2. Component definition
export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  // 3. Hooks (state, effects, custom hooks)
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 4. Event handlers
  const handleEdit = () => {
    onEdit?.(employee);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete?.(employee.id);
      toast({ title: 'Employee deleted successfully' });
    } catch (error) {
      toast({ title: 'Error deleting employee', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Render
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold">{employee.name}</h3>
      <p className="text-sm text-muted-foreground">{employee.position}</p>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleEdit} size="sm">
          Edit
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
```

### Using shadcn/ui Components

All base UI components are in `src/components/ui/`:

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter name" />
          </div>
          <Button>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Creating New Components

Use the component pattern:

```bash
# Create component file
touch src/components/employees/EmployeeCard.tsx

# Create test file
touch src/components/employees/__tests__/EmployeeCard.test.tsx
```

---

## State Management

### Server State (React Query)

**For**: API data, server-side state

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/dataService';

// Fetch data
function EmployeeList() {
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {employees.map(emp => (
        <EmployeeCard key={emp.id} employee={emp} />
      ))}
    </div>
  );
}

// Mutate data
function CreateEmployeeForm() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: EmployeeInput) => employeeService.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: 'Employee created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating employee', variant: 'destructive' });
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button
        type="submit"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
```

### Client State (Context)

**For**: Auth, theme, UI state

```typescript
// Using auth context
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

### Local Component State

**For**: UI-only state (modals, forms, toggles)

```typescript
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* dialog content */}
      </Dialog>
    </>
  );
}
```

---

## API Integration

### Service Layer

All API calls go through services in `src/services/`:

```typescript
// src/services/dataService.ts

export const employeeService = {
  async getAll(params?: EmployeeSearchParams) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async create(data: CreateEmployeeInput) {
    const response = await api.post('/employees', data);
    return response.data;
  },

  async update(id: string, data: UpdateEmployeeInput) {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/employees/${id}`);
  },
};
```

### Custom Hooks for API

Create reusable hooks:

```typescript
// src/hooks/useEmployees.ts

export function useEmployees(params?: EmployeeSearchParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getAll(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id, // Only fetch if ID exists
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
```

### Using the Hooks

```typescript
function EmployeePage() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();

  const handleCreate = async (data: EmployeeInput) => {
    await createEmployee.mutateAsync(data);
  };

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <EmployeeList employees={employees} onCreate={handleCreate} />
      )}
    </div>
  );
}
```

---

## Routing

### Route Configuration

Routes are defined in `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Nested routes */}
        <Route path="/employees">
          <Route index element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
          <Route path=":id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation

```typescript
import { useNavigate, Link, useParams } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get URL params

  const handleClick = () => {
    navigate('/employees');
    // Or with state
    navigate('/employees/123', { state: { from: 'dashboard' } });
  };

  return (
    <div>
      {/* Declarative navigation */}
      <Link to="/employees">View Employees</Link>

      {/* Programmatic navigation */}
      <Button onClick={handleClick}>Go to Employees</Button>
    </div>
  );
}
```

---

## Styling

### Tailwind CSS

Use Tailwind utility classes:

```typescript
function MyComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Title
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          {/* content */}
        </Card>
      </div>
    </div>
  );
}
```

### Responsive Design

```typescript
function ResponsiveComponent() {
  return (
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      gap-4
    ">
      {/* Responsive grid */}
    </div>
  );
}
```

### Using CSS Variables

Defined in `src/index.css`:

```typescript
function ThemedComponent() {
  return (
    <div className="bg-background text-foreground border-border">
      <p className="text-muted-foreground">Secondary text</p>
      <Button className="bg-primary text-primary-foreground">
        Primary Button
      </Button>
    </div>
  );
}
```

### Custom Styles

When Tailwind isn't enough:

```typescript
// Component-scoped CSS
import './MyComponent.css';

function MyComponent() {
  return (
    <div className="my-custom-component">
      {/* content */}
    </div>
  );
}
```

---

## Forms

### Using React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const formSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
});

type FormData = z.infer<typeof formSchema>;

function EmployeeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    await employeeService.create(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          {...register('firstName')}
          className={errors.firstName ? 'border-red-500' : ''}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500 mt-1">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

---

## Testing

### Component Testing

```typescript
// src/components/__tests__/EmployeeCard.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeCard } from '../EmployeeCard';

describe('EmployeeCard', () => {
  const mockEmployee = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    position: 'Developer',
  };

  it('renders employee information', () => {
    render(<EmployeeCard employee={mockEmployee} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<EmployeeCard employee={mockEmployee} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(mockEmployee);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

See [Testing Guide](./TESTING.md) for more details.

---

## Performance

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

// Lazy load components
const EmployeeList = lazy(() => import('./pages/Employees'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const EmployeeCard = memo(({ employee }: Props) => {
  return <div>{/* render */}</div>;
});

// Memoize expensive calculations
function EmployeeStats({ employees }: Props) {
  const stats = useMemo(() => {
    return employees.reduce((acc, emp) => {
      // expensive calculation
      return acc;
    }, initialValue);
  }, [employees]);

  return <div>{stats}</div>;
}

// Memoize callbacks
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <Child onClick={handleClick} />;
}
```

---

## Best Practices

### TypeScript

✅ **Do**:
```typescript
// Use proper types
interface Employee {
  id: string;
  name: string;
  email: string;
}

function getEmployee(id: string): Promise<Employee> {
  return api.get(`/employees/${id}`);
}
```

❌ **Don't**:
```typescript
// Avoid 'any'
function getEmployee(id: any): any {
  return api.get(`/employees/${id}`);
}
```

### Component Organization

✅ **Do**:
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance

❌ **Don't**:
- Create mega-components with 500+ lines
- Duplicate logic across components
- Over-nest components

### File Naming

✅ **Do**:
- Components: `PascalCase.tsx` (e.g., `EmployeeCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useEmployees.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)

---

## Common Patterns

### Loading States

```typescript
function MyComponent() {
  const { data, isLoading, error } = useEmployees();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <div>{/* render data */}</div>;
}
```

### Error Handling

```typescript
function MyComponent() {
  const { toast } = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      toast({ title: 'Success!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
}
```

### Conditional Rendering

```typescript
function MyComponent({ user }: Props) {
  return (
    <div>
      {/* Ternary */}
      {user.isAdmin ? <AdminPanel /> : <UserPanel />}

      {/* Logical AND */}
      {user.hasPermission && <SecretFeature />}

      {/* Nullish coalescing */}
      <p>{user.name ?? 'Guest'}</p>
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

**Types not found**:
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Styles not applying**:
```bash
# Rebuild Tailwind
npm run build
```

**React Query DevTools not showing**:
```typescript
// Make sure it's imported
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools />
</QueryClientProvider>
```

---

## Additional Resources

- **[Getting Started](./GETTING_STARTED.md)** - Setup guide
- **[API Documentation](./API.md)** - Backend API reference
- **[Testing Guide](./TESTING.md)** - Testing strategies
- **[Contributing Guide](./CONTRIBUTING.md)** - Contribution guidelines

---

**Questions?** Check the [Documentation Index](./INDEX.md) or ask the team!

**Last Updated**: November 22, 2025
