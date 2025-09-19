import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { FacilityDetails } from '../models/FacilityDetails';
import { User, UserRole, UserStatus, VerificationStatus } from '../models/User';
import { logger } from '../utils/logger';
import { validateObjectId, validatePagination } from '../utils/validation';
import { IoTServiceManagementController } from './iotServiceManagement.controller';
import { ServiceManagementController } from './serviceManagement.controller';

export class FacilityDetailsController {
  // Create new facility
  static async createFacility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const session = await mongoose.startSession();
    let facility: any = null;
    let createdUser: any = null;
    
    try {
      await session.withTransaction(async () => {
        const facilityData = req.body;

        // Remove tenantId from request body as it will be auto-generated
        delete facilityData.tenantId;

        // Create new facility
        facility = new FacilityDetails(facilityData);
        await facility.save({ session });

        // Create user account for facility client
        if (facility.email) {
          try {
            // Check if user with this email already exists
            const existingUser = await User.findOne({ email: facility.email }).session(session);
            if (!existingUser) {
          
              // Generate default password (facility clients can change it later)
              const defaultPassword = `${facility.clientName.replace(/\s+/g, '').toLowerCase()}@${facility.tenantId.substring(0, 8)}`;
              
              // Create user account with facility information
              const userData = {
                firstName: facility.clientName.split(' ')[0] || facility.clientName,
                lastName: facility.clientName.split(' ').slice(1).join(' ') || '',
                email: facility.email,
                password: defaultPassword,
                role: UserRole.FACILITY_MANAGER,
                status: UserStatus.ACTIVE,
                verificationStatus: VerificationStatus.VERIFIED,
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
                    profileVisibility: 'private' as const,
                    showEmail: false,
                    showPhone: false
                  },
                  language: 'en',
                  timezone: 'UTC',
                  theme: 'light' as const
                }
              };

              createdUser = new User(userData);
              await createdUser.save({ session });

              logger.info(`New user account created for facility manager: ${createdUser.email} (${createdUser._id}) for facility: ${facility._id}`);
            }
          } catch (userError) {
            // If user creation fails, we'll throw an error to rollback the transaction
            logger.error(`Failed to create/assign user account for facility ${facility._id}:`, userError);
            throw new AppError('Failed to create facility manager account', 500);
          }
        }

        // Auto-initialize services for the facility
        try {
          // Use authenticated user ID for audit trails
          const createdBy = req.user?._id?.toString() || req.body.createdBy || facility._id.toString();
          
          // Initialize regular services
          await ServiceManagementController.autoInitializeServicesForFacility(
            facility._id.toString(),
            facility.siteName,
            facility.facilityType,
            createdBy
          );

          // Initialize IoT services
          await IoTServiceManagementController.autoInitializeIoTServicesForFacility(
            facility._id.toString(),
            facility.siteName,
            facility.facilityType,
            createdBy
          );

          logger.info(`Services and IoT services auto-initialized for facility: ${facility._id} by user: ${req.user?.email || 'Unknown'}`);
        } catch (serviceError) {
          // Log the error but don't fail the facility creation
          logger.warn(`Failed to auto-initialize services for facility ${facility._id}:`, serviceError);
        }
      });

      // Transaction completed successfully
      // Log successful facility creation
      logger.info(`Facility created: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);

      const responseData: any = {
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
    } catch (error) {
      logger.error(`Create facility error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    } finally {
      await session.endSession();
    }
  }

  // Get all facilities with pagination and filtering
  static async getAllFacilities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        city,
        facilityType,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const { page, limit } = validatePagination(req.query.page as string, req.query.limit as string);

      // Build filter object
      const filter: any = {};

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
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;

      // Execute queries in parallel
      const [facilities, totalCount] = await Promise.all([
        FacilityDetails.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        FacilityDetails.countDocuments(filter)
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
    } catch (error) {
      logger.error(`Get all facilities error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Get facility by ID
  static async getFacilityById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        throw new AppError('Invalid facility ID', 400);
      }

      const facility = await FacilityDetails.findById(id).lean();

      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      res.json({
        status: 'success',
        data: {
          facility
        }
      });
    } catch (error) {
      logger.error(`Get facility by ID error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Get facility by tenant ID
  static async getFacilityByTenantId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;

      const facility = await FacilityDetails.findOne({ tenantId }).lean();

      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      res.json({
        status: 'success',
        data: {
          facility
        }
      });
    } catch (error) {
      logger.error(`Get facility by tenant ID error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Update facility by ID
  static async updateFacility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!validateObjectId(id)) {
        throw new AppError('Invalid facility ID', 400);
      }

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.tenantId; // Prevent tenantId modification
      delete updateData.createdAt;

      const facility = await FacilityDetails.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Log the update action with user context
      logger.info(`Facility updated: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);

      res.json({
        status: 'success',
        message: 'Facility updated successfully',
        data: {
          facility
        }
      });
    } catch (error) {
      logger.error(`Update facility error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Update facility by tenant ID
  static async updateFacilityByTenantId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.tenantId; // Prevent tenantId modification
      delete updateData.createdAt;

      const facility = await FacilityDetails.findOneAndUpdate(
        { tenantId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Log the update action with user context
      logger.info(`Facility updated by tenant ID: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);

      res.json({
        status: 'success',
        message: 'Facility updated successfully',
        data: {
          facility
        }
      });
    } catch (error) {
      logger.error(`Update facility by tenant ID error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Delete facility by ID
  static async deleteFacility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        throw new AppError('Invalid facility ID', 400);
      }

      const facility = await FacilityDetails.findByIdAndDelete(id);

      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Log the deletion action with user context
      logger.info(`Facility deleted: ${facility._id} (${facility.siteName}) by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);

      res.json({
        status: 'success',
        message: 'Facility deleted successfully',
        data: {
          facility
        }
      });
    } catch (error) {
      logger.error(`Delete facility error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Delete facility by tenant ID
  static async deleteFacilityByTenantId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;

      const facility = await FacilityDetails.findOneAndDelete({ tenantId });

      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Log the deletion action with user context
      logger.info(`Facility deleted by tenant ID: ${tenantId} by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);

      res.json({
        status: 'success',
        message: 'Facility deleted successfully',
        data: {
          facility
        }
      });
    } catch (error) {
      logger.error(`Delete facility by tenant ID error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Get facilities statistics
  static async getFacilitiesStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalFacilities,
        facilitiesByType,
        facilitiesByCity,
        recentFacilities
      ] = await Promise.all([
        FacilityDetails.countDocuments(),
        FacilityDetails.aggregate([
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
        FacilityDetails.aggregate([
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
        FacilityDetails.find()
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
    } catch (error) {
      logger.error(`Get facilities stats error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }

  // Bulk create facilities
  static async bulkCreateFacilities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilities } = req.body;

      if (!Array.isArray(facilities) || facilities.length === 0) {
        throw new AppError('Please provide an array of facilities', 400);
      }

      // Remove tenantId from all facilities as they will be auto-generated
      const facilitiesData = facilities.map(facility => {
        delete facility.tenantId;
        return facility;
      });

      const createdFacilities = await FacilityDetails.insertMany(facilitiesData, {
        ordered: false // Continue on errors
      });

      // Log successful bulk creation
      logger.info(`Bulk facility creation: ${createdFacilities.length} facilities created by user: ${req.user?.email || 'Unknown'} (${req.user?._id || 'Unknown ID'})`);

      res.status(201).json({
        status: 'success',
        message: `${createdFacilities.length} facilities created successfully`,
        data: {
          facilities: createdFacilities
        }
      });
    } catch (error) {
      logger.error(`Bulk create facilities error by user ${req.user?.email || 'Unknown'}:`, error);
      next(error);
    }
  }
}
