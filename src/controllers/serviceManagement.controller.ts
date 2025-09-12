import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { ServiceCategory, ServiceManagement } from '../models/ServiceManagement';
import { logger } from '../utils/logger';
import { validateObjectId, validatePagination } from '../utils/validation';

export class ServiceManagementController {
  // Initialize services for a facility
  static async initializeServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId, facilityName, facilityType, createdBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(createdBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      // Check if services already exist for this facility
      const existingServices = await ServiceManagement.findOne({ facilityId, isDeleted: false });
      if (existingServices) {
        throw new AppError('Services already initialized for this facility', 400);
      }

      // Initialize default services
      const serviceManagement = await (ServiceManagement as any).initializeDefaultServices(
        new mongoose.Types.ObjectId(facilityId),
        facilityName,
        facilityType,
        new mongoose.Types.ObjectId(createdBy)
      );

      res.status(201).json({
        status: 'success',
        message: 'Services initialized successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Initialize services error:', error);
      next(error);
    }
  }

  // Get services by facility ID
  static async getServicesByFacilityId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, includeInactive = 'false' } = req.query;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      let services = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      }).lean();

      // If services don't exist, try to auto-initialize them
      if (!services) {
        try {
          logger.info(`Services not found for facility ${facilityId}, attempting auto-initialization`);
          
          // Try to get facility details for initialization
          const { FacilityDetails } = await import('../models/FacilityDetails');
          const facility = await FacilityDetails.findById(facilityId).lean();
          
          if (!facility) {
            throw new AppError('Facility not found', 404);
          }

          // Auto-initialize services
          const initializedServices = await ServiceManagementController.autoInitializeServicesForFacility(
            facilityId,
            facility.siteName,
            facility.facilityType,
            facilityId // Use facility ID as createdBy since we don't have user context
          );

          // Fetch the newly created services
          services = await ServiceManagement.findOne({ 
            facilityId, 
            isDeleted: false 
          }).lean();

          if (!services) {
            throw new AppError('Failed to initialize services for this facility', 500);
          }

          logger.info(`Services auto-initialized successfully for facility ${facilityId}`);
        } catch (initError) {
          logger.error(`Failed to auto-initialize services for facility ${facilityId}:`, initError);
          throw new AppError('Services not found for this facility and could not be auto-initialized', 404);
        }
      }

      // Filter by category if specified
      let filteredServices = services;
      if (category && Object.values(ServiceCategory).includes(category as ServiceCategory)) {
        filteredServices = {
          ...services,
          serviceCategories: services.serviceCategories.filter(cat => cat.category === category)
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
          services: filteredServices
        }
      });
    } catch (error) {
      logger.error('Get services by facility ID error:', error);
      next(error);
    }
  }

  // Get all service management records with pagination
  static async getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        facilityType,
        category,
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
      if (category && Object.values(ServiceCategory).includes(category as ServiceCategory)) {
        filter['serviceCategories.category'] = category;
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;

      // Execute queries in parallel
      const [services, totalCount] = await Promise.all([
        ServiceManagement.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        ServiceManagement.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        status: 'success',
        data: {
          services,
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
      logger.error('Get all services error:', error);
      next(error);
    }
  }

  // Add a new service to a category
  static async addServiceToCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, name, description, isActive = false, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(ServiceCategory).includes(category)) {
        throw new AppError('Invalid service category', 400);
      }

      const serviceManagement = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!serviceManagement) {
        throw new AppError('Services not found for this facility', 404);
      }

      // Check if service already exists in the category
      const existingCategory = serviceManagement.serviceCategories.find(cat => cat.category === category);
      if (existingCategory) {
        const existingService = existingCategory.services.find(service => service.name === name);
        if (existingService) {
          throw new AppError(`Service '${name}' already exists in ${category}`, 400);
        }
      }

      // Add service to category
      await serviceManagement.addServiceToCategory(category, {
        name,
        description,
        isActive,
        isAvailable: true
      });

      // Update updatedBy field
      serviceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      await serviceManagement.save();

      res.status(201).json({
        status: 'success',
        message: 'Service added successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Add service to category error:', error);
      next(error);
    }
  }

  // Update service status (activate/deactivate)
  static async updateServiceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, serviceName, isActive, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(ServiceCategory).includes(category)) {
        throw new AppError('Invalid service category', 400);
      }

      const serviceManagement = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!serviceManagement) {
        throw new AppError('Services not found for this facility', 404);
      }

      // Update service status
      await serviceManagement.updateServiceStatus(category, serviceName, isActive);
      
      // Update updatedBy field
      serviceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      await serviceManagement.save();

      res.json({
        status: 'success',
        message: 'Service status updated successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Update service status error:', error);
      next(error);
    }
  }

  // Update service details (name, description)
  static async updateServiceDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, oldServiceName, newServiceName, description, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(ServiceCategory).includes(category)) {
        throw new AppError('Invalid service category', 400);
      }

      const serviceManagement = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!serviceManagement) {
        throw new AppError('Services not found for this facility', 404);
      }

      // Find the category and service
      const serviceCategory = serviceManagement.serviceCategories.find(cat => cat.category === category);
      if (!serviceCategory) {
        throw new AppError(`Category ${category} not found`, 404);
      }

      const service = serviceCategory.services.find(svc => svc.name === oldServiceName);
      if (!service) {
        throw new AppError(`Service ${oldServiceName} not found in category ${category}`, 404);
      }

      // Check if new service name already exists (if name is being changed)
      if (newServiceName && newServiceName !== oldServiceName) {
        const existingService = serviceCategory.services.find(svc => svc.name === newServiceName);
        if (existingService) {
          throw new AppError(`Service '${newServiceName}' already exists in ${category}`, 400);
        }
        service.name = newServiceName;
      }

      // Update description if provided
      if (description !== undefined) {
        service.description = description;
      }

      service.updatedAt = new Date();
      serviceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      
      await serviceManagement.save();

      res.json({
        status: 'success',
        message: 'Service details updated successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Update service details error:', error);
      next(error);
    }
  }

  // Remove service from category
  static async removeServiceFromCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { category, serviceName, updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!Object.values(ServiceCategory).includes(category)) {
        throw new AppError('Invalid service category', 400);
      }

      const serviceManagement = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!serviceManagement) {
        throw new AppError('Services not found for this facility', 404);
      }

      // Find the category and remove the service
      const serviceCategory = serviceManagement.serviceCategories.find(cat => cat.category === category);
      if (!serviceCategory) {
        throw new AppError(`Category ${category} not found`, 404);
      }

      const serviceIndex = serviceCategory.services.findIndex(svc => svc.name === serviceName);
      if (serviceIndex === -1) {
        throw new AppError(`Service ${serviceName} not found in category ${category}`, 404);
      }

      // Remove the service
      serviceCategory.services.splice(serviceIndex, 1);
      serviceCategory.updatedAt = new Date();
      serviceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      
      await serviceManagement.save();

      res.json({
        status: 'success',
        message: 'Service removed successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Remove service from category error:', error);
      next(error);
    }
  }

  // Bulk update services
  static async bulkUpdateServices(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        throw new AppError('Please provide an array of services to update', 400);
      }

      const serviceManagement = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      });

      if (!serviceManagement) {
        throw new AppError('Services not found for this facility', 404);
      }

      // Process each service update
      for (const serviceUpdate of services) {
        const { category, serviceName, isActive } = serviceUpdate;
        
        if (!Object.values(ServiceCategory).includes(category)) {
          throw new AppError(`Invalid service category: ${category}`, 400);
        }

        try {
          await serviceManagement.updateServiceStatus(category, serviceName, isActive);
        } catch (error) {
          logger.warn(`Failed to update service ${serviceName} in ${category}:`, error);
        }
      }

      serviceManagement.updatedBy = new mongoose.Types.ObjectId(updatedBy);
      await serviceManagement.save();

      res.json({
        status: 'success',
        message: 'Services updated successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Bulk update services error:', error);
      next(error);
    }
  }

  // Get service statistics
  static async getServiceStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      const services = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      }).lean();

      if (!services) {
        throw new AppError('Services not found for this facility', 404);
      }

      // Calculate statistics
      const statistics = {
        totalServices: services.totalServicesAvailable,
        activeServices: services.totalServicesActive,
        inactiveServices: services.totalServicesAvailable - services.totalServicesActive,
        categoryBreakdown: services.serviceCategories.map(category => ({
          category: category.category,
          totalServices: category.totalCount,
          activeServices: category.activeCount,
          inactiveServices: category.totalCount - category.activeCount,
          services: category.services.map(service => ({
            name: service.name,
            isActive: service.isActive,
            isAvailable: service.isAvailable
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
      logger.error('Get service statistics error:', error);
      next(error);
    }
  }

  // Delete service management (soft delete)
  static async deleteServiceManagement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { updatedBy } = req.body;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      if (!validateObjectId(updatedBy)) {
        throw new AppError('Invalid user ID', 400);
      }

      const serviceManagement = await ServiceManagement.findOneAndUpdate(
        { facilityId, isDeleted: false },
        { 
          isDeleted: true, 
          updatedBy: new mongoose.Types.ObjectId(updatedBy),
          lastUpdated: new Date()
        },
        { new: true }
      );

      if (!serviceManagement) {
        throw new AppError('Services not found for this facility', 404);
      }

      res.json({
        status: 'success',
        message: 'Service management deleted successfully',
        data: {
          serviceManagement
        }
      });
    } catch (error) {
      logger.error('Delete service management error:', error);
      next(error);
    }
  }

  // Get global service statistics (across all facilities)
  static async getGlobalServiceStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalFacilities,
        servicesByCategory,
        servicesByFacilityType,
        mostActiveServices
      ] = await Promise.all([
        ServiceManagement.countDocuments({ isDeleted: false }),
        ServiceManagement.aggregate([
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
        ServiceManagement.aggregate([
          { $match: { isDeleted: false } },
          {
            $group: {
              _id: '$facilityType',
              totalFacilities: { $sum: 1 },
              averageActiveServices: { $avg: '$totalServicesActive' }
            }
          },
          { $sort: { totalFacilities: -1 } }
        ]),
        ServiceManagement.aggregate([
          { $match: { isDeleted: false } },
          { $unwind: '$serviceCategories' },
          { $unwind: '$serviceCategories.services' },
          { $match: { 'serviceCategories.services.isActive': true } },
          {
            $group: {
              _id: '$serviceCategories.services.name',
              activeCount: { $sum: 1 },
              category: { $first: '$serviceCategories.category' }
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
          servicesByCategory,
          servicesByFacilityType,
          mostActiveServices
        }
      });
    } catch (error) {
      logger.error('Get global service statistics error:', error);
      next(error);
    }
  }

  // Debug endpoint to check facility and service status
  static async debugFacilityServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId } = req.params;

      if (!validateObjectId(facilityId)) {
        throw new AppError('Invalid facility ID', 400);
      }

      // Get facility details
      const { FacilityDetails } = await import('../models/FacilityDetails');
      const facility = await FacilityDetails.findById(facilityId).lean();

      // Get service management details
      const services = await ServiceManagement.findOne({ 
        facilityId, 
        isDeleted: false 
      }).lean();

      // Get all service management records for this facility (including deleted)
      const allServices = await ServiceManagement.find({ facilityId }).lean();

      res.json({
        status: 'success',
        data: {
          facilityExists: !!facility,
          facility: facility ? {
            _id: facility._id,
            siteName: facility.siteName,
            facilityType: facility.facilityType,
            createdAt: facility.createdAt
          } : null,
          servicesExists: !!services,
          services: services ? {
            _id: services._id,
            facilityId: services.facilityId,
            facilityType: services.facilityType,
            totalServicesAvailable: services.totalServicesAvailable,
            totalServicesActive: services.totalServicesActive,
            isDeleted: services.isDeleted,
            categoriesCount: services.serviceCategories.length,
            categories: services.serviceCategories.map(cat => ({
              category: cat.category,
              totalCount: cat.totalCount,
              activeCount: cat.activeCount,
              servicesCount: cat.services.length
            }))
          } : null,
          allServiceRecords: allServices.map(srv => ({
            _id: srv._id,
            isDeleted: srv.isDeleted,
            lastUpdated: srv.lastUpdated,
            facilityType: srv.facilityType
          })),
          debug: {
            facilityIdType: typeof facilityId,
            facilityIdLength: facilityId.length,
            searchQuery: { facilityId, isDeleted: false }
          }
        }
      });
    } catch (error) {
      logger.error('Debug facility services error:', error);
      next(error);
    }
  }

  // Helper function to auto-initialize services for a facility (used internally)
  static async autoInitializeServicesForFacility(
    facilityId: string | mongoose.Types.ObjectId,
    facilityName: string,
    facilityType: string,
    createdBy?: string | mongoose.Types.ObjectId
  ): Promise<any> {
    try {
      // Check if services already exist for this facility
      const existingServices = await ServiceManagement.findOne({ 
        facilityId: new mongoose.Types.ObjectId(facilityId.toString()), 
        isDeleted: false 
      });
      
      if (existingServices) {
        logger.info(`Services already exist for facility: ${facilityId}`);
        return existingServices;
      }

      // Use facility ID as createdBy if not provided
      const createdById = createdBy ? new mongoose.Types.ObjectId(createdBy.toString()) : new mongoose.Types.ObjectId(facilityId.toString());

      // Initialize default services
      const serviceManagement = await (ServiceManagement as any).initializeDefaultServices(
        new mongoose.Types.ObjectId(facilityId.toString()),
        facilityName,
        facilityType,
        createdById
      );

      logger.info(`Services auto-initialized for facility: ${facilityId}`);
      return serviceManagement;
    } catch (error) {
      logger.error(`Failed to auto-initialize services for facility ${facilityId}:`, error);
      throw error;
    }
  }
}
