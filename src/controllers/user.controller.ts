import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { User, UserRole, UserStatus } from '../models/User';
import { logger } from '../utils/logger';
import { validateObjectId, validatePagination } from '../utils/validation';

export class UserController {
  // Create new user
  // Note: SUPER_ADMIN and ADMIN roles cannot be created through this endpoint for security reasons
  // Use User.createSuperAdmin() static method or dedicated admin creation process instead
  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const currentUser = req.user; // The authenticated user creating the employee

      // Prevent creation of SUPER_ADMIN and ADMIN roles through regular API
      if (userData.role === UserRole.SUPER_ADMIN || userData.role === UserRole.ADMIN) {
        return next(new AppError('Cannot create SUPER_ADMIN or ADMIN users through this endpoint. Use dedicated admin creation methods.', 403));
      }

      // Auto-populate createdBy field with current user's ID
      if (currentUser) {
        userData.createdBy = currentUser._id;
      }

      // Auto-assign facilities from current user (creator)
      // Remove managedFacilities from request body to prevent manual assignment
      delete userData.managedFacilities;
      
      // Assign facilities based on current user's role and managed facilities
      if (currentUser && currentUser.managedFacilities && currentUser.managedFacilities.length > 0) {
        userData.managedFacilities = currentUser.managedFacilities;
        logger.info(`User ${currentUser._id} creating employee with auto-assigned facilities: ${userData.managedFacilities}`);
      } else {
        // If current user has no managed facilities, assign empty array
        userData.managedFacilities = [];
        logger.info(`User ${currentUser._id} creating employee with no facilities (user has no managed facilities)`);
      }

      // Check if user with email already exists
      const existingUser = await User.findOne({ 
        email: userData.email.toLowerCase(),
        isDeleted: false 
      });

      if (existingUser) {
        return next(new AppError('User with this email already exists', 400));
      }

      // Check if username is provided and exists
      if (userData.username) {
        const existingUsername = await User.findOne({ 
          username: userData.username,
          isDeleted: false 
        });

        if (existingUsername) {
          return next(new AppError('Username already taken', 400));
        }
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Remove password from response
      const userResponse = user.toJSON();
      
      logger.info(`User created successfully: ${user._id} by ${currentUser?._id || 'system'}`);

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: userResponse
        }
      });
    } catch (error: any) {
      logger.error('Error creating user:', error);
      return next(new AppError('Error creating user', 500));
    }
  }

  // Get all users with pagination and filtering
  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role, status, search } = req.query;
      
      // Validate pagination
      const validatedPagination = validatePagination(page as string, limit as string);
      const skip = (validatedPagination.page - 1) * validatedPagination.limit;

      // Build filter object
      const filter: any = { isDeleted: false };

      if (role && Object.values(UserRole).includes(role as UserRole)) {
        filter.role = role;
      }

      if (status && Object.values(UserStatus).includes(status as UserStatus)) {
        filter.status = status;
      }

      // Add search functionality
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ];
      }

      // Get users with pagination
      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedPagination.limit)
        .populate('managedFacilities', 'siteName city facilityType');

      // Get total count for pagination
      const total = await User.countDocuments(filter);

      logger.info(`Retrieved ${users.length} users`);

      res.status(200).json({
        status: 'success',
        results: users.length,
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          pages: Math.ceil(total / validatedPagination.limit)
        },
        data: {
          users
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving users:', error);
      return next(new AppError('Error retrieving users', 500));
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      const user = await User.findOne({ _id: id, isDeleted: false })
        .select('-password')
        .populate('managedFacilities', 'siteName city facilityType')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      logger.info(`Retrieved user: ${user._id}`);

      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving user:', error);
      return next(new AppError('Error retrieving user', 500));
    }
  }

  // Update user
  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.emailVerificationToken;
      delete updateData.passwordResetToken;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingUser = await User.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: id },
          isDeleted: false 
        });

        if (existingUser) {
          return next(new AppError('User with this email already exists', 400));
        }
      }

      // Check if username is being updated and if it already exists
      if (updateData.username) {
        const existingUsername = await User.findOne({ 
          username: updateData.username,
          _id: { $ne: id },
          isDeleted: false 
        });

        if (existingUsername) {
          return next(new AppError('Username already taken', 400));
        }
      }

      // Auto-populate updatedBy field with current user's ID
      if (currentUser) {
        updateData.updatedBy = currentUser._id;
      }

      const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      ).select('-password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      logger.info(`User updated successfully: ${user._id} by ${currentUser?._id || 'system'}`);

      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user
        }
      });
    } catch (error: any) {
      logger.error('Error updating user:', error);
      return next(new AppError('Error updating user', 500));
    }
  }

  // Delete user (soft delete)
  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      // Check if user exists and is not already deleted
      const user = await User.findOne({ _id: id, isDeleted: false });

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Prevent deletion of super admin
      if (user.role === UserRole.SUPER_ADMIN) {
        return next(new AppError('Cannot delete super admin user', 403));
      }

      // Soft delete
      const deleteData: any = {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.INACTIVE
      };

      // Auto-populate deletedBy field with current user's ID
      if (currentUser) {
        deleteData.deletedBy = currentUser._id;
      }

      await User.findByIdAndUpdate(id, deleteData);

      logger.info(`User deleted successfully: ${id} by ${currentUser?._id || 'system'}`);

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting user:', error);
      return next(new AppError('Error deleting user', 500));
    }
  }

  // Restore deleted user
  static async restoreUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: true },
        { 
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          status: UserStatus.ACTIVE
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return next(new AppError('Deleted user not found', 404));
      }

      logger.info(`User restored successfully: ${user._id}`);

      res.status(200).json({
        status: 'success',
        message: 'User restored successfully',
        data: {
          user
        }
      });
    } catch (error: any) {
      logger.error('Error restoring user:', error);
      return next(new AppError('Error restoring user', 500));
    }
  }

  // Update user status
  static async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      // Validate status
      if (!Object.values(UserStatus).includes(status)) {
        return next(new AppError('Invalid status value', 400));
      }

      const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { status },
        { new: true }
      ).select('-password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      logger.info(`User status updated successfully: ${user._id} to ${status}`);

      res.status(200).json({
        status: 'success',
        message: 'User status updated successfully',
        data: {
          user
        }
      });
    } catch (error: any) {
      logger.error('Error updating user status:', error);
      return next(new AppError('Error updating user status', 500));
    }
  }

  // Update user role
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      // Validate role
      if (!Object.values(UserRole).includes(role)) {
        return next(new AppError('Invalid role value', 400));
      }

      const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      logger.info(`User role updated successfully: ${user._id} to ${role}`);

      res.status(200).json({
        status: 'success',
        message: 'User role updated successfully',
        data: {
          user
        }
      });
    } catch (error: any) {
      logger.error('Error updating user role:', error);
      return next(new AppError('Error updating user role', 500));
    }
  }

  // Get users by role
  static async getUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return next(new AppError('Invalid role value', 400));
      }

      // Validate pagination
      const validatedPagination = validatePagination(page as string, limit as string);
      const skip = (validatedPagination.page - 1) * validatedPagination.limit;

      const users = await User.find({ 
        role, 
        isDeleted: false 
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedPagination.limit);

      const total = await User.countDocuments({ role, isDeleted: false });

      logger.info(`Retrieved ${users.length} users with role: ${role}`);

      res.status(200).json({
        status: 'success',
        results: users.length,
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          pages: Math.ceil(total / validatedPagination.limit)
        },
        data: {
          users
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving users by role:', error);
      return next(new AppError('Error retrieving users by role', 500));
    }
  }

  // Update user password
  static async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid user ID format', 400));
      }

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return next(new AppError('Current password and new password are required', 400));
      }

      // Find user with password
      const user = await User.findOne({ _id: id, isDeleted: false }).select('+password');

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

      logger.info(`Password updated successfully for user: ${user._id}`);

      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error: any) {
      logger.error('Error updating password:', error);
      return next(new AppError('Error updating password', 500));
    }
  }

  // ===== EMPLOYEE MANAGEMENT METHODS =====
  
}