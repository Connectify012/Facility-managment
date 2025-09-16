import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { config } from './config';
import { errorHandler, handleUncaughtException, handleUnhandledRejection } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { generalLimiter } from './middleware/rateLimiter';
// Import route files
import facilityDetailsRoutes from './routes/facilityDetails.routes';
import iotServiceManagementRoutes from './routes/iotServiceManagement.routes';
import serviceManagementRoutes from './routes/serviceManagement.routes';

import { setupSwagger } from './utils/swagger';

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// // CORS Configuration
// const corsOptions = {
//   origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
//     // Allow requests with no origin (mobile apps, desktop apps, etc.)
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'http://localhost:3002',
//       'http://localhost:3001', 
//       'http://localhost:5173', // Vite dev server
//       'http://127.0.0.1:3000',
//       'http://127.0.0.1:5173',
//       config.FRONTEND_URL,
//       config.CLIENT_URL
//     ].filter(Boolean); // Remove undefined values
    
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       callback(null, true); // Allow all origins in development
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'Origin',
//     'Access-Control-Request-Method',
//     'Access-Control-Request-Headers'
//   ],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   optionsSuccessStatus: 200 // Some legacy browsers choke on 204
// };

app.use(cors());

// Compression middleware
app.use(compression());

// Rate limiting
app.use('/api/', generalLimiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger docs
setupSwagger(app);

// Health check endpoint for AWS Elastic Beanstalk
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Routes
app.use('/api/facilities', facilityDetailsRoutes);
app.use('/api/service-management', serviceManagementRoutes);
app.use('/api/iot-service-management', iotServiceManagementRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };

