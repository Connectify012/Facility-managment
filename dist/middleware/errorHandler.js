"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUncaughtException = exports.handleUnhandledRejection = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Handle MongoDB cast errors
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
// Handle MongoDB duplicate field errors
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
// Handle JWT errors
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);
// Send error in development
const sendErrorDev = (err, res) => {
    logger_1.logger.error('Error 🔥:', err);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
// Send error in production
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else {
        // Programming or unknown error: don't leak error details
        logger_1.logger.error('Error 🔥:', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        // Handle specific error types
        if (error.name === 'CastError')
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
exports.errorHandler = errorHandler;
// Handle unhandled promise rejections
const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err) => {
        logger_1.logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
        logger_1.logger.error(err.name, err.message);
        process.exit(1);
    });
};
exports.handleUnhandledRejection = handleUnhandledRejection;
// Handle uncaught exceptions
const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        logger_1.logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
        logger_1.logger.error(err.name, err.message);
        process.exit(1);
    });
};
exports.handleUncaughtException = handleUncaughtException;
