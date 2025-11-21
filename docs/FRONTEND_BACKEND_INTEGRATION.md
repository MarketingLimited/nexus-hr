# Frontend-Backend Integration Guide

## Overview

The Nexus HR platform frontend is fully integrated with the backend API. All mock data has been replaced with real API calls, ensuring a complete end-to-end application flow.

## Architecture

### API Client Configuration

**Location**: `src/services/api.ts`

The API client is configured to:
- Use `VITE_API_URL` environment variable (default: `http://localhost:3001/api`)
- Automatically attach JWT tokens from localStorage
- Handle authentication and error responses
- Support all HTTP methods (GET, POST, PUT, DELETE)

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || '/api'
```

### Environment Configuration

**Development** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_USE_MSW=false
```

**Production** (`.env.production`):
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_USE_MSW=false
```

## Service Layer Integration

All service files in `src/services/` are configured to use the real backend API:

### Employee Service (`dataService.ts`)
**Endpoints**:
- `GET /api/employees` - List employees with pagination and filters
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get employee statistics

### Attendance Service (`attendanceService.ts`)
**Endpoints**:
- `GET /api/attendance/records` - List attendance records
- `POST /api/attendance/records` - Create attendance record
- `PUT /api/attendance/records/:id` - Update attendance record
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/schedules` - Get work schedules
- `POST /api/attendance/schedules` - Create work schedule

### Leave Service (`dataService.ts` - leaveService)
**Endpoints**:
- `GET /api/leave/requests` - List leave requests
- `GET /api/leave/requests/:id` - Get single leave request
- `POST /api/leave/requests` - Create leave request
- `PUT /api/leave/requests/:id` - Update leave request
- `POST /api/leave/requests/:id/approve` - Approve leave request
- `POST /api/leave/requests/:id/reject` - Reject leave request
- `GET /api/leave/balances` - Get leave balances
- `GET /api/leave/types` - Get leave types
- `GET /api/leave/stats` - Get leave statistics

### Performance Service (`dataService.ts` - performanceService)
**Endpoints**:
- `GET /api/performance/reviews` - List performance reviews
- `POST /api/performance/reviews` - Create performance review
- `PUT /api/performance/reviews/:id` - Update performance review
- `GET /api/performance/goals` - List goals
- `POST /api/performance/goals` - Create goal
- `PUT /api/performance/goals/:id` - Update goal
- `GET /api/performance/feedback` - List feedback
- `POST /api/performance/feedback` - Create feedback

### Document Service (`dataService.ts` - documentService)
**Endpoints**:
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents/upload` - Upload document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document
- `GET /api/documents/stats` - Get document statistics

### Payroll Service (`dataService.ts` - payrollService)
**Endpoints**:
- `GET /api/payroll/salary-structures` - List salary structures
- `GET /api/payroll/payslips` - List payslips
- `POST /api/payroll/payslips/generate` - Generate payslips
- `GET /api/payroll/runs` - List payroll runs
- `POST /api/payroll/runs` - Create payroll run
- `POST /api/payroll/runs/:id/process` - Process payroll run
- `GET /api/payroll/stats` - Get payroll statistics

## React Hooks Integration

All custom hooks have been updated to use real API services:

### Updated Hooks

| Hook | Service | Status |
|------|---------|--------|
| `useEmployees` | employeeService | ✅ Integrated |
| `useAttendance` | attendanceService | ✅ Integrated |
| `useLeave` | leaveService | ✅ Integrated |
| `usePerformance` | performanceService | ✅ Integrated |
| `useDocuments` | documentService | ✅ Integrated |
| `usePayroll` | payrollService | ✅ Integrated |
| `useAuth` | authService | ✅ Integrated |

### Example Hook Usage

```typescript
// useEmployees.ts - Integrated with backend
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/dataService';

export function useEmployees(params?: { search?: string; department?: string }) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getAll(params),
  });
}
```

## Authentication Flow

### Login Process
1. User submits credentials via `LoginForm`
2. `useAuth` hook calls `POST /api/auth/login`
3. Backend returns JWT token
4. Token stored in localStorage as `auth_token`
5. Subsequent requests automatically include token in Authorization header
6. User redirected to dashboard

### Token Management
- **Storage**: localStorage (`auth_token`)
- **Attachment**: Automatic via API client interceptor
- **Expiration**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Refresh**: Manual logout/login (auto-refresh can be added)

### Protected Routes
All routes except `/login` and `/register` are protected:

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

## Data Flow

### Read Operations (GET)
```
Component → useQuery Hook → Service → API Client → Backend API → Database
                                                                      ↓
Component ← Cache ← React Query ← API Response ← Backend ← Database
```

### Write Operations (POST/PUT/DELETE)
```
Component → useMutation Hook → Service → API Client → Backend API → Database
                                                                        ↓
Component ← Invalidate Cache ← React Query ← Success Response ← Backend
```

## Error Handling

### API Client Level
```typescript
try {
  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error(`API Error for ${endpoint}:`, error);
  throw error;
}
```

### Hook Level
```typescript
export function useCreateEmployee() {
  return useMutation({
    mutationFn: (data) => employeeService.create(data),
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create employee');
    },
  });
}
```

## Caching Strategy

### React Query Configuration
**Location**: `src/lib/query-optimization.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
    },
  },
});
```

### Cache Invalidation
- **On Create**: Invalidate list queries
- **On Update**: Invalidate both list and detail queries
- **On Delete**: Invalidate list queries
- **Manual**: Via `queryClient.invalidateQueries()`

## Testing

### Development Testing
1. Start backend server:
   ```bash
   cd server && npm run dev
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

3. Access application:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - API: http://localhost:3001/api

### Integration Testing
```typescript
// Example: Testing employee creation flow
describe('Employee Creation', () => {
  it('should create employee via API', async () => {
    const { result } = renderHook(() => useCreateEmployee());

    await act(async () => {
      await result.current.mutate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        department: 'Engineering',
      });
    });

    expect(result.current.isSuccess).toBe(true);
  });
});
```

## Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build output: dist/
# Static files ready for deployment
```

### Environment Variables (Production)
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_USE_MSW=false
NODE_ENV=production
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Services:
# - Frontend: port 80
# - Backend: port 3001
# - PostgreSQL: port 5432
```

## Monitoring & Debugging

### API Request Logging
All API requests are logged in the browser console:
```typescript
console.log('API Request:', method, endpoint, data);
console.log('API Response:', response);
console.error('API Error:', error);
```

### React Query DevTools
Development environment includes React Query DevTools:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

Access DevTools: Click the React Query icon in bottom-right corner

### Network Tab
Use browser DevTools Network tab to inspect:
- Request/Response headers
- Payload data
- Response times
- Error responses

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Missing or expired JWT token
**Solution**:
- Check localStorage for `auth_token`
- Re-login to get fresh token
- Verify token is included in Authorization header

### Issue: CORS Errors
**Cause**: Backend not configured to accept frontend origin
**Solution**: Update backend CORS configuration:
```typescript
app.use(cors({
  origin: 'http://localhost:5173', // or production URL
  credentials: true,
}));
```

### Issue: API Connection Refused
**Cause**: Backend server not running
**Solution**:
```bash
cd server
npm run dev
```

### Issue: Stale Data
**Cause**: React Query cache not invalidated
**Solution**: Force refetch or invalidate queries:
```typescript
queryClient.invalidateQueries({ queryKey: ['employees'] });
// or
refetch();
```

## Migration Checklist

✅ All services updated to use real API endpoints
✅ All hooks updated to use service layer
✅ Mock data removed from hooks
✅ Authentication flow integrated
✅ Error handling implemented
✅ Toast notifications added
✅ Cache invalidation configured
✅ Environment variables documented
✅ API client configured
✅ Type safety maintained

## Next Steps

1. **Performance Optimization**:
   - Implement query prefetching
   - Add optimistic updates
   - Configure selective cache persistence

2. **Enhanced Features**:
   - Real-time updates via WebSocket
   - Offline support via Service Workers
   - Advanced filtering and sorting

3. **Monitoring**:
   - Add analytics tracking
   - Implement error reporting (Sentry)
   - Add performance monitoring

## Support

For integration issues or questions:
- Check backend API documentation: `server/README.md`
- Review API route files: `server/src/routes/*.ts`
- Contact: Technical Team

---

**Last Updated**: November 21, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
