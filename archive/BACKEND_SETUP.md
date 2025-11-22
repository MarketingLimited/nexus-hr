# Backend Setup Guide

This guide will help you set up the Nexus HR backend with database.

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose:

### 1. Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### 2. Start Services

```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Wait for database to be ready (about 10 seconds)
docker-compose logs -f postgres
# Press Ctrl+C when you see "database system is ready to accept connections"
```

### 3. Set Up Backend Locally

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with database URL
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_hr?schema=public"

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed

# Start the development server
npm run dev
```

The backend API will be available at `http://localhost:3001`.

## Alternative: Full Docker Setup

To run both database and backend in Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## Manual Setup (Without Docker)

### 1. Install PostgreSQL

Install PostgreSQL 14+ on your system:

- **macOS**: `brew install postgresql@16`
- **Ubuntu**: `sudo apt install postgresql-16`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

### 2. Create Database

```bash
# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Create database
psql -U postgres
CREATE DATABASE nexus_hr;
\q
```

### 3. Configure Backend

```bash
cd server
npm install
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/nexus_hr?schema=public"

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Verify Installation

### Test the API

```bash
# Health check
curl http://localhost:3001/health

# Login with test account
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

This opens a web interface at `http://localhost:5555`.

## Test Accounts

After seeding:

- **Admin**: admin@nexushr.com / admin123
- **Employee**: john.doe@nexushr.com / password123

## Frontend Configuration

Update the frontend to use the backend API:

1. Open `/nexus-hr/.env`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

2. Restart the frontend dev server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Database Connection Error

If you see "Can't reach database server":

1. Ensure PostgreSQL is running:
   ```bash
   docker-compose ps postgres  # If using Docker
   sudo service postgresql status  # If installed locally
   ```

2. Check the DATABASE_URL in `.env`

3. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use

If port 3001 is taken:

1. Change PORT in `server/.env`
2. Update VITE_API_URL in frontend `.env`

### Migration Errors

Reset and rerun migrations:

```bash
cd server
npm run prisma:migrate reset
npm run prisma:seed
```

## Database Management Commands

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Seed database
npm run prisma:seed
```

## Environment Variables

### Required Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secure-secret-key
```

### Optional Variables

```env
PORT=3001
NODE_ENV=development
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

## Production Deployment

### Using Docker

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f
```

### Manual Deployment

```bash
cd server

# Build TypeScript
npm run build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=your-production-db-url
export JWT_SECRET=your-production-secret

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

## Next Steps

1. ✅ Backend is running
2. Configure frontend to use the API
3. Test authentication flow
4. Explore API endpoints in README.md
5. Start building features!

## Support

For issues or questions:
- Check the main [Backend README](server/README.md)
- Review API documentation
- Check logs: `docker-compose logs backend`
