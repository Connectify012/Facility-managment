import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { User, UserStatus, VerificationStatus } from '../models/User';
import { logger } from '../utils/logger';

// Interface for JWT payload
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Interface for login request body
interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
}

export class AuthController {
  // Generate JWT token
  private static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn?: string | number): string {
    const options: SignOptions = {
      expiresIn: (expiresIn || config.JWT_EXPIRES_IN) as StringValue | number
    };
    return jwt.sign(payload, config.JWT_SECRET as string, options);
  }

  // Generate refresh token
  private static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as StringValue | number
    };
    return jwt.sign(payload, config.JWT_REFRESH_SECRET as string, options);
  }

  // Verify JWT token
  private static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
  }

  // Verify refresh token
  private static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JWTPayload;
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password, rememberMe = false }: LoginRequest = req.body;

      // Validate input
      if (!password) {
        return next(new AppError('Password is required', 400));
      }

      if (!email && !username) {
        return next(new AppError('Email or username is required', 400));
      }

      // Build query to find user
      const query: any = { isDeleted: false };
      if (email) {
        query.email = email.toLowerCase();
      } else if (username) {
        query.username = username;
      }

      // Find user with password
      const user = await User.findOne(query).select('+password');

      if (!user) {
        return next(new AppError('Invalid credentials', 401));
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        const lockoutTime = user.security.lockoutUntil;
        const remainingTime = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / (1000 * 60)) : 0;
        return next(new AppError(`Account is locked. Try again in ${remainingTime} minutes`, 423));
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        await user.incrementFailedLogin();
        logger.warn(`Failed login attempt for user: ${user.email}`);
        return next(new AppError('Invalid credentials', 401));
      }

      // Check user status
      if (user.status !== UserStatus.ACTIVE) {
        return next(new AppError(`Account is ${user.status}. Please contact administrator`, 403));
      }

      // Check verification status
      if (user.verificationStatus !== VerificationStatus.VERIFIED) {
        return next(new AppError('Account is not verified. Please verify your email first', 403));
      }

      // Reset failed login attempts on successful login
      await user.resetFailedLogin();

      // Update last login
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      await user.updateLastLogin(clientIP);

      // Generate tokens
      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      };

      const accessTokenExpiry = rememberMe ? '7d' : config.JWT_EXPIRES_IN;
      const accessToken = AuthController.generateToken(tokenPayload, accessTokenExpiry);
      const refreshToken = AuthController.generateRefreshToken(tokenPayload);

      // Store session token in user record
      await user.addSessionToken(accessToken, req.headers['user-agent'], clientIP);

      // Remove sensitive data from response
      const userResponse = user.toJSON();

      logger.info(`User logged in successfully: ${user.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            access: {
              token: accessToken,
              expiresIn: accessTokenExpiry
            },
            refresh: {
              token: refreshToken,
              expiresIn: config.JWT_REFRESH_EXPIRES_IN
            }
          }
        }
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      return next(new AppError('Login failed', 500));
    }
  }

  // Refresh access token
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new AppError('Refresh token is required', 400));
      }

      // Verify refresh token
      let decoded: JWTPayload;
      try {
        decoded = AuthController.verifyRefreshToken(refreshToken);
      } catch (error) {
        return next(new AppError('Invalid refresh token', 401));
      }

      // Find user
      const user = await User.findOne({ 
        _id: decoded.id, 
        isDeleted: false 
      });

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check user status
      if (user.status !== UserStatus.ACTIVE) {
        return next(new AppError(`Account is ${user.status}`, 403));
      }

      // Generate new access token
      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      };

      const newAccessToken = AuthController.generateToken(tokenPayload);

      // Update session token
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      await user.addSessionToken(newAccessToken, req.headers['user-agent'], clientIP);

      logger.info(`Token refreshed for user: ${user.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            access: {
              token: newAccessToken,
              expiresIn: config.JWT_EXPIRES_IN
            }
          }
        }
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      return next(new AppError('Token refresh failed', 500));
    }
  }

  // Logout user
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      let decoded: JWTPayload;
      try {
        decoded = AuthController.verifyToken(token);
      } catch (error) {
        return next(new AppError('Invalid token', 401));
      }

      // Find user and remove session token
      const user = await User.findOne({ 
        _id: decoded.id, 
        isDeleted: false 
      });

      if (user) {
        await user.removeSessionToken(token);
        logger.info(`User logged out: ${user.email}`);
      }

      res.status(200).json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      return next(new AppError('Logout failed', 500));
    }
  }

  // Logout from all devices
  static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      let decoded: JWTPayload;
      try {
        decoded = AuthController.verifyToken(token);
      } catch (error) {
        return next(new AppError('Invalid token', 401));
      }

      // Find user and clear all session tokens
      const user = await User.findOne({ 
        _id: decoded.id, 
        isDeleted: false 
      });

      if (user) {
        await user.clearAllSessions();
        logger.info(`User logged out from all devices: ${user.email}`);
      }

      res.status(200).json({
        status: 'success',
        message: 'Logged out from all devices successfully'
      });
    } catch (error: any) {
      logger.error('Logout all error:', error);
      return next(new AppError('Logout failed', 500));
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      let decoded: JWTPayload;
      try {
        decoded = AuthController.verifyToken(token);
      } catch (error) {
        return next(new AppError('Invalid token', 401));
      }

      // Find user
      const user = await User.findOne({ 
        _id: decoded.id, 
        isDeleted: false 
      })
        .populate('assignedFacilities', 'siteName city facilityType')
        .populate('managedFacilities', 'siteName city facilityType')
        .populate('managerId', 'firstName lastName email role')
        .populate('subordinates', 'firstName lastName email role');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check if user status is still active
      if (user.status !== UserStatus.ACTIVE) {
        return next(new AppError(`Account is ${user.status}`, 403));
      }

      logger.info(`Profile retrieved for user: ${user.email}`);

      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      return next(new AppError('Failed to get profile', 500));
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword, logoutAllDevices = false } = req.body;

      if (!currentPassword || !newPassword) {
        return next(new AppError('Current password and new password are required', 400));
      }

      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      let decoded: JWTPayload;
      try {
        decoded = AuthController.verifyToken(token);
      } catch (error) {
        return next(new AppError('Invalid token', 401));
      }

      // Find user with password
      const user = await User.findOne({ 
        _id: decoded.id, 
        isDeleted: false 
      }).select('+password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return next(new AppError('Current password is incorrect', 400));
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Optionally logout from all devices
      if (logoutAllDevices) {
        await user.clearAllSessions();
      }

      logger.info(`Password changed for user: ${user.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      logger.error('Change password error:', error);
      return next(new AppError('Failed to change password', 500));
    }
  }

  // Verify email token (for email verification)
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        return next(new AppError('Verification token is required', 400));
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with matching token that hasn't expired
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() },
        isDeleted: false
      });

      if (!user) {
        return next(new AppError('Invalid or expired verification token', 400));
      }

      // Update user verification status
      user.verificationStatus = VerificationStatus.VERIFIED;
      user.status = UserStatus.ACTIVE;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
      });
    } catch (error: any) {
      logger.error('Email verification error:', error);
      return next(new AppError('Email verification failed', 500));
    }
  }

  // Request password reset
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new AppError('Email is required', 400));
      }

      // Find user
      const user = await User.findOne({ 
        email: email.toLowerCase(), 
        isDeleted: false 
      });

      // Always return success to prevent email enumeration
      if (!user) {
        res.status(200).json({
          status: 'success',
          message: 'If an account with this email exists, a password reset link has been sent'
        });
        return;
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // TODO: Send email with reset token
      // For now, we'll log it (in production, send via email service)
      logger.info(`Password reset token for ${user.email}: ${resetToken}`);

      res.status(200).json({
        status: 'success',
        message: 'If an account with this email exists, a password reset link has been sent',
        // TODO: Remove this in production
        ...(config.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      return next(new AppError('Failed to process password reset request', 500));
    }
  }

  // Reset password with token
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token || !password) {
        return next(new AppError('Token and new password are required', 400));
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with matching token that hasn't expired
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
        isDeleted: false
      });

      if (!user) {
        return next(new AppError('Invalid or expired reset token', 400));
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      // Clear all existing sessions for security
      await user.clearAllSessions();
      await user.save();

      logger.info(`Password reset completed for user: ${user.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      logger.error('Reset password error:', error);
      return next(new AppError('Failed to reset password', 500));
    }
  }
}