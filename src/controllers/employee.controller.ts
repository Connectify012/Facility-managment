import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { User, UserRole, UserStatus } from '../models/User';
import { logger } from '../utils/logger';
import { validateObjectId, validatePagination } from '../utils/validation';

export class EmployeeController {
  // Create new employee
  // Note: SUPER_ADMIN and ADMIN roles cannot be created through this endpoint for security reasons
  // Use User.createSuperAdmin() static method or dedicated admin creation process instead
  static async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        return next(new AppError('Employee with this email already exists', 400));
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

      // Create new employee
      const employee = new User(userData);
      await employee.save();

      // Remove password from response
      const employeeResponse = employee.toJSON();
      
      logger.info(`Employee created successfully: ${employee._id} by ${currentUser?._id || 'system'}`);

      res.status(201).json({
        status: 'success',
        message: 'Employee created successfully',
        data: {
          employee: employeeResponse
        }
      });
    } catch (error: any) {
      logger.error('Error creating employee:', error);
      return next(new AppError('Error creating employee', 500));
    }
  }

  // Get all employees with pagination and filtering
  static async getAllEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role, status, search } = req.query;
      
      // Validate pagination
      const validatedPagination = validatePagination(page as string, limit as string);
      const skip = (validatedPagination.page - 1) * validatedPagination.limit;

      // Build filter object - exclude super_admin and admin from employee list
      // Also exclude the current logged-in user from the list
      const filter: any = { 
        isDeleted: false,
        role: { 
          $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] 
        },
        _id: { $ne: req.user?._id } // Exclude current user
      };

      // Filter by specific employee roles
      if (role && Object.values(UserRole).includes(role as UserRole) && 
          role !== UserRole.SUPER_ADMIN && role !== UserRole.ADMIN) {
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

      // Get employees with pagination - select only professional fields
      const employees = await User.find(filter)
        .select('-password -permissions -settings.notifications -settings.privacy -security.failedLoginAttempts -security.twoFactorEnabled -security.twoFactorSecret -security.lastPasswordChange -security.lastLoginAt -security.lastLoginIP -isDeleted -deletedAt -deletedBy -assignedFacilities -subordinates -profile.address -profile.emergencyContact -profile.salary -profile.workSchedule -emailVerificationToken -passwordResetToken -verifiedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedPagination.limit)
        .populate('managedFacilities', 'siteName city facilityType')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      // Get total count for pagination
      const total = await User.countDocuments(filter);

      // Transform employee data to flatten profile and clean up response
      const transformedEmployees = employees.map(employee => ({
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        verificationStatus: employee.verificationStatus,
        // Flatten profile data
        employeeId: employee.profile?.employeeId || null,
        department: employee.profile?.department || null,
        jobTitle: employee.profile?.jobTitle || null,
        employmentStatus: employee.profile?.employmentStatus || null,
        workLocation: employee.profile?.workLocation || null,
        hireDate: employee.profile?.hireDate || null,
        // Keep managed facilities and creator info
        managedFacilities: employee.managedFacilities,
        createdBy: employee.createdBy,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      }));

      logger.info(`Retrieved ${transformedEmployees.length} employees`);

      res.status(200).json({
        status: 'success',
        results: transformedEmployees.length,
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          pages: Math.ceil(total / validatedPagination.limit)
        },
        data: {
          employees: transformedEmployees
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving employees:', error);
      return next(new AppError('Error retrieving employees', 500));
    }
  }

  // Get employee by ID
  static async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      const employee = await User.findOne({ 
        _id: id, 
        isDeleted: false,
        role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
      })
        .select('-password -permissions -settings.notifications -settings.privacy -security.failedLoginAttempts -security.twoFactorEnabled -security.twoFactorSecret -security.lastPasswordChange -security.lastLoginAt -security.lastLoginIP -isDeleted -deletedAt -deletedBy -assignedFacilities -subordinates -profile.address -profile.emergencyContact -profile.salary -profile.workSchedule -emailVerificationToken -passwordResetToken -verifiedAt')
        .populate('managedFacilities', 'siteName city facilityType')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .lean();

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      // Transform single employee data
      const transformedEmployee = {
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        verificationStatus: employee.verificationStatus,
        // Flatten profile data
        employeeId: employee.profile?.employeeId || null,
        department: employee.profile?.department || null,
        jobTitle: employee.profile?.jobTitle || null,
        employmentStatus: employee.profile?.employmentStatus || null,
        workLocation: employee.profile?.workLocation || null,
        hireDate: employee.profile?.hireDate || null,
        employeeType: employee.profile?.employeeType || null,
        probationEndDate: employee.profile?.probationEndDate || null,
        noticePeriod: employee.profile?.noticePeriod || null,
        // Keep managed facilities and creator info
        managedFacilities: employee.managedFacilities,
        createdBy: employee.createdBy,
        updatedBy: employee.updatedBy,
        // Keep minimal settings
        language: employee.settings?.language || 'en',
        timezone: employee.settings?.timezone || 'UTC',
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      };

      logger.info(`Retrieved employee: ${transformedEmployee.id}`);

      res.status(200).json({
        status: 'success',
        data: {
          employee: transformedEmployee
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving employee:', error);
      return next(new AppError('Error retrieving employee', 500));
    }
  }

  // Update employee
  static async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.emailVerificationToken;
      delete updateData.passwordResetToken;

      // Prevent role changes to SUPER_ADMIN or ADMIN
      if (updateData.role === UserRole.SUPER_ADMIN || updateData.role === UserRole.ADMIN) {
        return next(new AppError('Cannot update employee role to SUPER_ADMIN or ADMIN', 403));
      }

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingUser = await User.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: id },
          isDeleted: false 
        });

        if (existingUser) {
          return next(new AppError('Employee with this email already exists', 400));
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

      const employee = await User.findOneAndUpdate(
        { 
          _id: id, 
          isDeleted: false,
          role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
        },
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      ).select('_id email firstName lastName phone role status verificationStatus managedFacilities createdAt updatedAt profile.employeeId profile.department profile.jobTitle profile.employmentStatus profile.workLocation');

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      logger.info(`Employee updated successfully: ${employee._id} by ${currentUser?._id || 'system'}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee updated successfully',
        data: {
          employee
        }
      });
    } catch (error: any) {
      logger.error('Error updating employee:', error);
      return next(new AppError('Error updating employee', 500));
    }
  }

  // Delete employee (soft delete) with exit details
  static async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { exitDate, exitReason } = req.body;
      const currentUser = req.user;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      // Validate required exit fields
      if (!exitDate) {
        return next(new AppError('Exit date is required', 400));
      }

      if (!exitReason || exitReason.trim().length === 0) {
        return next(new AppError('Exit reason is required', 400));
      }

      // Check if employee exists and is not already deleted
      const employee = await User.findOne({ 
        _id: id, 
        isDeleted: false,
        role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
      });

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      const exitDateObj = new Date(exitDate);
      
      // Validate exit date is not in the future
      if (exitDateObj > new Date()) {
        return next(new AppError('Exit date cannot be in the future', 400));
      }

      // Use the terminateEmployee method to properly set termination details
      await employee.terminateEmployee(exitDateObj, exitDateObj, exitReason.trim());

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

      logger.info(`Employee deleted successfully: ${id} by ${currentUser?._id || 'system'}, Exit Date: ${exitDate}, Reason: ${exitReason}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting employee:', error);
      return next(new AppError('Error deleting employee', 500));
    }
  }

  // Restore deleted employee
  static async restoreEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      const employee = await User.findOneAndUpdate(
        { 
          _id: id, 
          isDeleted: true,
          role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
        },
        { 
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          status: UserStatus.ACTIVE
        },
        { new: true }
      ).select('_id email firstName lastName phone role status verificationStatus managedFacilities createdAt updatedAt profile.employeeId profile.department profile.jobTitle profile.employmentStatus profile.workLocation');

      if (!employee) {
        return next(new AppError('Deleted employee not found', 404));
      }

      logger.info(`Employee restored successfully: ${employee._id}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee restored successfully',
        data: {
          employee
        }
      });
    } catch (error: any) {
      logger.error('Error restoring employee:', error);
      return next(new AppError('Error restoring employee', 500));
    }
  }

  // Update employee status
  static async updateEmployeeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      // Validate status
      if (!Object.values(UserStatus).includes(status)) {
        return next(new AppError('Invalid status value', 400));
      }

      const employee = await User.findOneAndUpdate(
        { 
          _id: id, 
          isDeleted: false,
          role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
        },
        { status },
        { new: true }
      ).select('_id email firstName lastName phone role status verificationStatus managedFacilities createdAt updatedAt profile.employeeId profile.department profile.jobTitle profile.employmentStatus profile.workLocation');

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      logger.info(`Employee status updated successfully: ${employee._id} to ${status}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee status updated successfully',
        data: {
          employee
        }
      });
    } catch (error: any) {
      logger.error('Error updating employee status:', error);
      return next(new AppError('Error updating employee status', 500));
    }
  }

  // Update employee role
  static async updateEmployeeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      // Validate role and prevent assignment of SUPER_ADMIN or ADMIN
      if (!Object.values(UserRole).includes(role) || 
          role === UserRole.SUPER_ADMIN || 
          role === UserRole.ADMIN) {
        return next(new AppError('Invalid role value or restricted role assignment', 400));
      }

      const employee = await User.findOneAndUpdate(
        { 
          _id: id, 
          isDeleted: false,
          role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
        },
        { role },
        { new: true }
      ).select('_id email firstName lastName phone role status verificationStatus managedFacilities createdAt updatedAt profile.employeeId profile.department profile.jobTitle profile.employmentStatus profile.workLocation');

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      logger.info(`Employee role updated successfully: ${employee._id} to ${role}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee role updated successfully',
        data: {
          employee
        }
      });
    } catch (error: any) {
      logger.error('Error updating employee role:', error);
      return next(new AppError('Error updating employee role', 500));
    }
  }

  // Get employees by role
  static async getEmployeesByRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Validate role and exclude SUPER_ADMIN and ADMIN
      if (!Object.values(UserRole).includes(role as UserRole) ||
          role === UserRole.SUPER_ADMIN || 
          role === UserRole.ADMIN) {
        return next(new AppError('Invalid role value or restricted role', 400));
      }

      // Validate pagination
      const validatedPagination = validatePagination(page as string, limit as string);
      const skip = (validatedPagination.page - 1) * validatedPagination.limit;

      const employees = await User.find({ 
        role, 
        isDeleted: false,
        _id: { $ne: req.user?._id } // Exclude current user
      })
        .select('-password -permissions -settings.notifications -settings.privacy -security.failedLoginAttempts -security.twoFactorEnabled -security.twoFactorSecret -security.lastPasswordChange -security.lastLoginAt -security.lastLoginIP -isDeleted -deletedAt -deletedBy -assignedFacilities -subordinates -profile.address -profile.emergencyContact -profile.salary -profile.workSchedule -emailVerificationToken -passwordResetToken -verifiedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedPagination.limit)
        .populate('managedFacilities', 'siteName city facilityType')
        .lean();

      const total = await User.countDocuments({ 
        role, 
        isDeleted: false,
        _id: { $ne: req.user?._id } // Exclude current user
      });

      // Transform employee data to flatten profile and clean up response
      const transformedEmployees = employees.map(employee => ({
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        verificationStatus: employee.verificationStatus,
        // Flatten profile data
        employeeId: employee.profile?.employeeId || null,
        department: employee.profile?.department || null,
        jobTitle: employee.profile?.jobTitle || null,
        employmentStatus: employee.profile?.employmentStatus || null,
        workLocation: employee.profile?.workLocation || null,
        hireDate: employee.profile?.hireDate || null,
        // Keep managed facilities
        managedFacilities: employee.managedFacilities,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      }));

      logger.info(`Retrieved ${transformedEmployees.length} employees with role: ${role}`);

      res.status(200).json({
        status: 'success',
        results: transformedEmployees.length,
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          pages: Math.ceil(total / validatedPagination.limit)
        },
        data: {
          employees: transformedEmployees
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving employees by role:', error);
      return next(new AppError('Error retrieving employees by role', 500));
    }
  }

  // Update employee password
  static async updateEmployeePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return next(new AppError('Current password and new password are required', 400));
      }

      // Find employee with password
      const employee = await User.findOne({ 
        _id: id, 
        isDeleted: false,
        role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
      }).select('+password');

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      // Verify current password
      const isCurrentPasswordValid = await employee.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return next(new AppError('Current password is incorrect', 400));
      }

      // Update password
      employee.password = newPassword;
      await employee.save();

      logger.info(`Password updated successfully for employee: ${employee._id}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee password updated successfully'
      });
    } catch (error: any) {
      logger.error('Error updating employee password:', error);
      return next(new AppError('Error updating employee password', 500));
    }
  }

  // Get employees by facility
  static async getEmployeesByFacility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { page = 1, limit = 10, role, status } = req.query;

      // Validate ObjectId
      if (!validateObjectId(facilityId)) {
        return next(new AppError('Invalid facility ID format', 400));
      }

      // Validate pagination
      const validatedPagination = validatePagination(page as string, limit as string);
      const skip = (validatedPagination.page - 1) * validatedPagination.limit;

      // Build filter
      const filter: any = {
        isDeleted: false,
        managedFacilities: facilityId,
        role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
        _id: { $ne: req.user?._id } // Exclude current user
      };

      if (role && Object.values(UserRole).includes(role as UserRole) && 
          role !== UserRole.SUPER_ADMIN && role !== UserRole.ADMIN) {
        filter.role = role;
      }

      if (status && Object.values(UserStatus).includes(status as UserStatus)) {
        filter.status = status;
      }

      const employees = await User.find(filter)
        .select('-password -permissions -settings.notifications -settings.privacy -security.failedLoginAttempts -security.twoFactorEnabled -security.twoFactorSecret -security.lastPasswordChange -security.lastLoginAt -security.lastLoginIP -isDeleted -deletedAt -deletedBy -assignedFacilities -subordinates -profile.address -profile.emergencyContact -profile.salary -profile.workSchedule -emailVerificationToken -passwordResetToken -verifiedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedPagination.limit)
        .populate('managedFacilities', 'siteName city facilityType')
        .lean();

      const total = await User.countDocuments(filter);

      // Transform employee data to flatten profile and clean up response
      const transformedEmployees = employees.map(employee => ({
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        verificationStatus: employee.verificationStatus,
        // Flatten profile data
        employeeId: employee.profile?.employeeId || null,
        department: employee.profile?.department || null,
        jobTitle: employee.profile?.jobTitle || null,
        employmentStatus: employee.profile?.employmentStatus || null,
        workLocation: employee.profile?.workLocation || null,
        hireDate: employee.profile?.hireDate || null,
        // Keep managed facilities
        managedFacilities: employee.managedFacilities,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      }));

      logger.info(`Retrieved ${transformedEmployees.length} employees for facility: ${facilityId}`);

      res.status(200).json({
        status: 'success',
        results: transformedEmployees.length,
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          pages: Math.ceil(total / validatedPagination.limit)
        },
        data: {
          employees: transformedEmployees
        }
      });
    } catch (error: any) {
      logger.error('Error retrieving employees by facility:', error);
      return next(new AppError('Error retrieving employees by facility', 500));
    }
  }

  // Get employee exit details
  static async getEmployeeExitDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!validateObjectId(id)) {
        return next(new AppError('Invalid employee ID format', 400));
      }

      // Find employee including deleted ones to get exit details
      const employee = await User.findOne({ 
        _id: id, 
        role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
      }).select('firstName lastName email profile.terminationDate profile.lastWorkingDay profile.exitReason profile.employmentStatus isDeleted deletedAt deletedBy');

      if (!employee) {
        return next(new AppError('Employee not found', 404));
      }

      // Check if employee has exit details
      if (!employee.isDeleted && !employee.profile?.terminationDate) {
        return next(new AppError('Employee has not been terminated', 400));
      }

      const exitDetails = {
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        terminationDate: employee.profile?.terminationDate,
        lastWorkingDay: employee.profile?.lastWorkingDay,
        exitReason: employee.profile?.exitReason,
        employmentStatus: employee.profile?.employmentStatus,
        isDeleted: employee.isDeleted,
        deletedAt: employee.deletedAt,
        deletedBy: employee.deletedBy
      };

      logger.info(`Retrieved exit details for employee: ${id}`);

      res.status(200).json({
        status: 'success',
        message: 'Employee exit details retrieved successfully',
        data: exitDetails
      });
    } catch (error: any) {
      logger.error('Error retrieving employee exit details:', error);
      return next(new AppError('Error retrieving employee exit details', 500));
    }
  }
}