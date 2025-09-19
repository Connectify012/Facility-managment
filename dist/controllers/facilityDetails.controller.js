"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityDetailsController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("../middleware/errorHandler");
const FacilityDetails_1 = require("../models/FacilityDetails");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const validation_1 = require("../utils/validation");
const iotServiceManagement_controller_1 = require("./iotServiceManagement.controller");
const serviceManagement_controller_1 = require("./serviceManagement.controller");
class FacilityDetailsController {
    // Create new facility
    static async createFacility(req, res, next) {
        const session = await mongoose_1.default.startSession();
        let facility = null;
        let createdUser = null;
        try {
            await session.withTransaction(async () => {
                const facilityData = req.body;
                // Remove tenantId from request body as it will be auto-generated
                delete facilityData.tenantId;
                // Create new facility
                facility = new FacilityDetails_1.FacilityDetails(facilityData);
                await facility.save({ session });
                // Create user account for facility client
                if (facility.email) {
                    try {
                        // Check if user with this email already exists
                        const existingUser = await User_1.User.findOne({ email: facility.email }).session(session);
                        if (!existingUser) {
                            // Generate default password (facility clients can change it later)
                            const defaultPassword = `${facility.clientName.replace(/\s+/g, '').toLowerCase()}@${facility.tenantId.substring(0, 8)}`;
                            // Create user account with facility information
                            const userData = {
                                firstName: facility.clientName.split(' ')[0] || facility.clientName,
                                lastName: facility.clientName.split(' ').slice(1).join(' ') || '',
                                email: facility.email,
                                password: defaultPassword,
                                role: User_1.UserRole.FACILITY_MANAGER,
                                status: User_1.UserStatus.ACTIVE,
                                verificationStatus: User_1.VerificationStatus.VERIFIED,
                                profile: {
                                    jobTitle: facility.position,
                                    department: 'Facility Management',
                                    address: {
                                        street: facility.location,
                                        city: facility.city,
                                    },
                                    employeeId: `FM-${facility.tenantId.substring(0, 8)}`,
                                    hireDate: new Date()
                                },
                                managedFacilities: [facility._id],
                                permissions: {
                                    canManageFacilities: true,
                                    canManageServices: true,
                                    canManageIOT: true,
                                    canViewReports: true,
                                    canManageEmployees: false,
                                    canManageUsers: false,
                                    canManageSettings: false,
                                    canManageBilling: false,
                                    canAccessAuditLogs: false,
                                    canViewEmployeeReports: false,
                                    canApproveLeaves: false,
                                    canManageAttendance: false,
                                    canManageShifts: false,
                                    canManagePayroll: false,
                                    canViewSalaryInfo: false,
                                    canManageDocuments: false,
                                    customPermissions: ['facility_management']
                                },
                                settings: {
                                    notifications: {
                                        email: true,
                                        sms: false,
                                        push: true,
                                        inApp: true
                                    },
                                    privacy: {
                                        profileVisibility: 'private',
                                        showEmail: false,
                                        showPhone: false
                                    },
                                    language: 'en',
                                    timezone: 'UTC',
                                    theme: 'light'
                                }
                            };
                            createdUser = new User_1.User(userData);
                            await createdUser.save({ session });
                            logger_1.logger.info(`New user account created for facility manager: ${createdUser.email} (${createdUser._id}) for facility: ${facility._id}`);
                        }
                    }
                    catch (userError) {
                        // If user creation fails, we'll throw an error to rollback the transaction
                        logger_1.logger.error(`Failed to create/assign user account for facility ${facility._id}:`, userError);
                        throw new errorHandler_1.AppError('Failed to create facility manager account', 500);
                    }
                }
                // Auto-initialize services for the facility
                try {
                    // Use authenticated user ID for audit trails
                    const createdBy = req.user?._id?.toString() || req.body.createdBy || facility._id.toString();
                    // Initialize regular services
                    await serviceManagement_controller_1.ServiceManagementController.autoInitializeServicesForFacility(facility._id.toString(), facility.siteName, facility.facilityType, createdBy);
                    // Initialize IoT services
                    await iotServiceManagement_controller_1.IoTServiceManagementController.autoInitializeIoTServicesForFacility(facility._id.toString(), facility.siteName, facility.facilityType, createdBy);
                    logger_1.logger.info(`Services and IoT services auto-initialized for facility: ${facility._id} by user: ${req.user?.email || 'Unknown'}`);
                }
                catch (serviceError) {
                    // Log the error but don't fail the facility creation
                    logger_1.logger.warn(`Failed to auto-initialize services for facility ${facility._id}:`, serviceError);
                }
            });
            // Transaction completed successfully
            // Log successful facility creation
            logger_1.logger.info(`Facility created: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);
            const responseData = {
                facility
            };
            // Include user information in response if user was created/assigned
            if (createdUser) {
                const isNewUser = createdUser.createdAt && (Date.now() - createdUser.createdAt.getTime()) < 5000; // Created within last 5 seconds
                responseData.facilityManager = {
                    id: createdUser._id,
                    email: createdUser.email,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    isNewUser,
                    defaultPassword: isNewUser ? `${facility.clientName.replace(/\s+/g, '').toLowerCase()}@${facility.tenantId.substring(0, 8)}` : undefined,
                    message: isNewUser
                        ? 'New user account created successfully. Please share login credentials with facility manager.'
                        : 'Existing user assigned to manage this facility.'
                };
            }
            res.status(201).json({
                status: 'success',
                message: createdUser
                    ? 'Facility created successfully with services initialized and facility manager account set up'
                    : 'Facility created successfully with services initialized',
                data: responseData
            });
        }
        catch (error) {
            logger_1.logger.error(`Create facility error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
        finally {
            await session.endSession();
        }
    }
    // Get all facilities with pagination and filtering
    static async getAllFacilities(req, res, next) {
        try {
            const { search, city, facilityType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const { page, limit } = (0, validation_1.validatePagination)(req.query.page, req.query.limit);
            // Build filter object
            const filter = {};
            // Text search across multiple fields
            if (search) {
                filter.$or = [
                    { siteName: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } },
                    { clientName: { $regex: search, $options: 'i' } }
                ];
            }
            // City filter
            if (city) {
                filter.city = { $regex: city, $options: 'i' };
            }
            // Facility type filter
            if (facilityType) {
                filter.facilityType = facilityType;
            }
            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const skip = (page - 1) * limit;
            // Execute queries in parallel
            const [facilities, totalCount] = await Promise.all([
                FacilityDetails_1.FacilityDetails.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                FacilityDetails_1.FacilityDetails.countDocuments(filter)
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            res.json({
                status: 'success',
                data: {
                    facilities,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalCount,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Get all facilities error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Get facility by ID
    static async getFacilityById(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, validation_1.validateObjectId)(id)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            const facility = await FacilityDetails_1.FacilityDetails.findById(id).lean();
            if (!facility) {
                throw new errorHandler_1.AppError('Facility not found', 404);
            }
            res.json({
                status: 'success',
                data: {
                    facility
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Get facility by ID error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Get facility by tenant ID
    static async getFacilityByTenantId(req, res, next) {
        try {
            const { tenantId } = req.params;
            const facility = await FacilityDetails_1.FacilityDetails.findOne({ tenantId }).lean();
            if (!facility) {
                throw new errorHandler_1.AppError('Facility not found', 404);
            }
            res.json({
                status: 'success',
                data: {
                    facility
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Get facility by tenant ID error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Update facility by ID
    static async updateFacility(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (!(0, validation_1.validateObjectId)(id)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            // Remove fields that shouldn't be updated directly
            delete updateData._id;
            delete updateData.tenantId; // Prevent tenantId modification
            delete updateData.createdAt;
            const facility = await FacilityDetails_1.FacilityDetails.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!facility) {
                throw new errorHandler_1.AppError('Facility not found', 404);
            }
            // Log the update action with user context
            logger_1.logger.info(`Facility updated: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);
            res.json({
                status: 'success',
                message: 'Facility updated successfully',
                data: {
                    facility
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Update facility error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Update facility by tenant ID
    static async updateFacilityByTenantId(req, res, next) {
        try {
            const { tenantId } = req.params;
            const updateData = req.body;
            // Remove fields that shouldn't be updated directly
            delete updateData._id;
            delete updateData.tenantId; // Prevent tenantId modification
            delete updateData.createdAt;
            const facility = await FacilityDetails_1.FacilityDetails.findOneAndUpdate({ tenantId }, updateData, { new: true, runValidators: true });
            if (!facility) {
                throw new errorHandler_1.AppError('Facility not found', 404);
            }
            // Log the update action with user context
            logger_1.logger.info(`Facility updated by tenant ID: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);
            res.json({
                status: 'success',
                message: 'Facility updated successfully',
                data: {
                    facility
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Update facility by tenant ID error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Delete facility by ID
    static async deleteFacility(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, validation_1.validateObjectId)(id)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            const facility = await FacilityDetails_1.FacilityDetails.findByIdAndDelete(id);
            if (!facility) {
                throw new errorHandler_1.AppError('Facility not found', 404);
            }
            // Log the deletion action with user context
            logger_1.logger.info(`Facility deleted: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);
            res.json({
                status: 'success',
                message: 'Facility deleted successfully',
                data: {
                    facility
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Delete facility error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Delete facility by tenant ID
    static async deleteFacilityByTenantId(req, res, next) {
        try {
            const { tenantId } = req.params;
            const facility = await FacilityDetails_1.FacilityDetails.findOneAndDelete({ tenantId });
            if (!facility) {
                throw new errorHandler_1.AppError('Facility not found', 404);
            }
            // Log the deletion action with user context
            logger_1.logger.info(`Facility deleted by tenant ID: ${tenantId} by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);
            res.json({
                status: 'success',
                message: 'Facility deleted successfully',
                data: {
                    facility
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Delete facility by tenant ID error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Get facilities statistics
    static async getFacilitiesStats(req, res, next) {
        try {
            const [totalFacilities, facilitiesByType, facilitiesByCity, recentFacilities] = await Promise.all([
                FacilityDetails_1.FacilityDetails.countDocuments(),
                FacilityDetails_1.FacilityDetails.aggregate([
                    {
                        $group: {
                            _id: '$facilityType',
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: -1 }
                    }
                ]),
                FacilityDetails_1.FacilityDetails.aggregate([
                    {
                        $group: {
                            _id: '$city',
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: -1 }
                    },
                    {
                        $limit: 10
                    }
                ]),
                FacilityDetails_1.FacilityDetails.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('siteName city facilityType createdAt')
                    .lean()
            ]);
            res.json({
                status: 'success',
                data: {
                    totalFacilities,
                    facilitiesByType,
                    facilitiesByCity,
                    recentFacilities
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Get facilities stats error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
    // Bulk create facilities
    static async bulkCreateFacilities(req, res, next) {
        try {
            const { facilities } = req.body;
            if (!Array.isArray(facilities) || facilities.length === 0) {
                throw new errorHandler_1.AppError('Please provide an array of facilities', 400);
            }
            // Remove tenantId from all facilities as they will be auto-generated
            const facilitiesData = facilities.map(facility => {
                delete facility.tenantId;
                return facility;
            });
            const createdFacilities = await FacilityDetails_1.FacilityDetails.insertMany(facilitiesData, {
                ordered: false // Continue on errors
            });
            // Log successful bulk creation
            logger_1.logger.info(`Bulk facility creation: ${createdFacilities.length} facilities created by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);
            res.status(201).json({
                status: 'success',
                message: `${createdFacilities.length} facilities created successfully`,
                data: {
                    facilities: createdFacilities
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Bulk create facilities error by user ${req.user?.email || 'Unknown'}:`, error);
            next(error);
        }
    }
}
exports.FacilityDetailsController = FacilityDetailsController;
