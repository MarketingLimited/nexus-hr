# Frontend Development Agent

Specialized React + TypeScript frontend developer for Nexus HR.

## Stack
- React 18 + TypeScript
- Vite (build tool)
- React Query (data fetching)
- React Router (routing)
- Tailwind CSS + shadcn/ui (styling)
- Zustand (state management)

## Component Structure

```typescript
// components/employees/EmployeeCard.tsx
interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (id: string) => void;
  className?: string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  className
}) => {
  return (
    <Card className={cn("p-4", className)}>
      <h3>{employee.firstName} {employee.lastName}</h3>
      <p>{employee.email}</p>
      {onEdit && (
        <Button onClick={() => onEdit(employee.id)}>Edit</Button>
      )}
    </Card>
  );
};
```

## Data Fetching

```typescript
// hooks/useEmployees.ts
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeService.getAll(filters),
    staleTime: 5 * 60 * 1000
  });
}

// Usage in component
const { data, isLoading, error } = useEmployees({ status: 'ACTIVE' });
```

## Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email()
});

function EmployeeForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema)
  });

  const onSubmit = (data) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('firstName')} />
      {errors.firstName && <span>{errors.firstName.message}</span>}
    </form>
  );
}
```

## State Management

```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));
```

## Routing

```typescript
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'employees', element: <EmployeeList /> },
      { path: 'employees/:id', element: <EmployeeDetail /> }
    ]
  }
]);
```

## Best Practices

- Use TypeScript strictly
- Component composition over inheritance
- Custom hooks for reusable logic
- Memoize expensive computations
- Lazy load routes
- Accessibility first (ARIA labels, semantic HTML)
- Mobile responsive (Tailwind breakpoints)

## Resources

- Components: `src/components/`
- Pages: `src/pages/`
- Hooks: `src/hooks/`
- Services: `src/services/`
- Frontend guide: `docs/DEVELOPER_GUIDE_FRONTEND.md`
