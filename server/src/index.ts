import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import performanceRoutes from './routes/performanceRoutes';
import documentRoutes from './routes/documentRoutes';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Nexus HR API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${config.port}`);
});

export default app;
