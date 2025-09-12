"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.premiumLimiter = exports.createDynamicLimiter = exports.applicationLimiter = exports.emailLimiter = exports.postLimiter = exports.searchLimiter = exports.uploadLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limit
exports.generalLimiter = (0, express_rate_limit_1.default)({
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
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.'
    },
    statusCode: 429,
    skipSuccessfulRequests: true
});
// Password reset rate limit
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
        error: 'Too many password reset attempts, please try again later.'
    },
    statusCode: 429
});
// File upload rate limit
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 uploads per hour
    message: {
        error: 'Too many file uploads, please try again later.'
    },
    statusCode: 429
});
// Search rate limit
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 searches per minute
    message: {
        error: 'Too many search requests, please try again later.'
    },
    statusCode: 429
});
// Post creation rate limit
exports.postLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 posts per hour
    message: {
        error: 'Too many posts created, please try again later.'
    },
    statusCode: 429
});
// Email sending rate limit
exports.emailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 emails per hour
    message: {
        error: 'Too many emails sent, please try again later.'
    },
    statusCode: 429
});
// Job application rate limit
exports.applicationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Limit each IP to 10 job applications per day
    message: {
        error: 'Too many job applications today, please try again tomorrow.'
    },
    statusCode: 429
});
// Create dynamic rate limiter based on user role
const createDynamicLimiter = (limits) => {
    return (req, res, next) => {
        const userRole = req.user?.role || 'guest';
        const limit = limits[userRole] || limits.default || { windowMs: 15 * 60 * 1000, max: 100 };
        const limiter = (0, express_rate_limit_1.default)({
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
exports.createDynamicLimiter = createDynamicLimiter;
// Premium user rate limiter (higher limits)
exports.premiumLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Higher limit for premium users
    message: {
        error: 'Rate limit exceeded, even for premium users.'
    },
    statusCode: 429
});
exports.default = {
    generalLimiter: exports.generalLimiter,
    authLimiter: exports.authLimiter,
    passwordResetLimiter: exports.passwordResetLimiter,
    uploadLimiter: exports.uploadLimiter,
    searchLimiter: exports.searchLimiter,
    postLimiter: exports.postLimiter,
    emailLimiter: exports.emailLimiter,
    applicationLimiter: exports.applicationLimiter,
    createDynamicLimiter: exports.createDynamicLimiter,
    premiumLimiter: exports.premiumLimiter
};
