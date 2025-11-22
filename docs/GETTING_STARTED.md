# Getting Started with Nexus HR

Complete guide to setting up and running Nexus HR in your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+
- **PostgreSQL** 16 ([Download](https://www.postgresql.org/download/))
- **Docker & Docker Compose** (optional, recommended) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## Quick Start (5 Minutes)

The fastest way to get Nexus HR running:

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd nexus-hr
```

### 2. Start PostgreSQL with Docker

```bash
docker-compose up -d postgres

# Wait for database to be ready (about 10 seconds)
docker-compose logs -f postgres
# Press Ctrl+C when you see "database system is ready to accept connections"
```

### 3. Set Up Backend

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3001`.

### 4. Set Up Frontend (New Terminal)

```bash
# From project root
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 5. Log In

Open http://localhost:5173 and log in with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@nexushr.com | admin123 |
| **Employee** | john.doe@nexushr.com | password123 |

**🔒 Security Note**: Change these passwords in production!

---

## Detailed Setup

### Option A: Docker Compose (Full Stack)

Run everything in containers:

```bash
# Build and start all services (Database + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Check service status
docker-compose ps
```

Services will be available at:
- Frontend: http://localhost:80
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Option B: Manual Setup (Without Docker)

#### 1. Install PostgreSQL Locally

**macOS**:
```bash
brew install postgresql@16
brew services start postgresql
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql-16
sudo service postgresql start
```

**Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

#### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nexus_hr;
\q
```

#### 3. Configure Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexus_hr?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start server
npm run dev
```

#### 4. Configure Frontend

From project root:

```bash
# Install dependencies
npm install

# Create .env file (if doesn't exist)
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "VITE_USE_MSW=false" >> .env

# Start development server
npm run dev
```

---

## Verify Installation

### Test the Backend API

```bash
# Health check
curl http://localhost:3001/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexushr.com",
    "password": "admin123"
  }'
```

You should receive a JWT token in the response.

### Access Prisma Studio

View and edit your database with Prisma Studio:

```bash
cd server
npm run prisma:studio
```

Opens at `http://localhost:5555`.

---

## Environment Configuration

### Frontend Environment Variables

Create `.env` in project root:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Mock Service Worker (set to false for real backend)
VITE_USE_MSW=false
```

### Backend Environment Variables

Required variables in `server/.env`:

```env
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_hr?schema=public

# Server configuration
PORT=3001
NODE_ENV=development

# JWT configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Optional
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

**Generate a secure JWT secret**:
```bash
openssl rand -base64 32
```

---

## Development Workflow

### Running the Application

**Terminal 1** (Backend):
```bash
cd server
npm run dev
```

**Terminal 2** (Frontend):
```bash
npm run dev
```

**Terminal 3** (Database - Docker):
```bash
docker-compose up postgres
```

### Available Scripts

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:coverage # Run tests with coverage
```

#### Backend

```bash
cd server

npm run dev              # Start with hot reload
npm run build            # Build TypeScript
npm start                # Start production server
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run prisma:generate  # Generate Prisma Client
npm test                 # Run tests
```

---

## Frontend-Backend Integration

The frontend is fully integrated with the backend API. All data is fetched from real endpoints.

### How It Works

1. **API Client**: Configured in `src/services/api.ts`
2. **Authentication**: JWT tokens stored in localStorage
3. **State Management**: TanStack Query (React Query) for server state
4. **Auto-refresh**: Queries automatically refetch on window focus

### API Structure

All API endpoints follow this pattern:

```
http://localhost:3001/api/{resource}

Examples:
- POST   /api/auth/login
- GET    /api/employees
- GET    /api/employees/:id
- POST   /api/employees
- PUT    /api/employees/:id
- DELETE /api/employees/:id
```

See [API Documentation](./API.md) for complete endpoint reference.

---

## Database Management

### Migrations

```bash
cd server

# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Database Schema

View the schema:
```bash
cd server
cat prisma/schema.prisma
```

Main tables:
- `User` - Authentication and user accounts
- `Employee` - Employee records
- `AttendanceRecord` - Daily attendance
- `PerformanceReview` - Performance data
- `Goal` - Employee goals
- `Feedback` - 360° feedback
- `Document` - Document metadata
- `LeaveRequest` - Leave management
- `PayrollRecord` - Payroll data
- `OnboardingTask` - Onboarding checklists
- `Asset` - Company assets

---

## Troubleshooting

### Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:
1. Ensure PostgreSQL is running:
   ```bash
   # Docker
   docker-compose ps postgres

   # macOS
   brew services list

   # Linux
   sudo service postgresql status
   ```

2. Check DATABASE_URL in `server/.env`

3. Test connection:
   ```bash
   psql -h localhost -U postgres -d nexus_hr
   ```

### Port Already in Use

**Error**: `EADDRINUSE :::5173` or `:::3001`

**Solutions**:
```bash
# Find and kill process using the port
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Or change port in configuration
# Frontend: vite.config.ts
# Backend: server/.env (PORT=3002)
```

### Frontend Shows "Network Error"

**Cause**: Cannot reach backend

**Solutions**:
1. Verify backend is running (`npm run dev` in `server/`)
2. Check `VITE_API_URL` in `.env`
3. Verify CORS settings in `server/src/index.ts`

### Prisma Client Out of Sync

**Error**: `Prisma Client does not match schema`

**Solution**:
```bash
cd server
npx prisma generate
npm run build
```

### 401 Unauthorized Errors

**Cause**: Missing or expired JWT token

**Solutions**:
1. Log out and log in again
2. Clear localStorage: `localStorage.clear()` in browser console
3. Verify JWT_SECRET is set in `server/.env`

---

## Next Steps

1. ✅ Development environment is running
2. Explore the application features
3. Read the [Architecture Documentation](./ARCHITECTURE.md)
4. Review [API Documentation](./API.md)
5. Learn about [Security Best Practices](./SECURITY.md)
6. Set up [Testing](./TESTING.md)
7. Plan your [Deployment](./DEPLOYMENT.md)

---

## Additional Resources

- **Backend API Reference**: [server/README.md](../server/README.md)
- **Frontend-Backend Integration**: [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
- **Troubleshooting Guide**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Getting Help

If you encounter issues:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review logs:
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser console
   - Database: `docker-compose logs postgres`
3. Search [GitHub Issues](https://github.com/MarketingLimited/nexus-hr/issues)
4. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Error messages/logs
   - Environment details (OS, Node version, etc.)

---

**Ready to develop!** 🚀

The system is now set up and ready for development. Start exploring the codebase and building features.
