import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import timetableRoutes from './modules/timetable/timetable.routes.js';
import branchRoutes from './modules/branches/branches.routes.js';
import academicRoutes from './modules/academic/academic.routes.js';
import classRoutes from './modules/classes/classes.routes.js';
import sectionRoutes from './modules/sections/sections.routes.js';
import subjectRoutes from './modules/subjects/subjects.routes.js';
import userRoutes from './modules/users/users.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import courseRoutes from './modules/courses/courses.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import examRoutes from './modules/exams/exams.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import noticesRoutes from './modules/notices/notices.routes.js';

// ... we will add them as they are created

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Adjust for production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// Routes mounting
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/timetable`, timetableRoutes);
app.use(`${API_PREFIX}/branches`, branchRoutes);
app.use(`${API_PREFIX}/academic-years`, academicRoutes);
app.use(`${API_PREFIX}/classes`, classRoutes);
app.use(`${API_PREFIX}/sections`, sectionRoutes);
app.use(`${API_PREFIX}/subjects`, subjectRoutes);
app.use(`${API_PREFIX}/admin/users`, userRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);
app.use(`${API_PREFIX}/content`, contentRoutes);
app.use(`${API_PREFIX}/exams`, examRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/notices`, noticesRoutes);

// Mock endpoints to resolve dashboard 404s temporarily
app.get(`${API_PREFIX}/homework`, (req, res) => res.json({ success: true, data: [] }));
app.get(`${API_PREFIX}/billing/history`, (req, res) => res.json({ success: true, data: [] }));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global Error Handler
app.use(errorHandler);

export default app;
