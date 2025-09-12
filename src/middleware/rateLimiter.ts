import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

// General API rate limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  statusCode: 429,
  skipSuccessfulRequests: true
});

// Password reset rate limit
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.'
  },
  statusCode: 429
});

// File upload rate limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.'
  },
  statusCode: 429
});

// Search rate limit
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 searches per minute
  message: {
    error: 'Too many search requests, please try again later.'
  },
  statusCode: 429
});

// Post creation rate limit
export const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 posts per hour
  message: {
    error: 'Too many posts created, please try again later.'
  },
  statusCode: 429
});

// Email sending rate limit
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 emails per hour
  message: {
    error: 'Too many emails sent, please try again later.'
  },
  statusCode: 429
});

// Job application rate limit
export const applicationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 job applications per day
  message: {
    error: 'Too many job applications today, please try again tomorrow.'
  },
  statusCode: 429
});

// Create dynamic rate limiter based on user role
export const createDynamicLimiter = (limits: { [key: string]: { windowMs: number; max: number } }) => {
  return (req: Request, res: Response, next: any) => {
    const userRole = (req as any).user?.role || 'guest';
    const limit = limits[userRole] || limits.default || { windowMs: 15 * 60 * 1000, max: 100 };
    
    const limiter = rateLimit({
      windowMs: limit.windowMs,
      max: limit.max,
      message: {
        error: 'Rate limit exceeded for your user type.'
      },
      statusCode: 429
    });
    
    limiter(req, res, next);
  };
};

// Premium user rate limiter (higher limits)
export const premiumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for premium users
  message: {
    error: 'Rate limit exceeded, even for premium users.'
  },
  statusCode: 429
});

export default {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  searchLimiter,
  postLimiter,
  emailLimiter,
  applicationLimiter,
  createDynamicLimiter,
  premiumLimiter
};
