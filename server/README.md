# Nexus HR Backend API

A comprehensive HR management system backend built with Node.js, Express, TypeScript, and PostgreSQL with Prisma ORM.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👥 **Employee Management** - Complete CRUD operations for employee records
- ⏰ **Attendance Tracking** - Clock in/out system with real-time statistics
- 📊 **Performance Management** - Reviews, goals, and 360° feedback
- 📄 **Document Management** - Secure document storage and permissions
- 💰 **Payroll Integration** - Payroll record management
- 📋 **Leave Management** - Leave request and approval workflow
- 🎯 **Onboarding** - Task management for new employees
- 🔧 **Asset Management** - Track company assets and assignments

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexus_hr?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Set Up Database

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Seed the database with sample data:

```bash
npm run prisma:seed
```

### 4. Start the Server

Development mode with hot reload:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`.

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Employees

#### Get All Employees
```http
GET /api/employees?page=1&limit=50&search=john&department=Engineering
Authorization: Bearer <token>
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search by name, email, or employee ID
- `department` (optional): Filter by department
- `status` (optional): Filter by status (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)

#### Get Single Employee
```http
GET /api/employees/:id
Authorization: Bearer <token>
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "position": "Software Engineer",
  "department": "Engineering",
  "location": "New York",
  "hireDate": "2024-01-15",
  "salary": 85000,
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Required Role**: ADMIN or HR

#### Update Employee
```http
PUT /api/employees/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": "Senior Software Engineer",
  "salary": 95000
}
```

**Required Role**: ADMIN or HR

#### Delete Employee
```http
DELETE /api/employees/:id
Authorization: Bearer <token>
```

**Required Role**: ADMIN

### Attendance

#### Get Attendance Records
```http
GET /api/attendance/records?employeeId=uuid&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Clock In
```http
POST /api/attendance/clock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "location": "Office - Floor 3"
}
```

#### Clock Out
```http
POST /api/attendance/clock-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid"
}
```

#### Get Attendance Statistics
```http
GET /api/attendance/stats
Authorization: Bearer <token>
```

Response:
```json
{
  "status": "success",
  "data": {
    "presentToday": 45,
    "lateToday": 3,
    "absentToday": 2,
    "attendanceRate": "96.0",
    "latePercentage": "6.0",
    "averageWorkHours": "8.2"
  }
}
```

### Performance

#### Get Performance Reviews
```http
GET /api/performance/reviews?employeeId=uuid&status=COMPLETED
Authorization: Bearer <token>
```

#### Create Performance Review
```http
POST /api/performance/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "reviewerId": "uuid",
  "period": "Q4 2024",
  "type": "QUARTERLY",
  "status": "IN_PROGRESS",
  "overallRating": 4.5,
  "competencies": [...],
  "feedback": {...}
}
```

#### Get Goals
```http
GET /api/performance/goals?employeeId=uuid
Authorization: Bearer <token>
```

#### Create Goal
```http
POST /api/performance/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "title": "Complete Project Alpha",
  "description": "Lead the development of Project Alpha",
  "category": "PROJECT",
  "priority": "HIGH",
  "targetDate": "2024-12-31",
  "status": "IN_PROGRESS",
  "progress": 60,
  "createdBy": "uuid"
}
```

#### Update Goal
```http
PUT /api/performance/goals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 75,
  "status": "IN_PROGRESS"
}
```

#### Get Feedback
```http
GET /api/performance/feedback?toEmployeeId=uuid
Authorization: Bearer <token>
```

#### Create Feedback
```http
POST /api/performance/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromEmployeeId": "uuid",
  "toEmployeeId": "uuid",
  "type": "PEER",
  "category": "COLLABORATION",
  "rating": 5,
  "comments": "Great team player!",
  "anonymous": false,
  "status": "SUBMITTED"
}
```

### Documents

#### Get Documents
```http
GET /api/documents?employeeId=uuid&category=contract
Authorization: Bearer <token>
```

#### Get Single Document
```http
GET /api/documents/:id
Authorization: Bearer <token>
```

#### Create Document
```http
POST /api/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Employment Contract",
  "type": "pdf",
  "category": "contract",
  "filePath": "/uploads/contract-123.pdf",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "employeeId": "uuid",
  "tags": ["contract", "legal"]
}
```

#### Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

## Database Schema

The database includes the following main tables:

- **users** - Authentication and user accounts
- **employees** - Employee records and personal information
- **attendance_records** - Daily attendance tracking
- **performance_reviews** - Performance review data
- **goals** - Employee goals and objectives
- **feedback** - 360° feedback system
- **documents** - Document storage metadata
- **leave_requests** - Leave management
- **payroll_records** - Payroll information
- **onboarding_tasks** - Onboarding checklists
- **assets** - Company assets
- **asset_assignments** - Asset allocation tracking

## Test Accounts

After seeding the database:

- **Admin**: admin@nexushr.com / admin123
- **Employee**: john.doe@nexushr.com / password123

## Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention via Prisma
- CORS configuration

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Development

### Database Management

View database in Prisma Studio:
```bash
npm run prisma:studio
```

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

Reset database:
```bash
npx prisma migrate reset
```

## Deployment

1. Set production environment variables
2. Build the project: `npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

## License

MIT

---

## Documentation

- [Complete Documentation Index](../docs/INDEX.md)
- [Getting Started Guide](../docs/GETTING_STARTED.md)
- [API Documentation](../docs/API.md)
- [Security Guide](../docs/SECURITY.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)
