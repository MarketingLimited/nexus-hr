# Frontend-Backend Integration Guide

This guide explains how to connect the Nexus HR frontend to the backend API.

## Quick Start

### 1. Start the Backend

First, make sure the backend is running. Follow the instructions in `BACKEND_SETUP.md`:

```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Set up and start backend
cd server
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The backend will be available at `http://localhost:3001`.

### 2. Configure Frontend

The frontend is already configured to use the real backend API. Check your `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Use MSW for mocking (set to false to use real backend)
VITE_USE_MSW=false
```

### 3. Start Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Configuration Options

### Using Real Backend API (Default)

```env
VITE_API_URL=http://localhost:3001/api
VITE_USE_MSW=false
```

### Using Mock Service Worker (Development)

If you want to develop without the backend:

```env
VITE_API_URL=/api
VITE_USE_MSW=true
```

## Authentication

### Test Accounts

After seeding the backend database, you can log in with:

- **Admin Account**
  - Email: `admin@nexushr.com`
  - Password: `admin123`
  - Role: ADMIN (full access to all features)

- **Employee Account**
  - Email: `john.doe@nexushr.com`
  - Password: `password123`
  - Role: EMPLOYEE (limited access)

### How Authentication Works

1. **Login**: User submits credentials to `/api/auth/login`
2. **Token**: Backend returns a JWT token
3. **Storage**: Token is stored in `localStorage` as `auth_token`
4. **Authorization**: Token is sent in `Authorization: Bearer <token>` header for all subsequent requests
5. **Auto-Refresh**: On page load, frontend validates token with `/api/auth/profile`

### Role-Based Access Control

Users have different permissions based on their role:

- **ADMIN**: Full access to all features
- **HR**: Employee management, attendance, leave approval, documents, performance
- **MANAGER**: View employees, manage attendance, approve leave, performance reviews
- **EMPLOYEE**: View own data, clock in/out, request leave, view documents

## API Integration

### How It Works

The frontend uses the existing API client in `src/services/api.ts`:

```typescript
// Example API call
import { api } from '@/services/api';

const response = await api.get('/employees');
```

The API client automatically:
- Adds authentication token from localStorage
- Handles JSON serialization
- Provides error handling
- Supports GET, POST, PUT, DELETE methods

### Authentication Context

The `AuthContext` provides authentication state throughout the app:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, hasPermission, hasRole } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Check permissions
  if (hasPermission('employees.write')) {
    // Show edit button
  }

  // Check role
  if (hasRole('ADMIN')) {
    // Show admin features
  }
}
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
<Route
  path="/employees"
  element={
    <ProtectedRoute requiredPermission="employees.read">
      <Employees />
    </ProtectedRoute>
  }
/>
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile

### Employees
- `GET /api/employees` - List employees (with pagination, search, filters)
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee (Admin/HR only)
- `PUT /api/employees/:id` - Update employee (Admin/HR only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Attendance
- `GET /api/attendance/records` - Get attendance records
- `GET /api/attendance/stats` - Get attendance statistics
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out

### Performance
- `GET /api/performance/reviews` - Get performance reviews
- `POST /api/performance/reviews` - Create review
- `GET /api/performance/goals` - Get goals
- `POST /api/performance/goals` - Create goal
- `PUT /api/performance/goals/:id` - Update goal
- `GET /api/performance/feedback` - Get feedback
- `POST /api/performance/feedback` - Submit feedback

### Documents
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document
- `POST /api/documents` - Upload document
- `DELETE /api/documents/:id` - Delete document

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Solution**: Make sure the backend is running:
```bash
cd server
npm run dev
```

### Issue: "401 Unauthorized"

**Solutions**:
1. Check if you're logged in
2. Try logging out and logging in again
3. Clear localStorage: `localStorage.clear()` in browser console

### Issue: "CORS Error"

**Solution**: Verify backend CORS settings in `server/.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

### Issue: Still seeing mock data

**Solution**: Check `.env` file:
```env
VITE_USE_MSW=false
```

Then restart the frontend dev server.

### Issue: "Cannot connect to database"

**Solution**: Make sure PostgreSQL is running:
```bash
docker-compose ps postgres
```

If not running:
```bash
docker-compose up -d postgres
```

## Development Workflow

### With Real Backend

1. Start PostgreSQL: `docker-compose up -d postgres`
2. Start backend: `cd server && npm run dev`
3. Start frontend: `npm run dev`
4. Login with test credentials
5. Develop and test features

### With MSW (No Backend)

1. Set `VITE_USE_MSW=true` in `.env`
2. Start frontend: `npm run dev`
3. MSW will intercept API calls and return mock data
4. Useful for UI development without backend

## Production Deployment

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
# Build with production backend URL
VITE_API_URL=https://api.yourcompany.com/api npm run build

# Serve the built files
npm run preview
```

## API Response Format

All API responses follow this format:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Next Steps

1. ✅ Backend is running
2. ✅ Frontend is connected
3. ✅ Authentication works
4. Test all features:
   - Employee management
   - Attendance tracking
   - Performance reviews
   - Document management
5. Customize for your needs
6. Deploy to production

## Support

- Backend API docs: `server/README.md`
- Backend setup: `BACKEND_SETUP.md`
- Frontend source: `src/`
- Issues: Check browser console and backend logs
