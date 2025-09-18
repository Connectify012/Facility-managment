"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const compression_1 = __importDefault(require("compression"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Import route files
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const facilityDetails_routes_1 = __importDefault(require("./routes/facilityDetails.routes"));
const iotServiceManagement_routes_1 = __importDefault(require("./routes/iotServiceManagement.routes"));
const serviceManagement_routes_1 = __importDefault(require("./routes/serviceManagement.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const swagger_1 = require("./utils/swagger");
// Handle uncaught exceptions and unhandled rejections
(0, errorHandler_1.handleUncaughtException)();
(0, errorHandler_1.handleUnhandledRejection)();
const app = (0, express_1.default)();
exports.app = app;
// Trust proxy for rate limiting
app.set('trust proxy', 1);
// Security Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, desktop apps, etc.)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3002',
            'http://localhost:3001',
            'http://localhost:5173', // Vite dev server
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            config_1.config.FRONTEND_URL,
            config_1.config.CLIENT_URL
        ].filter(Boolean); // Remove undefined values
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
// app.use(cors(corsOptions));
// Compression middleware
app.use((0, compression_1.default)());
// Rate limiting
app.use('/api/', rateLimiter_1.generalLimiter);
// Request parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (config_1.config.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Swagger docs
(0, swagger_1.setupSwagger)(app);
// Health check endpoint for AWS Elastic Beanstalk
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/facilities', facilityDetails_routes_1.default);
app.use('/api/service-management', serviceManagement_routes_1.default);
app.use('/api/iot-service-management', iotServiceManagement_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Error handling
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
