"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("./errorHandler");
class AuthMiddleware {
    // Middleware to check if user is authenticated
    static async authenticate(req, res, next) {
        try {
            // Get token from header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new errorHandler_1.AppError('Authentication required. Please provide a valid token', 401));
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                return next(new errorHandler_1.AppError('Authentication required. Please provide a valid token', 401));
            }
            // Verify token
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
            }
            catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return next(new errorHandler_1.AppError('Token has expired. Please login again', 401));
                }
                else if (error.name === 'JsonWebTokenError') {
                    return next(new errorHandler_1.AppError('Invalid token. Please login again', 401));
                }
                else {
                    return next(new errorHandler_1.AppError('Token verification failed', 401));
                }
            }
            // Check if user still exists
            const user = await User_1.User.findOne({
                _id: decoded.id,
                isDeleted: false
            })
                .populate('assignedFacilities', 'siteName city facilityType')
                .populate('managedFacilities', 'siteName city facilityType')
                .populate('managerId', 'firstName lastName email role');
            if (!user) {
                return next(new errorHandler_1.AppError('User no longer exists. Please login again', 401));
            }
            // Check if user is active
            if (user.status !== User_1.UserStatus.ACTIVE) {
                return next(new errorHandler_1.AppError(`Account is ${user.status}. Please contact administrator`, 403));
            }
            // Check if user's account is locked
            if (user.isAccountLocked()) {
                const lockoutTime = user.security.lockoutUntil;
                const remainingTime = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / (1000 * 60)) : 0;
                return next(new errorHandler_1.AppError(`Account is locked. Try again in ${remainingTime} minutes`, 423));
            }
            // Check if token is in user's active sessions (optional security check)
            const isValidSession = user.security.sessionTokens?.some((session) => session.token === token);
            if (!isValidSession) {
                return next(new errorHandler_1.AppError('Session is no longer valid. Please login again', 401));
            }
            // Attach user to request object
            req.user = user;
            next();
        }
        catch (error) {
            logger_1.logger.error('Authentication error:', error);
            return next(new errorHandler_1.AppError('Authentication failed', 500));
        }
    }
    // Middleware to check if user has required role(s)
    static authorize(...allowedRoles) {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    return next(new errorHandler_1.AppError('Authentication required', 401));
                }
                const userRole = req.user.role;
                // Super admin has access to everything
                if (userRole === User_1.UserRole.SUPER_ADMIN) {
                    return next();
                }
                // Check if user role is in allowed roles
                if (!allowedRoles.includes(userRole)) {
                    return next(new errorHandler_1.AppError('Insufficient permissions to access this resource', 403));
                }
                next();
            }
            catch (error) {
                logger_1.logger.error('Authorization error:', error);
                return next(new errorHandler_1.AppError('Authorization failed', 500));
            }
        };
    }
    // Middleware to check if user has admin privileges (super_admin or admin)
    static requireAdmin(req, res, next) {
        AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN)(req, res, next);
    }
    // Middleware to check if user has management privileges (super_admin, admin, or facility_manager)
    static requireManager(req, res, next) {
        AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN, User_1.UserRole.FACILITY_MANAGER)(req, res, next);
    }
    // Middleware to check if user has supervisor privileges (super_admin, admin, facility_manager, or supervisor)
    static requireSupervisor(req, res, next) {
        AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN, User_1.UserRole.FACILITY_MANAGER, User_1.UserRole.SUPERVISOR)(req, res, next);
    }
    // Middleware to check if user can access their own resources or has admin privileges
    static requireOwnershipOrAdmin(req, res, next) {
        try {
            if (!req.user) {
                return next(new errorHandler_1.AppError('Authentication required', 401));
            }
            const userRole = req.user.role;
            const userId = req.user._id.toString();
            const targetUserId = req.params.id || req.params.userId;
            // Super admin and admin can access any resource
            if (userRole === User_1.UserRole.SUPER_ADMIN || userRole === User_1.UserRole.ADMIN) {
                return next();
            }
            // User can access their own resources
            if (targetUserId && userId === targetUserId) {
                return next();
            }
            // Check if user is a manager of the target user
            if (userRole === User_1.UserRole.FACILITY_MANAGER || userRole === User_1.UserRole.SUPERVISOR) {
                // This would require checking if the target user is a subordinate
                // For now, we'll allow managers to access resources of their subordinates
                // This logic can be enhanced based on specific business requirements
                return next();
            }
            return next(new errorHandler_1.AppError('Access denied. You can only access your own resources', 403));
        }
        catch (error) {
            logger_1.logger.error('Ownership check error:', error);
            return next(new errorHandler_1.AppError('Access check failed', 500));
        }
    }
    // Middleware to check if user has permission to manage facilities
    static requireFacilityAccess(req, res, next) {
        try {
            if (!req.user) {
                return next(new errorHandler_1.AppError('Authentication required', 401));
            }
            const userRole = req.user.role;
            const facilityId = req.params.facilityId;
            // Super admin and admin have access to all facilities
            if (userRole === User_1.UserRole.SUPER_ADMIN || userRole === User_1.UserRole.ADMIN) {
                return next();
            }
            // Facility managers can access their assigned facilities
            if (userRole === User_1.UserRole.FACILITY_MANAGER) {
                const managedFacilities = req.user.managedFacilities.map((f) => f._id.toString());
                if (facilityId && managedFacilities.includes(facilityId)) {
                    return next();
                }
            }
            // Other roles can access facilities they are assigned to
            const assignedFacilities = req.user.assignedFacilities.map((f) => f._id.toString());
            if (facilityId && assignedFacilities.includes(facilityId)) {
                return next();
            }
            return next(new errorHandler_1.AppError('Access denied. You do not have permission to access this facility', 403));
        }
        catch (error) {
            logger_1.logger.error('Facility access check error:', error);
            return next(new errorHandler_1.AppError('Facility access check failed', 500));
        }
    }
    // Optional authentication (for endpoints that work with or without authentication)
    static async optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next();
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                return next();
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
                const user = await User_1.User.findOne({
                    _id: decoded.id,
                    isDeleted: false
                });
                if (user && user.status === User_1.UserStatus.ACTIVE && !user.isAccountLocked()) {
                    req.user = user;
                }
            }
            catch (error) {
                // Ignore token errors in optional auth
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Optional authentication error:', error);
            next();
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
