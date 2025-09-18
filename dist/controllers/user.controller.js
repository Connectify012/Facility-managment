"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const validation_1 = require("../utils/validation");
class UserController {
    // Create new user
    static async createUser(req, res, next) {
        try {
            const userData = req.body;
            // Check if user with email already exists
            const existingUser = await User_1.User.findOne({
                email: userData.email.toLowerCase(),
                isDeleted: false
            });
            if (existingUser) {
                return next(new errorHandler_1.AppError('User with this email already exists', 400));
            }
            // Check if username is provided and exists
            if (userData.username) {
                const existingUsername = await User_1.User.findOne({
                    username: userData.username,
                    isDeleted: false
                });
                if (existingUsername) {
                    return next(new errorHandler_1.AppError('Username already taken', 400));
                }
            }
            // Create new user
            const user = new User_1.User(userData);
            await user.save();
            // Remove password from response
            const userResponse = user.toJSON();
            logger_1.logger.info(`User created successfully: ${user._id}`);
            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    user: userResponse
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating user:', error);
            return next(new errorHandler_1.AppError('Error creating user', 500));
        }
    }
    // Get all users with pagination and filtering
    static async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, role, status, search } = req.query;
            // Validate pagination
            const validatedPagination = (0, validation_1.validatePagination)(page, limit);
            const skip = (validatedPagination.page - 1) * validatedPagination.limit;
            // Build filter object
            const filter = { isDeleted: false };
            if (role && Object.values(User_1.UserRole).includes(role)) {
                filter.role = role;
            }
            if (status && Object.values(User_1.UserStatus).includes(status)) {
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
            const users = await User_1.User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(validatedPagination.limit)
                .populate('assignedFacilities', 'siteName city facilityType')
                .populate('managedFacilities', 'siteName city facilityType')
                .populate('managerId', 'firstName lastName email')
                .populate('subordinates', 'firstName lastName email role');
            // Get total count for pagination
            const total = await User_1.User.countDocuments(filter);
            logger_1.logger.info(`Retrieved ${users.length} users`);
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
        }
        catch (error) {
            logger_1.logger.error('Error retrieving users:', error);
            return next(new errorHandler_1.AppError('Error retrieving users', 500));
        }
    }
    // Get user by ID
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
            }
            const user = await User_1.User.findOne({ _id: id, isDeleted: false })
                .select('-password')
                .populate('assignedFacilities', 'siteName city facilityType')
                .populate('managedFacilities', 'siteName city facilityType')
                .populate('managerId', 'firstName lastName email role')
                .populate('subordinates', 'firstName lastName email role')
                .populate('createdBy', 'firstName lastName email')
                .populate('updatedBy', 'firstName lastName email');
            if (!user) {
                return next(new errorHandler_1.AppError('User not found', 404));
            }
            logger_1.logger.info(`Retrieved user: ${user._id}`);
            res.status(200).json({
                status: 'success',
                data: {
                    user
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error retrieving user:', error);
            return next(new errorHandler_1.AppError('Error retrieving user', 500));
        }
    }
    // Update user
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
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
                const existingUser = await User_1.User.findOne({
                    email: updateData.email.toLowerCase(),
                    _id: { $ne: id },
                    isDeleted: false
                });
                if (existingUser) {
                    return next(new errorHandler_1.AppError('User with this email already exists', 400));
                }
            }
            // Check if username is being updated and if it already exists
            if (updateData.username) {
                const existingUsername = await User_1.User.findOne({
                    username: updateData.username,
                    _id: { $ne: id },
                    isDeleted: false
                });
                if (existingUsername) {
                    return next(new errorHandler_1.AppError('Username already taken', 400));
                }
            }
            // Add updatedBy field if available from auth middleware
            if (req.body.updatedBy) {
                updateData.updatedBy = req.body.updatedBy;
            }
            const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, {
                new: true,
                runValidators: true
            }).select('-password');
            if (!user) {
                return next(new errorHandler_1.AppError('User not found', 404));
            }
            logger_1.logger.info(`User updated successfully: ${user._id}`);
            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data: {
                    user
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating user:', error);
            return next(new errorHandler_1.AppError('Error updating user', 500));
        }
    }
    // Delete user (soft delete)
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
            }
            // Check if user exists and is not already deleted
            const user = await User_1.User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return next(new errorHandler_1.AppError('User not found', 404));
            }
            // Prevent deletion of super admin
            if (user.role === User_1.UserRole.SUPER_ADMIN) {
                return next(new errorHandler_1.AppError('Cannot delete super admin user', 403));
            }
            // Soft delete
            const deleteData = {
                isDeleted: true,
                deletedAt: new Date(),
                status: User_1.UserStatus.INACTIVE
            };
            // Add deletedBy field if available from auth middleware
            if (req.body.deletedBy) {
                deleteData.deletedBy = req.body.deletedBy;
            }
            await User_1.User.findByIdAndUpdate(id, deleteData);
            logger_1.logger.info(`User deleted successfully: ${id}`);
            res.status(200).json({
                status: 'success',
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting user:', error);
            return next(new errorHandler_1.AppError('Error deleting user', 500));
        }
    }
    // Restore deleted user
    static async restoreUser(req, res, next) {
        try {
            const { id } = req.params;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
            }
            const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: true }, {
                isDeleted: false,
                deletedAt: undefined,
                deletedBy: undefined,
                status: User_1.UserStatus.ACTIVE
            }, { new: true }).select('-password');
            if (!user) {
                return next(new errorHandler_1.AppError('Deleted user not found', 404));
            }
            logger_1.logger.info(`User restored successfully: ${user._id}`);
            res.status(200).json({
                status: 'success',
                message: 'User restored successfully',
                data: {
                    user
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error restoring user:', error);
            return next(new errorHandler_1.AppError('Error restoring user', 500));
        }
    }
    // Update user status
    static async updateUserStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
            }
            // Validate status
            if (!Object.values(User_1.UserStatus).includes(status)) {
                return next(new errorHandler_1.AppError('Invalid status value', 400));
            }
            const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, { status }, { new: true }).select('-password');
            if (!user) {
                return next(new errorHandler_1.AppError('User not found', 404));
            }
            logger_1.logger.info(`User status updated successfully: ${user._id} to ${status}`);
            res.status(200).json({
                status: 'success',
                message: 'User status updated successfully',
                data: {
                    user
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating user status:', error);
            return next(new errorHandler_1.AppError('Error updating user status', 500));
        }
    }
    // Update user role
    static async updateUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
            }
            // Validate role
            if (!Object.values(User_1.UserRole).includes(role)) {
                return next(new errorHandler_1.AppError('Invalid role value', 400));
            }
            const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, { role }, { new: true }).select('-password');
            if (!user) {
                return next(new errorHandler_1.AppError('User not found', 404));
            }
            logger_1.logger.info(`User role updated successfully: ${user._id} to ${role}`);
            res.status(200).json({
                status: 'success',
                message: 'User role updated successfully',
                data: {
                    user
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating user role:', error);
            return next(new errorHandler_1.AppError('Error updating user role', 500));
        }
    }
    // Get users by role
    static async getUsersByRole(req, res, next) {
        try {
            const { role } = req.params;
            const { page = 1, limit = 10 } = req.query;
            // Validate role
            if (!Object.values(User_1.UserRole).includes(role)) {
                return next(new errorHandler_1.AppError('Invalid role value', 400));
            }
            // Validate pagination
            const validatedPagination = (0, validation_1.validatePagination)(page, limit);
            const skip = (validatedPagination.page - 1) * validatedPagination.limit;
            const users = await User_1.User.find({
                role,
                isDeleted: false
            })
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(validatedPagination.limit);
            const total = await User_1.User.countDocuments({ role, isDeleted: false });
            logger_1.logger.info(`Retrieved ${users.length} users with role: ${role}`);
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
        }
        catch (error) {
            logger_1.logger.error('Error retrieving users by role:', error);
            return next(new errorHandler_1.AppError('Error retrieving users by role', 500));
        }
    }
    // Update user password
    static async updatePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;
            // Validate ObjectId
            if (!(0, validation_1.validateObjectId)(id)) {
                return next(new errorHandler_1.AppError('Invalid user ID format', 400));
            }
            // Validate required fields
            if (!currentPassword || !newPassword) {
                return next(new errorHandler_1.AppError('Current password and new password are required', 400));
            }
            // Find user with password
            const user = await User_1.User.findOne({ _id: id, isDeleted: false }).select('+password');
            if (!user) {
                return next(new errorHandler_1.AppError('User not found', 404));
            }
            // Verify current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return next(new errorHandler_1.AppError('Current password is incorrect', 400));
            }
            // Update password
            user.password = newPassword;
            await user.save();
            logger_1.logger.info(`Password updated successfully for user: ${user._id}`);
            res.status(200).json({
                status: 'success',
                message: 'Password updated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating password:', error);
            return next(new errorHandler_1.AppError('Error updating password', 500));
        }
    }
}
exports.UserController = UserController;
