"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/starter_app',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_EXPIRY: process.env.JWT_EXPIRES_IN || '24h', // Backward compatibility
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRES_IN || '30d', // Backward compatibility
    DB_NAME: process.env.DB_NAME || 'starter_app',
    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    // AWS Configuration
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'starter-app-files',
    AWS_CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN || '',
    // Google Services
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
    // OpenAI Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    // Google OAuth Configuration
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    // Email Configuration
    AWS_SES_REGION: process.env.AWS_SES_REGION || 'us-east-1',
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@example.com',
    FROM_NAME: process.env.FROM_NAME || 'Starter App Team',
    EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    EMAIL_SMTP_PORT: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
    EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER || '',
    EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD || '',
    USE_AWS_SES: process.env.USE_AWS_SES === 'true',
    SMTP_HOST: process.env.SMTP_HOST || process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || process.env.EMAIL_SMTP_PORT || '587', 10),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_SMTP_PASSWORD || '',
    // Redis Configuration
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
    // SMS Configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
    TWILIO_SERVICE_SID: process.env.TWILIO_SERVICE_SID || '',
    // Payment Configuration
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    // File Upload Limits
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    // Puppeteer Configuration
    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || (process.env.NODE_ENV === 'production' ? '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux*/chrome' : '')
};
exports.config = config;
// Validate required environment variables in production
if (config.NODE_ENV === 'production') {
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_S3_BUCKET',
        'OPENAI_API_KEY'
    ];
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            throw new Error(`Required environment variable ${varName} is not set`);
        }
    }
}
