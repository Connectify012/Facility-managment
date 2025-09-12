"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoTServiceManagementController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("../middleware/errorHandler");
const IoTServiceManagement_1 = require("../models/IoTServiceManagement");
const logger_1 = require("../utils/logger");
const validation_1 = require("../utils/validation");
class IoTServiceManagementController {
    // Initialize IoT services for a facility
    static async initializeIoTServices(req, res, next) {
        try {
            const { facilityId, facilityName, facilityType, createdBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(createdBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            // Check if IoT services already exist for this facility
            const existingServices = await IoTServiceManagement_1.IoTServiceManagement.findOne({ facilityId, isDeleted: false });
            if (existingServices) {
                throw new errorHandler_1.AppError('IoT services already initialized for this facility', 400);
            }
            // Initialize default IoT services
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.initializeDefaultIoTServices(new mongoose_1.default.Types.ObjectId(facilityId), facilityName, facilityType, new mongoose_1.default.Types.ObjectId(createdBy));
            res.status(201).json({
                status: 'success',
                message: 'IoT services initialized successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Initialize IoT services error:', error);
            next(error);
        }
    }
    // Get IoT services by facility ID with auto-initialization
    static async getIoTServicesByFacilityId(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { category, includeInactive = 'false' } = req.query;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            let services = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            }).lean();
            // Auto-initialize IoT services if they don't exist
            if (!services) {
                try {
                    // Get facility details for initialization
                    const { FacilityDetails } = await Promise.resolve().then(() => __importStar(require('../models/FacilityDetails')));
                    const facility = await FacilityDetails.findById(facilityId);
                    if (!facility) {
                        throw new errorHandler_1.AppError('Facility not found', 404);
                    }
                    // Initialize IoT services automatically
                    const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.initializeDefaultIoTServices(new mongoose_1.default.Types.ObjectId(facilityId), facility.siteName, facility.facilityType, facility._id // Use facility ID as creator if no user specified
                    );
                    services = iotServiceManagement.toObject();
                    logger_1.logger.info(`IoT services auto-initialized for facility: ${facilityId}`);
                }
                catch (initError) {
                    logger_1.logger.error(`Failed to auto-initialize IoT services for facility ${facilityId}:`, initError);
                    throw new errorHandler_1.AppError('IoT services not found and failed to initialize', 500);
                }
            }
            // Filter by category if specified
            let filteredServices = services;
            if (category && Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
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
                    iotServices: filteredServices
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get IoT services by facility ID error:', error);
            next(error);
        }
    }
    // Get all IoT service management records with pagination
    static async getAllIoTServices(req, res, next) {
        try {
            const { search, facilityType, category, iotEnabled, sortBy = 'lastUpdated', sortOrder = 'desc' } = req.query;
            const { page, limit } = (0, validation_1.validatePagination)(req.query.page, req.query.limit);
            // Build filter object
            const filter = { isDeleted: false };
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
            if (category && Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
                filter['serviceCategories.category'] = category;
            }
            // IoT enabled filter
            if (iotEnabled !== undefined) {
                filter.iotEnabled = iotEnabled === 'true';
            }
            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const skip = (page - 1) * limit;
            // Execute queries in parallel
            const [services, totalCount] = await Promise.all([
                IoTServiceManagement_1.IoTServiceManagement.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                IoTServiceManagement_1.IoTServiceManagement.countDocuments(filter)
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
        }
        catch (error) {
            logger_1.logger.error('Get all IoT services error:', error);
            next(error);
        }
    }
    // Add a new IoT service to a category
    static async addIoTServiceToCategory(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { category, name, description, isActive = false, status, features, integrationEndpoint, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid IoT service category', 400);
            }
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            });
            if (!iotServiceManagement) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
            }
            // Check if service already exists in the category
            const existingCategory = iotServiceManagement.serviceCategories.find(cat => cat.category === category);
            if (existingCategory) {
                const existingService = existingCategory.services.find(service => service.name === name);
                if (existingService) {
                    throw new errorHandler_1.AppError(`IoT service '${name}' already exists in ${category}`, 400);
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
            iotServiceManagement.updatedBy = new mongoose_1.default.Types.ObjectId(updatedBy);
            await iotServiceManagement.save();
            res.status(201).json({
                status: 'success',
                message: 'IoT service added successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Add IoT service to category error:', error);
            next(error);
        }
    }
    // Update IoT service status (activate/deactivate)
    static async updateIoTServiceStatus(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { category, serviceName, isActive, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid IoT service category', 400);
            }
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            });
            if (!iotServiceManagement) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
            }
            // Update service status
            await iotServiceManagement.updateServiceStatus(category, serviceName, isActive);
            // Update updatedBy field
            iotServiceManagement.updatedBy = new mongoose_1.default.Types.ObjectId(updatedBy);
            await iotServiceManagement.save();
            res.json({
                status: 'success',
                message: 'IoT service status updated successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Update IoT service status error:', error);
            next(error);
        }
    }
    // Update IoT service details
    static async updateIoTServiceDetails(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { category, oldServiceName, newServiceName, description, status, features, integrationEndpoint, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid IoT service category', 400);
            }
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            });
            if (!iotServiceManagement) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
            }
            // Find the category and service
            const serviceCategory = iotServiceManagement.serviceCategories.find(cat => cat.category === category);
            if (!serviceCategory) {
                throw new errorHandler_1.AppError(`Category ${category} not found`, 404);
            }
            const service = serviceCategory.services.find(svc => svc.name === oldServiceName);
            if (!service) {
                throw new errorHandler_1.AppError(`IoT service ${oldServiceName} not found in category ${category}`, 404);
            }
            // Check if new service name already exists (if name is being changed)
            if (newServiceName && newServiceName !== oldServiceName) {
                const existingService = serviceCategory.services.find(svc => svc.name === newServiceName);
                if (existingService) {
                    throw new errorHandler_1.AppError(`IoT service '${newServiceName}' already exists in ${category}`, 400);
                }
                service.name = newServiceName;
            }
            // Update other fields if provided
            if (description !== undefined)
                service.description = description;
            if (status !== undefined)
                service.status = status;
            if (features !== undefined)
                service.features = features;
            if (integrationEndpoint !== undefined)
                service.integrationEndpoint = integrationEndpoint;
            service.updatedAt = new Date();
            iotServiceManagement.updatedBy = new mongoose_1.default.Types.ObjectId(updatedBy);
            await iotServiceManagement.save();
            res.json({
                status: 'success',
                message: 'IoT service details updated successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Update IoT service details error:', error);
            next(error);
        }
    }
    // Remove IoT service from category
    static async removeIoTServiceFromCategory(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { category, serviceName, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid IoT service category', 400);
            }
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            });
            if (!iotServiceManagement) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
            }
            // Find the category and remove the service
            const serviceCategory = iotServiceManagement.serviceCategories.find(cat => cat.category === category);
            if (!serviceCategory) {
                throw new errorHandler_1.AppError(`Category ${category} not found`, 404);
            }
            const serviceIndex = serviceCategory.services.findIndex(svc => svc.name === serviceName);
            if (serviceIndex === -1) {
                throw new errorHandler_1.AppError(`IoT service ${serviceName} not found in category ${category}`, 404);
            }
            // Remove the service
            serviceCategory.services.splice(serviceIndex, 1);
            serviceCategory.updatedAt = new Date();
            iotServiceManagement.updatedBy = new mongoose_1.default.Types.ObjectId(updatedBy);
            await iotServiceManagement.save();
            res.json({
                status: 'success',
                message: 'IoT service removed successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Remove IoT service from category error:', error);
            next(error);
        }
    }
    // Bulk update IoT services
    static async bulkUpdateIoTServices(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { services, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Array.isArray(services) || services.length === 0) {
                throw new errorHandler_1.AppError('Please provide an array of IoT services to update', 400);
            }
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            });
            if (!iotServiceManagement) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
            }
            // Process each service update
            for (const serviceUpdate of services) {
                const { category, serviceName, isActive } = serviceUpdate;
                if (!Object.values(IoTServiceManagement_1.IoTServiceCategory).includes(category)) {
                    throw new errorHandler_1.AppError(`Invalid IoT service category: ${category}`, 400);
                }
                try {
                    await iotServiceManagement.updateServiceStatus(category, serviceName, isActive);
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to update IoT service ${serviceName} in ${category}:`, error);
                }
            }
            iotServiceManagement.updatedBy = new mongoose_1.default.Types.ObjectId(updatedBy);
            await iotServiceManagement.save();
            res.json({
                status: 'success',
                message: 'IoT services updated successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Bulk update IoT services error:', error);
            next(error);
        }
    }
    // Get IoT service statistics
    static async getIoTServiceStatistics(req, res, next) {
        try {
            const { facilityId } = req.params;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            const services = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId,
                isDeleted: false
            }).lean();
            if (!services) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
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
        }
        catch (error) {
            logger_1.logger.error('Get IoT service statistics error:', error);
            next(error);
        }
    }
    // Delete IoT service management (soft delete)
    static async deleteIoTServiceManagement(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.findOneAndUpdate({ facilityId, isDeleted: false }, {
                isDeleted: true,
                updatedBy: new mongoose_1.default.Types.ObjectId(updatedBy),
                lastUpdated: new Date()
            }, { new: true });
            if (!iotServiceManagement) {
                throw new errorHandler_1.AppError('IoT services not found for this facility', 404);
            }
            res.json({
                status: 'success',
                message: 'IoT service management deleted successfully',
                data: {
                    iotServiceManagement
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Delete IoT service management error:', error);
            next(error);
        }
    }
    // Get global IoT service statistics (across all facilities)
    static async getGlobalIoTServiceStatistics(req, res, next) {
        try {
            const [totalFacilities, iotEnabledFacilities, servicesByCategory, servicesByFacilityType, mostActiveIoTServices] = await Promise.all([
                IoTServiceManagement_1.IoTServiceManagement.countDocuments({ isDeleted: false }),
                IoTServiceManagement_1.IoTServiceManagement.countDocuments({ isDeleted: false, iotEnabled: true }),
                IoTServiceManagement_1.IoTServiceManagement.aggregate([
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
                IoTServiceManagement_1.IoTServiceManagement.aggregate([
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
                IoTServiceManagement_1.IoTServiceManagement.aggregate([
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
        }
        catch (error) {
            logger_1.logger.error('Get global IoT service statistics error:', error);
            next(error);
        }
    }
    // Helper function to auto-initialize IoT services for a facility (used internally)
    static async autoInitializeIoTServicesForFacility(facilityId, facilityName, facilityType, createdBy) {
        try {
            // Check if IoT services already exist for this facility
            const existingServices = await IoTServiceManagement_1.IoTServiceManagement.findOne({
                facilityId: new mongoose_1.default.Types.ObjectId(facilityId.toString()),
                isDeleted: false
            });
            if (existingServices) {
                logger_1.logger.info(`IoT services already exist for facility: ${facilityId}`);
                return existingServices;
            }
            // Use facility ID as createdBy if not provided
            const createdById = createdBy ? new mongoose_1.default.Types.ObjectId(createdBy.toString()) : new mongoose_1.default.Types.ObjectId(facilityId.toString());
            // Initialize default IoT services
            const iotServiceManagement = await IoTServiceManagement_1.IoTServiceManagement.initializeDefaultIoTServices(new mongoose_1.default.Types.ObjectId(facilityId.toString()), facilityName, facilityType, createdById);
            logger_1.logger.info(`IoT services auto-initialized for facility: ${facilityId}`);
            return iotServiceManagement;
        }
        catch (error) {
            logger_1.logger.error(`Failed to auto-initialize IoT services for facility ${facilityId}:`, error);
            throw error;
        }
    }
}
exports.IoTServiceManagementController = IoTServiceManagementController;
