# Nexus HR - Complete HR Management System

A modern, full-stack Human Resources Management System with a React frontend and Node.js/Express backend powered by PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd nexus-hr

# 2. Start PostgreSQL database
docker-compose up -d postgres

# 3. Set up backend
cd server
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 4. In a new terminal, set up frontend
cd ..
npm install --legacy-peer-deps
npm run dev
```

**That's it!** Open http://localhost:5173 and log in with the credentials below.

## 🔐 Default User Credentials

After running the database seed, use these accounts to log in:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@nexushr.com` | `admin123` | Full system access |
| **Employee** | `john.doe@nexushr.com` | `password123` | Limited access |
| **Employee** | `jane.smith@nexushr.com` | `password123` | HR Department |
| **Employee** | `mike.johnson@nexushr.com` | `password123` | Product Manager |

**🔒 Security Note**: Change these passwords in production!

## ✨ Features

### Core HR Modules
- **👥 Employee Management** - Complete employee lifecycle management
- **⏰ Attendance Tracking** - Clock in/out, biometric integration, shift scheduling
- **📊 Performance Reviews** - 360° feedback, goal tracking, performance analytics
- **📄 Document Management** - Secure document storage with permissions
- **🏖️ Leave Management** - Leave requests, approvals, calendar integration
- **💰 Payroll** - Salary processing, tax calculations, payslip generation
- **🎯 Onboarding** - Digital onboarding workflows and checklists
- **🔧 Asset Management** - Track company assets and assignments

### Advanced Features
- **🔐 Role-Based Access Control (RBAC)** - Admin, HR, Manager, Employee roles
- **📈 Analytics & Reporting** - Real-time dashboards and insights
- **🔔 Notifications** - System-wide notification center
- **🌐 Offline Support** - PWA with offline capabilities
- **🔄 Real-time Sync** - Live updates across devices
- **🎨 Theming** - Light/dark mode support
- **📱 Responsive Design** - Works on desktop, tablet, and mobile

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Zod** - Validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD
- **MSW** - API mocking for development

## 📖 Documentation

- **[Backend Setup Guide](BACKEND_SETUP.md)** - Detailed backend installation
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Frontend-backend integration
- **[Backend API Documentation](server/README.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

## 🛠️ Development

### Project Structure

```
nexus-hr/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   └── lib/               # Utilities
├── server/                # Backend source
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── config/        # Configuration
│   └── prisma/
│       ├── schema.prisma  # Database schema
│       └── seed.ts        # Seed data
├── docker-compose.yml     # Docker services
└── .github/workflows/     # CI/CD pipelines
```

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
cd server
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
npm run prisma:studio # Open Prisma Studio
npm run prisma:migrate # Run migrations
npm run prisma:seed   # Seed database
```

### Environment Variables

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001/api
VITE_USE_MSW=false
```

#### Backend `server/.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_hr"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## 🐳 Docker Deployment

### Quick Deploy with Docker Compose

```bash
# Start all services (Database + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services

- **PostgreSQL**: `localhost:5432`
- **Backend API**: `localhost:3001`
- **Frontend**: `localhost:5173` (dev) or `localhost:80` (production)

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions including:

- Docker production builds
- Kubernetes deployment
- CI/CD pipeline setup
- Environment configuration
- SSL/HTTPS setup
- Monitoring and logging

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test

# E2E tests
npm run test:e2e
```

## 📊 Database

### Schema Overview

The system uses PostgreSQL with the following main tables:

- **users** - Authentication and user accounts
- **employees** - Employee records
- **attendance_records** - Daily attendance
- **performance_reviews** - Performance data
- **goals** - Employee goals
- **feedback** - 360° feedback
- **documents** - Document metadata
- **leave_requests** - Leave management
- **payroll_records** - Payroll data
- **onboarding_tasks** - Onboarding checklists
- **assets** - Company assets

### Migrations

```bash
cd server

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 🔧 Configuration

### Toggle Between Mock and Real API

**Using Real Backend (Default)**:
```env
VITE_USE_MSW=false
VITE_API_URL=http://localhost:3001/api
```

**Using Mock Data (Development)**:
```env
VITE_USE_MSW=true
VITE_API_URL=/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the guides in the repository
- **Issues**: [GitHub Issues](https://github.com/your-org/nexus-hr/issues)
- **Backend Logs**: `docker-compose logs backend`
- **Database**: Access via Prisma Studio (`npm run prisma:studio`)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Integration with third-party services (Slack, Teams, etc.)
- [ ] Multi-language support
- [ ] Custom report builder
- [ ] AI-powered insights

## 👏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Made with ❤️ for modern HR teams**
