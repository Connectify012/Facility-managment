import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, UserRole, UserStatus } from '../models/User';
import { logger } from '../utils/logger';
import { AppError } from './errorHandler';

// Interface for JWT payload
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Interface for authenticated request
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export class AuthMiddleware {
  // Middleware to check if user is authenticated
  static async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Authentication required. Please provide a valid token', 401));
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return next(new AppError('Authentication required. Please provide a valid token', 401));
      }

      // Verify token
      let decoded: JWTPayload;
      try {
        decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          return next(new AppError('Token has expired. Please login again', 401));
        } else if (error.name === 'JsonWebTokenError') {
          return next(new AppError('Invalid token. Please login again', 401));
        } else {
          return next(new AppError('Token verification failed', 401));
        }
      }

      // Check if user still exists
      const user = await User.findOne({ 
        _id: decoded.id, 
        isDeleted: false 
      })
        .populate('managedFacilities', 'siteName city facilityType');

      if (!user) {
        return next(new AppError('User no longer exists. Please login again', 401));
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        return next(new AppError(`Account is ${user.status}. Please contact administrator`, 403));
      }

      // Check if user's account is locked
      if (user.isAccountLocked()) {
        const lockoutTime = user.security.lockoutUntil;
        const remainingTime = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / (1000 * 60)) : 0;
        return next(new AppError(`Account is locked. Try again in ${remainingTime} minutes`, 423));
      }

      // Check if token is in user's active sessions (optional security check)
      const isValidSession = user.security.sessionTokens?.some((session: any) => session.token === token);
      if (!isValidSession) {
        return next(new AppError('Session is no longer valid. Please login again', 401));
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error: any) {
      logger.error('Authentication error:', error);
      return next(new AppError('Authentication failed', 500));
    }
  }

  // Middleware to check if user has required role(s)
  static authorize(...allowedRoles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          return next(new AppError('Authentication required', 401));
        }

        const userRole = req.user.role as UserRole;

        // Super admin has access to everything
        if (userRole === UserRole.SUPER_ADMIN) {
          return next();
        }

        // Check if user role is in allowed roles
        if (!allowedRoles.includes(userRole)) {
          return next(new AppError('Insufficient permissions to access this resource', 403));
        }

        next();
      } catch (error: any) {
        logger.error('Authorization error:', error);
        return next(new AppError('Authorization failed', 500));
      }
    };
  }

  // Middleware to check if user has admin privileges (super_admin or admin)
  static requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN)(req, res, next);
  }

  // Middleware to check if user has super admin privileges (super_admin only)
  static requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(UserRole.SUPER_ADMIN)(req, res, next);
  }

  // Middleware to check if user has management privileges (super_admin, admin, or facility_manager)
  static requireManager(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACILITY_MANAGER)(req, res, next);
  }

  // Middleware to check if user has supervisor privileges (super_admin, admin, facility_manager, or supervisor)
  static requireSupervisor(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(
      UserRole.SUPER_ADMIN, 
      UserRole.ADMIN, 
      UserRole.FACILITY_MANAGER, 
      UserRole.SUPERVISOR
    )(req, res, next);
  }

  // Middleware to check if user can access their own resources or has admin privileges
  static requireOwnershipOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const userRole = req.user.role as UserRole;
      const userId = req.user._id.toString();
      const targetUserId = req.params.id || req.params.userId;

      // Super admin and admin can access any resource
      if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
        return next();
      }

      // User can access their own resources
      if (targetUserId && userId === targetUserId) {
        return next();
      }

      // Check if user is a manager of the target user
      if (userRole === UserRole.FACILITY_MANAGER || userRole === UserRole.SUPERVISOR) {
        // This would require checking if the target user is a subordinate
        // For now, we'll allow managers to access resources of their subordinates
        // This logic can be enhanced based on specific business requirements
        return next();
      }

      return next(new AppError('Access denied. You can only access your own resources', 403));
    } catch (error: any) {
      logger.error('Ownership check error:', error);
      return next(new AppError('Access check failed', 500));
    }
  }

  // Middleware to check if user has permission to manage facilities
  static requireFacilityAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const userRole = req.user.role as UserRole;
      const facilityId = req.params.facilityId;

      // Super admin and admin have access to all facilities
      if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
        return next();
      }

      // Facility managers can access their assigned facilities
      if (userRole === UserRole.FACILITY_MANAGER) {
        const managedFacilities = req.user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId && managedFacilities.includes(facilityId)) {
          return next();
        }
      }

      // Other roles can access facilities they manage
      const managedFacilities = req.user.managedFacilities.map((f: any) => f._id.toString());
      if (facilityId && managedFacilities.includes(facilityId)) {
        return next();
      }

      return next(new AppError('Access denied. You do not have permission to access this facility', 403));
    } catch (error: any) {
      logger.error('Facility access check error:', error);
      return next(new AppError('Facility access check failed', 500));
    }
  }

  // Optional authentication (for endpoints that work with or without authentication)
  static async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
        
        const user = await User.findOne({ 
          _id: decoded.id, 
          isDeleted: false 
        });

        if (user && user.status === UserStatus.ACTIVE && !user.isAccountLocked()) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors in optional auth
      }

      next();
    } catch (error: any) {
      logger.error('Optional authentication error:', error);
      next();
    }
  }
}