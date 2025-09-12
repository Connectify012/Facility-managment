import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { IoTServiceCategory, IoTServiceManagement } from '../models/IoTServiceManagement';
import { logger } from '../utils/logger';
import { validateObjectId, validatePagination } from '../utils/validation';

export class IoTServiceManagementController {
  // Initialize IoT services for a facility
  static async initializeIoTServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId, facilityName, facilityType, createdBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(createdBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      // Check if IoT services already exist for this facility
      const existingServices = await IoTServiceManagement.findOne({ facilityId, isDeleted: false });
      if (existingServices) {
        throw new AppError('IoT services already initialized for this facility', 400);
      }

      // Initialize default IoT services
      const iotServiceManagement = await (IoTServiceManagement as any).initializeDefaultIoTServices(
        new mongoose.Types.ObjectId(facilityId),
        facilityName,
        facilityType,
        new mongoose.Types.ObjectId(createdBy)
      );

      res.status(201).json({
        status: 'success',
        message: 'IoT services initialized successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Initialize IoT services error:', error);
      next(error);
    }
  }

  // Get IoT services by facility ID with auto-initialization
  static async getIoTServicesByFacilityId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, includeInactive = 'false' } = req.query;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      let services = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      }).lean();

      // Auto-initialize IoT services if they don't exist
      if (!services) {
        try {
          // Get facility details for initialization
          const { FacilityDetails } = await import('../models/FacilityDetails');
          const facility = await FacilityDetails.findById(facilityId);
          
          if (!facility) {
            throw new AppError('Facility not found', 404);
          }

          // Initialize IoT services automatically
          const iotServiceManagement = await (IoTServiceManagement as any).initializeDefaultIoTServices(
            new mongoose.Types.ObjectId(facilityId),
            facility.siteName,
            facility.facilityType,
            facility._id // Use facility ID as creator if no user specified
          );

          services = iotServiceManagement.toObject();
          logger.info(`IoT services auto-initialized for facility: ${facilityId}`);
        } catch (initError) {
          logger.error(`Failed to auto-initialize IoT services for facility ${facilityId}:`, initError);
          throw new AppError('IoT services not found and failed to initialize', 500);
        }
      }

      // Filter by category if specified
      let filteredServices = services!;
      if (category && Object.values(IoTServiceCategory).includes(category as IoTServiceCategory)) {
        filteredServices = {
          ...services!,
          serviceCategories: services!.serviceCategories.filter(cat => cat.category === category)
        };
      }

      // Filter inactive services if not requested
      if (includeInactive === 'false') {
        filteredServices = {
          ...filteredServices,
          serviceCategories: filteredServices.serviceCategories.map(cat => ({
            ...cat,
            services: cat.services.filter(service => service.isAvailable)
          }))
        };
      }

      res.json({
        status: 'success',
        data: {
          iotServices: filteredServices
        }
      });
    } catch (error) {
      logger.error('Get IoT services by facility ID error:', error);
      next(error);
    }
  }

  // Get all IoT service management records with pagination
  static async getAllIoTServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        facilityType,
        category,
        iotEnabled,
        sortBy = 'lastUpdated',
        sortOrder = 'desc'
      } = req.query;

      const { page, limit } = validatePagination(req.query.page as string, req.query.limit as string);

      // Build filter object
      const filter: any = { isDeleted: false };

      // Text search
      if (search) {
        filter.$or = [
          { facilityName: { $regex: search, $options: 'i' } },
          { facilityType: { $regex: search, $options: 'i' } }
        ];
      }

      // Facility type filter
      if (facilityType) {
        filter.facilityType = facilityType;
      }

      // Category filter
      if (category && Object.values(IoTServiceCategory).includes(category as IoTServiceCategory)) {
        filter['serviceCategories.category'] = category;
      }

      // IoT enabled filter
      if (iotEnabled !== undefined) {
        filter.iotEnabled = iotEnabled === 'true';
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;

      // Execute queries in parallel
      const [services, totalCount] = await Promise.all([
        IoTServiceManagement.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        IoTServiceManagement.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        status: 'success',
        data: {
          iotServices: services,
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
      logger.error('Get all IoT services error:', error);
      next(error);
    }
  }

  // Add a new IoT service to a category
  static async addIoTServiceToCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, name, description, isActive = false, status, features, integrationEndpoint, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(IoTServiceCategory).includes(category)) {
        throw new AppError('Invalid IoT service category', 400);
      }

      const iotServiceManagement = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!iotServiceManagement) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      // Check if service already exists in the category
      const existingCategory = iotServiceManagement.serviceCategories.find(cat => cat.category === category);
      if (existingCategory) {
        const existingService = existingCategory.services.find(service => service.name === name);
        if (existingService) {
          throw new AppError(`IoT service '${name}' already exists in ${category}`, 400);
        }
      }

      // Add service to category
      await iotServiceManagement.addServiceToCategory(category, {
        name,
        description,
        isActive,
        isAvailable: true,
        status,
        features: features || [],
        integrationEndpoint
      });

      // Update updatedBy field
      iotServiceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      await iotServiceManagement.save();

      res.status(201).json({
        status: 'success',
        message: 'IoT service added successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Add IoT service to category error:', error);
      next(error);
    }
  }

  // Update IoT service status (activate/deactivate)
  static async updateIoTServiceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, serviceName, isActive, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(IoTServiceCategory).includes(category)) {
        throw new AppError('Invalid IoT service category', 400);
      }

      const iotServiceManagement = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!iotServiceManagement) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      // Update service status
      await iotServiceManagement.updateServiceStatus(category, serviceName, isActive);
      
      // Update updatedBy field
      iotServiceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      await iotServiceManagement.save();

      res.json({
        status: 'success',
        message: 'IoT service status updated successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Update IoT service status error:', error);
      next(error);
    }
  }

  // Update IoT service details
  static async updateIoTServiceDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, oldServiceName, newServiceName, description, status, features, integrationEndpoint, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(IoTServiceCategory).includes(category)) {
        throw new AppError('Invalid IoT service category', 400);
      }

      const iotServiceManagement = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!iotServiceManagement) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      // Find the category and service
      const serviceCategory = iotServiceManagement.serviceCategories.find(cat => cat.category === category);
      if (!serviceCategory) {
        throw new AppError(`Category ${category} not found`, 404);
      }

      const service = serviceCategory.services.find(svc => svc.name === oldServiceName);
      if (!service) {
        throw new AppError(`IoT service ${oldServiceName} not found in category ${category}`, 404);
      }

      // Check if new service name already exists (if name is being changed)
      if (newServiceName && newServiceName !== oldServiceName) {
        const existingService = serviceCategory.services.find(svc => svc.name === newServiceName);
        if (existingService) {
          throw new AppError(`IoT service '${newServiceName}' already exists in ${category}`, 400);
        }
        service.name = newServiceName;
      }

      // Update other fields if provided
      if (description !== undefined) service.description = description;
      if (status !== undefined) service.status = status;
      if (features !== undefined) service.features = features;
      if (integrationEndpoint !== undefined) service.integrationEndpoint = integrationEndpoint;

      service.updatedAt = new Date();
      iotServiceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      
      await iotServiceManagement.save();

      res.json({
        status: 'success',
        message: 'IoT service details updated successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Update IoT service details error:', error);
      next(error);
    }
  }

  // Remove IoT service from category
  static async removeIoTServiceFromCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, serviceName, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(IoTServiceCategory).includes(category)) {
        throw new AppError('Invalid IoT service category', 400);
      }

      const iotServiceManagement = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!iotServiceManagement) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      // Find the category and remove the service
      const serviceCategory = iotServiceManagement.serviceCategories.find(cat => cat.category === category);
      if (!serviceCategory) {
        throw new AppError(`Category ${category} not found`, 404);
      }

      const serviceIndex = serviceCategory.services.findIndex(svc => svc.name === serviceName);
      if (serviceIndex === -1) {
        throw new AppError(`IoT service ${serviceName} not found in category ${category}`, 404);
      }

      // Remove the service
      serviceCategory.services.splice(serviceIndex, 1);
      serviceCategory.updatedAt = new Date();
      iotServiceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      
      await iotServiceManagement.save();

      res.json({
        status: 'success',
        message: 'IoT service removed successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Remove IoT service from category error:', error);
      next(error);
    }
  }

  // Bulk update IoT services
  static async bulkUpdateIoTServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { services, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Array.isArray(services) || services.length === 0) {
        throw new AppError('Please provide an array of IoT services to update', 400);
      }

      const iotServiceManagement = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!iotServiceManagement) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      // Process each service update
      for (const serviceUpdate of services) {
        const { category, serviceName, isActive } = serviceUpdate;
        
        if (!Object.values(IoTServiceCategory).includes(category)) {
          throw new AppError(`Invalid IoT service category: ${category}`, 400);
        }

        try {
          await iotServiceManagement.updateServiceStatus(category, serviceName, isActive);
        } catch (error) {
          logger.warn(`Failed to update IoT service ${serviceName} in ${category}:`, error);
        }
      }

      iotServiceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      await iotServiceManagement.save();

      res.json({
        status: 'success',
        message: 'IoT services updated successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Bulk update IoT services error:', error);
      next(error);
    }
  }

  // Get IoT service statistics
  static async getIoTServiceStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      const services = await IoTServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      }).lean();

      if (!services) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      // Calculate statistics
      const statistics = {
        totalServices: services.totalServicesAvailable,
        activeServices: services.totalServicesActive,
        inactiveServices: services.totalServicesAvailable - services.totalServicesActive,
        iotEnabled: services.iotEnabled,
        categoryBreakdown: services.serviceCategories.map(category => ({
          category: category.category,
          totalServices: category.totalCount,
          activeServices: category.activeCount,
          inactiveServices: category.totalCount - category.activeCount,
          services: category.services.map(service => ({
            name: service.name,
            isActive: service.isActive,
            isAvailable: service.isAvailable,
            status: service.status,
            features: service.features
          }))
        })),
        lastUpdated: services.lastUpdated
      };

      res.json({
        status: 'success',
        data: {
          statistics
        }
      });
    } catch (error) {
      logger.error('Get IoT service statistics error:', error);
      next(error);
    }
  }

  // Delete IoT service management (soft delete)
  static async deleteIoTServiceManagement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      const iotServiceManagement = await IoTServiceManagement.findOneAndUpdate(
        { facilityId, isDeleted: false },
        { 
          isDeleted: true, 
          updatedBy: new mongoose.Types.ObjectId(updatedBy),
          lastUpdated: new Date()
        },
        { new: true }
      );

      if (!iotServiceManagement) {
        throw new AppError('IoT services not found for this facility', 404);
      }

      res.json({
        status: 'success',
        message: 'IoT service management deleted successfully',
        data: {
          iotServiceManagement
        }
      });
    } catch (error) {
      logger.error('Delete IoT service management error:', error);
      next(error);
    }
  }

  // Get global IoT service statistics (across all facilities)
  static async getGlobalIoTServiceStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalFacilities,
        iotEnabledFacilities,
        servicesByCategory,
        servicesByFacilityType,
        mostActiveIoTServices
      ] = await Promise.all([
        IoTServiceManagement.countDocuments({ isDeleted: false }),
        IoTServiceManagement.countDocuments({ isDeleted: false, iotEnabled: true }),
        IoTServiceManagement.aggregate([
          { $match: { isDeleted: false } },
          { $unwind: '$serviceCategories' },
          {
            $group: {
              _id: '$serviceCategories.category',
              totalServices: { $sum: '$serviceCategories.totalCount' },
              activeServices: { $sum: '$serviceCategories.activeCount' }
            }
          },
          { $sort: { totalServices: -1 } }
        ]),
        IoTServiceManagement.aggregate([
          { $match: { isDeleted: false } },
          {
            $group: {
              _id: '$facilityType',
              totalFacilities: { $sum: 1 },
              averageActiveServices: { $avg: '$totalServicesActive' },
              iotEnabledCount: { 
                $sum: { $cond: [{ $eq: ['$iotEnabled', true] }, 1, 0] }
              }
            }
          },
          { $sort: { totalFacilities: -1 } }
        ]),
        IoTServiceManagement.aggregate([
          { $match: { isDeleted: false } },
          { $unwind: '$serviceCategories' },
          { $unwind: '$serviceCategories.services' },
          { $match: { 'serviceCategories.services.isActive': true } },
          {
            $group: {
              _id: '$serviceCategories.services.name',
              activeCount: { $sum: 1 },
              category: { $first: '$serviceCategories.category' },
              status: { $first: '$serviceCategories.services.status' }
            }
          },
          { $sort: { activeCount: -1 } },
          { $limit: 10 }
        ])
      ]);

      res.json({
        status: 'success',
        data: {
          totalFacilities,
          iotEnabledFacilities,
          iotAdoptionRate: totalFacilities > 0 ? (iotEnabledFacilities / totalFacilities * 100).toFixed(2) + '%' : '0%',
          servicesByCategory,
          servicesByFacilityType,
          mostActiveIoTServices
        }
      });
    } catch (error) {
      logger.error('Get global IoT service statistics error:', error);
      next(error);
    }
  }

  // Helper function to auto-initialize IoT services for a facility (used internally)
  static async autoInitializeIoTServicesForFacility(
    facilityId: string | mongoose.Types.ObjectId,
    facilityName: string,
    facilityType: string,
    createdBy?: string | mongoose.Types.ObjectId
  ): Promise<any> {
    try {
      // Check if IoT services already exist for this facility
      const existingServices = await IoTServiceManagement.findOne({ 
        facilityId: new mongoose.Types.ObjectId(facilityId.toString()), 
        isDeleted: false 
      });
      
      if (existingServices) {
        logger.info(`IoT services already exist for facility: ${facilityId}`);
        return existingServices;
      }

      // Use facility ID as createdBy if not provided
      const createdById = createdBy ? new mongoose.Types.ObjectId(createdBy.toString()) : new mongoose.Types.ObjectId(facilityId.toString());

      // Initialize default IoT services
      const iotServiceManagement = await (IoTServiceManagement as any).initializeDefaultIoTServices(
        new mongoose.Types.ObjectId(facilityId.toString()),
        facilityName,
        facilityType,
        createdById
      );

      logger.info(`IoT services auto-initialized for facility: ${facilityId}`);
      return iotServiceManagement;
    } catch (error) {
      logger.error(`Failed to auto-initialize IoT services for facility ${facilityId}:`, error);
      throw error;
    }
  }
}
