# API Documentation - Nexus HR

Complete API reference for the Nexus HR platform.

## Base URL

```
Development: http://localhost:3001/api
Staging: https://api-staging.nexushr.com/api
Production: https://api.nexushr.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow this structure:

```json
{
  "status": "success" | "error",
  "data": {},
  "message": "Optional message",
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

## Error Responses

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 attempts per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    }
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Get Profile

```http
GET /api/auth/profile
```

**Headers:** `Authorization: Bearer TOKEN`

---

## Employee Endpoints

### List Employees

```http
GET /api/employees?page=1&limit=50&search=john&department=Engineering&status=ACTIVE
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `search`: Search by name, email, or employee ID
- `department`: Filter by department
- `status`: Filter by status (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "position": "Software Engineer",
      "department": "Engineering",
      "status": "ACTIVE",
      "hireDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Get Employee

```http
GET /api/employees/:id
```

### Create Employee

```http
POST /api/employees
```

**Required Roles:** ADMIN, HR

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "position": "Product Manager",
  "department": "Product",
  "location": "Remote",
  "hireDate": "2024-01-15",
  "salary": 85000,
  "manager": "manager-uuid",
  "skills": ["Product Management", "Agile"]
}
```

### Update Employee

```http
PUT /api/employees/:id
```

### Delete Employee

```http
DELETE /api/employees/:id
```

---

## Leave Management Endpoints

### Create Leave Request

```http
POST /api/leave/requests
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "leaveType": "ANNUAL",
  "startDate": "2024-12-24",
  "endDate": "2024-12-31",
  "reason": "Holiday vacation",
  "isHalfDay": false
}
```

**Leave Types:**
- `ANNUAL`: Annual/vacation leave
- `SICK`: Sick leave
- `PERSONAL`: Personal leave
- `MATERNITY`: Maternity leave
- `PATERNITY`: Paternity leave
- `UNPAID`: Unpaid leave
- `BEREAVEMENT`: Bereavement leave

### List Leave Requests

```http
GET /api/leave/requests?employeeId=uuid&status=PENDING&leaveType=ANNUAL
```

### Approve Leave Request

```http
POST /api/leave/requests/:id/approve
```

**Required Roles:** ADMIN, HR, MANAGER

**Request Body:**
```json
{
  "approverId": "uuid",
  "comments": "Approved for holiday period"
}
```

### Reject Leave Request

```http
POST /api/leave/requests/:id/reject
```

### Get Leave Balance

```http
GET /api/leave/balance/:employeeId
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "employeeId": "uuid",
    "year": 2024,
    "balance": {
      "ANNUAL": { "total": 20, "used": 5, "remaining": 15 },
      "SICK": { "total": 10, "used": 2, "remaining": 8 }
    }
  }
}
```

### Get Leave Calendar

```http
GET /api/leave/calendar?startDate=2024-01-01&endDate=2024-12-31&department=Engineering
```

---

## Payroll Endpoints

### Process Payroll

```http
POST /api/payroll/process
```

**Required Roles:** ADMIN, HR

**Request Body:**
```json
{
  "employeeId": "uuid",
  "payPeriodStart": "2024-01-01",
  "payPeriodEnd": "2024-01-31",
  "baseSalary": 5000,
  "allowances": 500,
  "deductions": 200,
  "taxAmount": 800,
  "bonus": 1000
}
```

### List Payroll Records

```http
GET /api/payroll/records?year=2024&month=1&status=PAID
```

### Get Tax Summary

```http
GET /api/payroll/tax-summary/2024?employeeId=uuid
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "year": 2024,
    "summary": [
      {
        "employee": { "firstName": "John", "lastName": "Doe" },
        "totalGrossSalary": 60000,
        "totalTaxAmount": 12000,
        "totalNetSalary": 48000,
        "paymentCount": 12
      }
    ]
  }
}
```

---

## Attendance Endpoints

### Clock In

```http
POST /api/attendance/clock-in
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "location": "Office",
  "notes": "On time"
}
```

### Clock Out

```http
POST /api/attendance/clock-out
```

### Get Attendance Records

```http
GET /api/attendance?employeeId=uuid&startDate=2024-01-01&endDate=2024-01-31
```

---

## Asset Management Endpoints

### Create Asset

```http
POST /api/assets/assets
```

**Request Body:**
```json
{
  "name": "MacBook Pro 16",
  "category": "LAPTOP",
  "serialNumber": "ABC123XYZ",
  "purchaseDate": "2024-01-01",
  "purchasePrice": 2500,
  "description": "M3 Max, 64GB RAM"
}
```

### Assign Asset

```http
POST /api/assets/assets/:id/assign
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "assignedDate": "2024-01-15",
  "notes": "For development work"
}
```

### Return Asset

```http
POST /api/assets/assets/:id/return
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

For complete API documentation with request/response examples, see the controllers in `server/src/controllers/`.
