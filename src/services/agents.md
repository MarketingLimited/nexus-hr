# Frontend Services - API Client Layer

## Purpose

طبقة التواصل بين Frontend وBackend API. تحتوي على functions للـ HTTP requests (GET، POST، PUT، DELETE) مع Axios client configuration وerror handling.

## Owned Scope

- **API Client**: Axios instance configuration
- **Service Functions**: API call wrappers لكل resource
- **Request Interceptors**: Authentication token injection
- **Response Handling**: Error handling وdata extraction
- **Offline Support**: Sync وcaching services

## Key Files & Entry Points

### Core API Client
- **`api.ts`** - Axios instance، base configuration، interceptors
  - Base URL: `VITE_API_URL` (default: `http://localhost:3001/api`)
  - Auto-inject `Authorization: Bearer <token>`
  - Global error handling

### Resource Services
- **`authService.ts`** - Authentication (login، register، profile، logout)
- **`attendanceService.ts`** - Attendance tracking، clock-in/out، records، stats
- **`performanceService.ts`** - Reviews، goals، feedback
- **`documentService.ts`** - Document management
- **`analyticsService.ts`** - Analytics & reporting

### Support Services
- **`offlineService.ts`** - Offline data storage (IndexedDB)
- **`syncService.ts`** - Real-time synchronization
- **`notificationService.ts`** - Notification management

## Dependencies & Interfaces

### Axios Instance
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Request Interceptor (Authentication)
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Local Rules / Patterns

### Service Function Pattern
```typescript
// GET request
export const getEmployees = async (params?: EmployeeFilters) => {
  const { data } = await api.get('/employees', { params });
  return data.data; // Extract data from { status: 'success', data: {...} }
};

// POST request
export const createEmployee = async (employee: CreateEmployeeDto) => {
  const { data } = await api.post('/employees', employee);
  return data.data;
};

// PUT request
export const updateEmployee = async (id: string, updates: Partial<Employee>) => {
  const { data } = await api.put(`/employees/${id}`, updates);
  return data.data;
};

// DELETE request
export const deleteEmployee = async (id: string) => {
  await api.delete(`/employees/${id}`);
};
```

### Error Handling Pattern
```typescript
export const loginUser = async (credentials: LoginDto) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    
    // Save token
    if (data.data.token) {
      localStorage.setItem('auth_token', data.data.token);
    }
    
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};
```

## How to Run / Test

### Using Services في Components

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEmployees, createEmployee } from '@/services/attendanceService';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['employees'],
  queryFn: getEmployees,
});

// Mutation
const mutation = useMutation({
  mutationFn: createEmployee,
  onSuccess: () => {
    queryClient.invalidateQueries(['employees']);
  },
});
```

## Common Tasks for Agents

### 1. إضافة Service Function جديد

```typescript
// في employeeService.ts
export const getEmployeeStats = async () => {
  const { data } = await api.get('/employees/stats');
  return data.data;
};

// استخدام في hook
export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employeeStats'],
    queryFn: getEmployeeStats,
  });
};
```

### 2. Handle File Uploads

```typescript
export const uploadDocument = async (file: File, metadata: DocumentMetadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  
  const { data } = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data.data;
};
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **"Network Error" على كل request**
   - تحقق من Backend يعمل
   - تحقق من `VITE_API_URL` في `.env`
   - راجع CORS settings في Backend

2. **"401 Unauthorized" رغم Login**
   - تحقق من token في `localStorage`
   - راجع interceptor في `api.ts`

### 📝 Best Practices

- **دائماً** extract `data.data` من response
- **استخدم** TypeScript types للـ request/response
- **handle** errors gracefully
- **استخدم** React Query للـ caching

### 📚 مراجع

- **Axios Docs**: https://axios-http.com/docs/intro
- **React Query**: https://tanstack.com/query/latest
- **Backend API**: `../../docs/API.md`
