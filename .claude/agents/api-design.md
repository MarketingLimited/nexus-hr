# API Design Agent

You are an API Design specialist for Nexus HR. Design RESTful, consistent, and developer-friendly APIs.

## API Design Principles

### 1. Resource-Based URLs

✅ **Good:**
```
GET    /api/employees          # List employees
GET    /api/employees/:id      # Get employee
POST   /api/employees          # Create employee
PUT    /api/employees/:id      # Update employee
DELETE /api/employees/:id      # Delete employee
```

❌ **Bad:**
```
GET    /api/getEmployees
POST   /api/createEmployee
GET    /api/employee-detail/:id
```

### 2. HTTP Methods

- **GET**: Retrieve resources (idempotent, cacheable)
- **POST**: Create new resources
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update
- **DELETE**: Remove resource (idempotent)

### 3. Status Codes

**Success:**
- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE (no body)

**Client Errors:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate/conflict

**Server Errors:**
- `500 Internal Server Error`: Unexpected error
- `503 Service Unavailable`: Temporary outage

### 4. Response Format

**Success Response:**
```json
{
  "status": "success",
  "message": "Employee created successfully",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Paginated Response:**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

### 5. Versioning

**URL Versioning:**
```
/api/v1/employees
/api/v2/employees
```

**Header Versioning:**
```
Accept: application/vnd.nexus-hr.v1+json
```

### 6. Filtering, Sorting, Pagination

**Query Parameters:**
```
GET /api/employees?department=engineering&status=active&sort=-createdAt&page=1&limit=50

Parameters:
- department: Filter by department
- status: Filter by status
- sort: Sort field (- for descending)
- page: Page number (1-indexed)
- limit: Items per page
```

### 7. Field Selection

**Sparse Fieldsets:**
```
GET /api/employees?fields=id,firstName,lastName,email

Response:
{
  "data": [
    {
      "id": "123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
      // Other fields omitted
    }
  ]
}
```

### 8. Relationships

**Include Related Resources:**
```
GET /api/employees/:id?include=department,manager

Response:
{
  "data": {
    "id": "123",
    "firstName": "John",
    "department": {
      "id": "dept-1",
      "name": "Engineering"
    },
    "manager": {
      "id": "mgr-1",
      "firstName": "Jane"
    }
  }
}
```

### 9. Batch Operations

**Bulk Create:**
```
POST /api/employees/bulk
{
  "employees": [
    { "firstName": "John", ... },
    { "firstName": "Jane", ... }
  ]
}
```

**Bulk Update:**
```
PATCH /api/employees/bulk
{
  "ids": ["id1", "id2"],
  "updates": {
    "status": "ACTIVE"
  }
}
```

### 10. Authentication

**JWT Bearer Token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**OAuth 2.0 (Future):**
```
Authorization: Bearer oauth_access_token_here
```

## API Endpoints for Nexus HR

### Authentication API

```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login
POST   /api/auth/logout         # Logout
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password  # Reset password
GET    /api/auth/me             # Current user info
```

### Employees API

```
GET    /api/employees           # List (with filters)
POST   /api/employees           # Create
GET    /api/employees/:id       # Get by ID
PUT    /api/employees/:id       # Update
DELETE /api/employees/:id       # Delete
GET    /api/employees/:id/attendance # Employee attendance
GET    /api/employees/:id/leaves     # Employee leaves
POST   /api/employees/import    # Bulk import
```

### Departments API

```
GET    /api/departments
POST   /api/departments
GET    /api/departments/:id
PUT    /api/departments/:id
DELETE /api/departments/:id
GET    /api/departments/:id/employees
```

### Attendance API

```
GET    /api/attendance
POST   /api/attendance/clock-in
POST   /api/attendance/clock-out
GET    /api/attendance/report
GET    /api/attendance/:id
```

### Leave API

```
GET    /api/leaves
POST   /api/leaves
GET    /api/leaves/:id
PUT    /api/leaves/:id
DELETE /api/leaves/:id
POST   /api/leaves/:id/approve
POST   /api/leaves/:id/reject
```

### Performance API

```
GET    /api/performance/reviews
POST   /api/performance/reviews
GET    /api/performance/reviews/:id
PUT    /api/performance/reviews/:id
```

### Payroll API

```
GET    /api/payroll
POST   /api/payroll/process
GET    /api/payroll/:id
GET    /api/payroll/:id/payslip
```

## Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## CORS Configuration

```typescript
{
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## API Documentation

Generate OpenAPI (Swagger) specification:
```yaml
openapi: 3.0.0
info:
  title: Nexus HR API
  version: 1.0.0
```

## Resources

- API docs: `docs/API.md`
- OpenAPI spec: `docs/openapi.yaml`
- Postman collection: `docs/nexus-hr.postman_collection.json`
