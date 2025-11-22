# Architecture Documentation - Nexus HR

This document provides a comprehensive overview of the Nexus HR platform architecture, system design, and technical implementation details.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Authentication & Authorization](#authentication--authorization)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Deployment Architecture](#deployment-architecture)
- [Security Architecture](#security-architecture)
- [Scalability & Performance](#scalability--performance)

---

## System Overview

Nexus HR is a full-stack Human Resources Management System built using modern web technologies. The platform provides comprehensive employee management, leave tracking, payroll processing, performance management, and document handling capabilities.

### Key Components

1. **Frontend**: React 18 + TypeScript + Vite
2. **Backend**: Node.js + Express.js + TypeScript
3. **Database**: PostgreSQL 16 with Prisma ORM
4. **Authentication**: JWT-based authentication with bcrypt password hashing
5. **Deployment**: Docker containers with nginx reverse proxy
6. **Monitoring**: Prometheus + Grafana + Alertmanager

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  │   (React)    │  │     App      │  │     App      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS (TLS 1.3)
┌─────────────────────▼───────────────────────────────────────┐
│                    LOAD BALANCER                             │
│                 (nginx / AWS ALB)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │                         │
┌────────▼──────────┐    ┌────────▼──────────┐
│   Frontend        │    │   Backend API     │
│   Server (nginx)  │    │   (Express.js)    │
│   - Static Files  │    │   - REST API      │
│   - SPA Routing   │    │   - Authentication│
└───────────────────┘    │   - Business Logic│
                         └────────┬──────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │                           │
          ┌─────────▼────────┐       ┌────────▼─────────┐
          │   PostgreSQL     │       │   Redis Cache    │
          │   Database       │       │   (Sessions)     │
          │   - Prisma ORM   │       │                  │
          └──────────────────┘       └──────────────────┘
```

---

## Technology Stack

### Frontend

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **Language**: TypeScript 5.5.3
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.11
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 6.26.2
- **Form Handling**: React Hook Form 7.53.0 + Zod 3.23.8
- **HTTP Client**: Axios 1.13.2
- **Testing**: Vitest 3.2.4 + Testing Library

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21.1
- **Language**: TypeScript 5.5.3
- **ORM**: Prisma 5.22.0
- **Database**: PostgreSQL 16
- **Authentication**: JSON Web Tokens (JWT 9.0.2)
- **Password Hashing**: bcrypt 5.1.1
- **Validation**: Zod 3.23.8
- **Security**: Helmet 8.1.0
- **Rate Limiting**: express-rate-limit 8.2.1
- **Testing**: Vitest 4.0.12

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Web Server**: nginx 1.25
- **Monitoring**: Prometheus + Grafana
- **Alerting**: Alertmanager
- **CI/CD**: GitHub Actions
- **Version Control**: Git + GitHub

---

## Frontend Architecture

### Directory Structure

```
src/
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── employees/     # Employee management
│   ├── leave/         # Leave management
│   ├── payroll/       # Payroll components
│   ├── performance/   # Performance management
│   ├── documents/     # Document management
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts (Auth, Theme)
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
│   ├── api.ts         # API client
│   └── utils.ts       # Helper functions
├── pages/             # Page components
├── routes/            # Route definitions
├── types/             # TypeScript type definitions
└── test-utils/        # Testing utilities
```

### Component Architecture

**Atomic Design Pattern**:
- **Atoms**: Basic UI elements (Button, Input, Label)
- **Molecules**: Simple component groups (FormField, SearchBar)
- **Organisms**: Complex components (EmployeeList, LeaveCalendar)
- **Templates**: Page layouts
- **Pages**: Complete page views

### State Management Strategy

1. **Server State**: TanStack Query
   - API data fetching
   - Caching and invalidation
   - Background refetching
   - Optimistic updates

2. **Client State**: React Context + Hooks
   - Authentication state (AuthContext)
   - Theme preferences (ThemeContext)
   - UI state (modals, notifications)

3. **Form State**: React Hook Form
   - Form validation
   - Error handling
   - Submission logic

---

## Backend Architecture

### Directory Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # Prisma client setup
│   ├── controllers/      # Request handlers
│   │   ├── authController.ts
│   │   ├── employeeController.ts
│   │   ├── leaveController.ts
│   │   ├── payrollController.ts
│   │   ├── performanceController.ts
│   │   └── documentController.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── validate.ts   # Validation middleware
│   │   └── errorHandler.ts
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts        # JWT utilities
│   │   └── password.ts   # Password utilities
│   ├── validators/       # Zod validation schemas
│   └── index.ts          # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── tests/                # Unit tests
```

### Layered Architecture

1. **Routes Layer**: HTTP routing and endpoint definitions
2. **Controllers Layer**: Business logic and request/response handling
3. **Service Layer**: Reusable business logic (future enhancement)
4. **Data Layer**: Prisma ORM and database access
5. **Middleware Layer**: Cross-cutting concerns (auth, validation, error handling)

### API Design Patterns

- **RESTful API**: Resource-based URLs
- **JSON API**: Consistent response format
- **Pagination**: Cursor-based pagination for lists
- **Filtering**: Query parameter-based filtering
- **Sorting**: Query parameter-based sorting
- **Error Handling**: Standardized error responses

---

## Database Design

### Schema Overview

**Core Entities**:
- User (authentication)
- Employee (HR data)
- LeaveRequest & LeaveBalance
- AttendanceRecord
- PayrollRecord
- PerformanceReview, Goal, Feedback
- Document & DocumentPermission
- OnboardingChecklist & OnboardingTask
- Asset

### Relationships

```
User 1──1 Employee
     │
     └──* LeaveRequest
     └──* AttendanceRecord
     └──* PayrollRecord
     └──* PerformanceReview
     └──* Goal
     └──* Feedback (as sender/receiver)
     └──* Document
     └──* OnboardingChecklist
     └──* Asset
```

### Database Indexes

Critical indexes for performance:
- `email` (unique, for user lookups)
- `employeeId` (unique, for employee queries)
- `employeeId_date` (composite, for attendance)
- `employeeId` + `year` (composite, for leave balance)
- `reviewPeriodStart` (for performance queries)

### Data Integrity

- **Foreign Keys**: Cascade deletes where appropriate
- **Constraints**: NOT NULL, UNIQUE, CHECK constraints
- **Validation**: Application-level validation with Zod
- **Transactions**: Critical operations wrapped in transactions

---

## API Design

### Endpoint Structure

```
/api
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── GET    /profile
│   ├── POST   /logout
│   ├── POST   /refresh
│   └── POST   /password/change
├── /employees
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   ├── DELETE /:id
│   ├── POST   /bulk-import
│   ├── GET    /export
│   └── GET    /search/advanced
├── /leave
│   ├── POST   /requests
│   ├── GET    /requests
│   ├── POST   /requests/:id/approve
│   ├── POST   /requests/:id/reject
│   ├── GET    /balance/:employeeId
│   └── GET    /calendar
├── /payroll
│   ├── POST   /process
│   ├── GET    /records
│   └── GET    /tax-summary/:year
├── /attendance
│   ├── POST   /clock-in
│   ├── POST   /clock-out
│   ├── GET    /records
│   ├── GET    /stats
│   └── POST   /mark-absent
├── /performance
│   ├── GET    /reviews
│   ├── POST   /reviews
│   ├── GET    /goals
│   ├── POST   /goals
│   ├── GET    /feedback
│   └── POST   /feedback
└── /documents
    ├── GET    /
    ├── POST   /
    ├── GET    /:id
    ├── PUT    /:id
    ├── DELETE /:id
    └── GET    /:id/download
```

### Response Format

**Success Response**:
```json
{
  "status": "success",
  "data": {},
  "meta": {}
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": []
}
```

---

## Authentication & Authorization

### Authentication Flow

1. **Login**: POST /api/auth/login
   - Validate credentials
   - Generate JWT token
   - Return token + user data

2. **Token Storage**: Client-side in localStorage

3. **Protected Requests**:
   - Include `Authorization: Bearer <token>` header
   - Backend validates token via middleware

4. **Token Refresh**: POST /api/auth/refresh

### Authorization Model

**Role-Based Access Control (RBAC)**:
- **ADMIN**: Full system access
- **HR**: HR management functions
- **MANAGER**: Team management
- **EMPLOYEE**: Self-service only

**Resource-Based Authorization**:
- Employees can only access their own data
- Managers can access their team's data
- HR and Admin have broader access

### Middleware Chain

```
Request → authenticate → authorize → controller → response
```

---

## State Management

### Frontend State Categories

1. **Server State** (TanStack Query):
   - Employee data
   - Leave requests
   - Attendance records
   - Performance reviews
   - Documents

2. **Authentication State** (AuthContext):
   - Current user
   - User role
   - Login/logout functions

3. **UI State** (Local State):
   - Modal open/close
   - Form inputs
   - Toast notifications
   - Loading indicators

### Caching Strategy

- **Fresh Data**: 5 seconds (user profile, attendance stats)
- **Standard Data**: 5 minutes (employee lists, leave requests)
- **Stable Data**: 1 hour (departments, leave types)
- **Manual Invalidation**: On mutations (create, update, delete)

---

## Data Flow

### Read Operations

```
Component → useQuery → API Client → Backend → Database → Response
```

### Write Operations

```
Component → useMutation → API Client → Backend → Database → Success
          → invalidateQueries → Refetch → UI Update
```

### Optimistic Updates

For critical operations (clock-in/out, leave approval):
```
Component → useMutation (optimistic) → UI Update (immediate)
          → API Call → Success → UI Sync
                     → Error → Rollback
```

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│         Load Balancer (nginx)           │
│         SSL Termination                 │
└─────────┬─────────────────┬─────────────┘
          │                 │
    ┌─────▼────┐      ┌─────▼────┐
    │ Frontend │      │ Backend  │
    │ Container│      │ Container│
    │ (nginx)  │      │ (Node.js)│
    └──────────┘      └─────┬────┘
                            │
                      ┌─────▼────────┐
                      │  PostgreSQL  │
                      │   Container  │
                      └──────────────┘
```

### Container Architecture

- **Frontend**: Static files served by nginx
- **Backend**: Node.js application
- **Database**: PostgreSQL with persistent volumes
- **Monitoring**: Prometheus, Grafana, Alertmanager

### Deployment Process

1. **Build Phase**:
   - Run tests
   - Build Docker images
   - Tag with version

2. **Deploy Phase**:
   - Pull latest images
   - Run database migrations
   - Start containers with health checks
   - Verify deployment

3. **Rollback**:
   - Keep previous 3 versions
   - Quick rollback capability

---

## Security Architecture

### Defense in Depth

1. **Network Layer**: HTTPS, TLS 1.3
2. **Application Layer**: Helmet, CORS, Rate Limiting
3. **Authentication Layer**: JWT, bcrypt
4. **Authorization Layer**: RBAC, Resource-based
5. **Data Layer**: Input validation, SQL injection prevention
6. **Monitoring Layer**: Security event logging

### Security Headers

```
Strict-Transport-Security: max-age=31536000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## Scalability & Performance

### Horizontal Scaling

- **Frontend**: Multiple nginx instances behind load balancer
- **Backend**: Stateless API servers (scale based on CPU/memory)
- **Database**: Read replicas for read-heavy operations

### Caching Strategy

1. **Client-side**: TanStack Query cache
2. **API-side**: Redis for session data (future)
3. **Database**: Query result caching

### Performance Optimization

- **Frontend**:
  - Code splitting
  - Lazy loading
  - Image optimization
  - Bundle size optimization

- **Backend**:
  - Database indexing
  - Query optimization
  - Connection pooling
  - Response compression

### Load Handling

- **Current**: 100 concurrent users
- **Target**: 1000 concurrent users
- **Max**: 10,000 concurrent users (with scaling)

---

## Monitoring & Observability

### Metrics Collection

- **Application Metrics**: Response time, error rate, request count
- **System Metrics**: CPU, memory, disk, network
- **Business Metrics**: Active users, API usage, feature adoption

### Alerting Rules

- Service down > 1 minute
- Error rate > 5%
- Response time > 2 seconds
- CPU > 80%
- Memory > 85%
- Disk space < 15%

### Logging Strategy

- **Application Logs**: Structured JSON logs
- **Access Logs**: nginx access logs
- **Error Logs**: Application error logs with stack traces
- **Audit Logs**: Security-sensitive operations

---

## Future Enhancements

1. **Microservices**: Split into domain-specific services
2. **Event-Driven**: Implement event bus for async operations
3. **GraphQL**: Alternative API for complex queries
4. **Real-time**: WebSocket support for live updates
5. **Mobile Apps**: Native iOS/Android applications
6. **AI/ML**: Predictive analytics for HR insights

---

## References

- [API Documentation](./API.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)

---

**Documentation Index**: [INDEX.md](./INDEX.md) | **Getting Started**: [GETTING_STARTED.md](./GETTING_STARTED.md)
