"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProviderController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = require("../middleware/errorHandler");
const ServiceProvider_1 = require("../models/ServiceProvider");
const logger_1 = require("../utils/logger");
const validation_1 = require("../utils/validation");
class ServiceProviderController {
    // Create a new service provider
    static async createServiceProvider(req, res, next) {
        try {
            const { facilityId } = req.params; // Get facilityId from URL params
            const { providerName, category, contactPerson, phone, email, contractStatus, contractStartDate, contractEndDate, services, description, address, createdBy } = req.body;
            // Validate required fields
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            // Use authenticated user ID if createdBy is not provided
            const createdById = createdBy || req.user?._id;
            if (!(0, validation_1.validateObjectId)(createdById)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Object.values(ServiceProvider_1.ServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid service category', 400);
            }
            if (!Object.values(ServiceProvider_1.ContractStatus).includes(contractStatus)) {
                throw new errorHandler_1.AppError('Invalid contract status', 400);
            }
            // Check if provider already exists for this facility and category
            const existingProvider = await ServiceProvider_1.ServiceProvider.findOne({
                facilityId: new mongoose_1.default.Types.ObjectId(facilityId),
                providerName: { $regex: new RegExp(`^${providerName}$`, 'i') },
                category,
                isDeleted: false
            });
            if (existingProvider) {
                throw new errorHandler_1.AppError(`Service provider '${providerName}' already exists for category '${category}' in this facility`, 409);
            }
            // Validate contract dates
            if (contractStartDate && contractEndDate) {
                const startDate = new Date(contractStartDate);
                const endDate = new Date(contractEndDate);
                if (startDate >= endDate) {
                    throw new errorHandler_1.AppError('Contract end date must be after start date', 400);
                }
            }
            // Create new service provider
            const serviceProvider = new ServiceProvider_1.ServiceProvider({
                facilityId: new mongoose_1.default.Types.ObjectId(facilityId),
                providerName: providerName.trim(),
                category,
                contactPerson: contactPerson.trim(),
                phone: phone.trim(),
                email: email.toLowerCase().trim(),
                contractStatus,
                contractStartDate: contractStartDate ? new Date(contractStartDate) : undefined,
                contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined,
                services: services ? services.map((s) => s.trim()) : [],
                description: description?.trim(),
                address: address?.trim(),
                createdBy: new mongoose_1.default.Types.ObjectId(createdById)
            });
            await serviceProvider.save();
            // Populate related fields
            await serviceProvider.populate('createdBy', 'firstName lastName email');
            await serviceProvider.populate('facilityId', 'siteName city facilityType');
            res.status(201).json({
                status: 'success',
                message: 'Service provider created successfully',
                data: {
                    serviceProvider
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Create service provider error:', error);
            next(error);
        }
    }
    // Get all service providers for a facility
    static async getAllServiceProviders(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { page = 1, limit = 10, category, contractStatus, isActive, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            // Build filter
            const filter = {
                facilityId: new mongoose_1.default.Types.ObjectId(facilityId),
                isDeleted: false
            };
            if (category && Object.values(ServiceProvider_1.ServiceCategory).includes(category)) {
                filter.category = category;
            }
            if (contractStatus && Object.values(ServiceProvider_1.ContractStatus).includes(contractStatus)) {
                filter.contractStatus = contractStatus;
            }
            if (isActive !== undefined) {
                filter.isActive = isActive === 'true';
            }
            // Search functionality
            if (search) {
                filter.$or = [
                    { providerName: { $regex: search, $options: 'i' } },
                    { contactPerson: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { services: { $elemMatch: { $regex: search, $options: 'i' } } }
                ];
            }
            // Sort options
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            // Pagination
            const skip = (Number(page) - 1) * Number(limit);
            const [serviceProviders, totalCount] = await Promise.all([
                ServiceProvider_1.ServiceProvider.find(filter)
                    .populate('createdBy', 'firstName lastName email')
                    .populate('updatedBy', 'firstName lastName email')
                    .populate('facilityId', 'siteName city facilityType')
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                ServiceProvider_1.ServiceProvider.countDocuments(filter)
            ]);
            const totalPages = Math.ceil(totalCount / Number(limit));
            res.json({
                status: 'success',
                data: {
                    serviceProviders,
                    pagination: {
                        currentPage: Number(page),
                        totalPages,
                        totalCount,
                        hasNextPage: Number(page) < totalPages,
                        hasPrevPage: Number(page) > 1
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get all service providers error:', error);
            next(error);
        }
    }
    // Get service provider by ID
    static async getServiceProviderById(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, validation_1.validateObjectId)(id)) {
                throw new errorHandler_1.AppError('Invalid service provider ID', 400);
            }
            const serviceProvider = await ServiceProvider_1.ServiceProvider.findOne({
                _id: new mongoose_1.default.Types.ObjectId(id),
                isDeleted: false
            })
                .populate('createdBy', 'firstName lastName email')
                .populate('updatedBy', 'firstName lastName email')
                .populate('facilityId', 'siteName city facilityType');
            if (!serviceProvider) {
                throw new errorHandler_1.AppError('Service provider not found', 404);
            }
            res.json({
                status: 'success',
                data: {
                    serviceProvider
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get service provider by ID error:', error);
            next(error);
        }
    }
    // Update service provider
    static async updateServiceProvider(req, res, next) {
        try {
            const { id } = req.params;
            const { providerName, category, contactPerson, phone, email, contractStatus, contractStartDate, contractEndDate, services, description, address, rating, isActive, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(id)) {
                throw new errorHandler_1.AppError('Invalid service provider ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            const serviceProvider = await ServiceProvider_1.ServiceProvider.findOne({
                _id: new mongoose_1.default.Types.ObjectId(id),
                isDeleted: false
            });
            if (!serviceProvider) {
                throw new errorHandler_1.AppError('Service provider not found', 404);
            }
            // Validate category if provided
            if (category && !Object.values(ServiceProvider_1.ServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid service category', 400);
            }
            // Validate contract status if provided
            if (contractStatus && !Object.values(ServiceProvider_1.ContractStatus).includes(contractStatus)) {
                throw new errorHandler_1.AppError('Invalid contract status', 400);
            }
            // Check for duplicate provider name if name is being changed
            if (providerName && providerName !== serviceProvider.providerName) {
                const existingProvider = await ServiceProvider_1.ServiceProvider.findOne({
                    facilityId: serviceProvider.facilityId,
                    providerName: { $regex: new RegExp(`^${providerName}$`, 'i') },
                    category: category || serviceProvider.category,
                    isDeleted: false,
                    _id: { $ne: serviceProvider._id }
                });
                if (existingProvider) {
                    throw new errorHandler_1.AppError(`Service provider '${providerName}' already exists for this category in this facility`, 409);
                }
            }
            // Validate contract dates
            if (contractStartDate && contractEndDate) {
                const startDate = new Date(contractStartDate);
                const endDate = new Date(contractEndDate);
                if (startDate >= endDate) {
                    throw new errorHandler_1.AppError('Contract end date must be after start date', 400);
                }
            }
            // Update fields
            const updateData = {
                updatedBy: new mongoose_1.default.Types.ObjectId(updatedBy)
            };
            if (providerName !== undefined)
                updateData.providerName = providerName.trim();
            if (category !== undefined)
                updateData.category = category;
            if (contactPerson !== undefined)
                updateData.contactPerson = contactPerson.trim();
            if (phone !== undefined)
                updateData.phone = phone.trim();
            if (email !== undefined)
                updateData.email = email.toLowerCase().trim();
            if (contractStatus !== undefined)
                updateData.contractStatus = contractStatus;
            if (contractStartDate !== undefined)
                updateData.contractStartDate = contractStartDate ? new Date(contractStartDate) : null;
            if (contractEndDate !== undefined)
                updateData.contractEndDate = contractEndDate ? new Date(contractEndDate) : null;
            if (services !== undefined)
                updateData.services = services.map((s) => s.trim());
            if (description !== undefined)
                updateData.description = description?.trim();
            if (address !== undefined)
                updateData.address = address?.trim();
            if (rating !== undefined)
                updateData.rating = Number(rating);
            if (isActive !== undefined)
                updateData.isActive = isActive;
            const updatedServiceProvider = await ServiceProvider_1.ServiceProvider.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
                .populate('createdBy', 'firstName lastName email')
                .populate('updatedBy', 'firstName lastName email')
                .populate('facilityId', 'siteName city facilityType');
            res.json({
                status: 'success',
                message: 'Service provider updated successfully',
                data: {
                    serviceProvider: updatedServiceProvider
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Update service provider error:', error);
            next(error);
        }
    }
    // Delete service provider (soft delete)
    static async deleteServiceProvider(req, res, next) {
        try {
            const { id } = req.params;
            const { updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(id)) {
                throw new errorHandler_1.AppError('Invalid service provider ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            const serviceProvider = await ServiceProvider_1.ServiceProvider.findOneAndUpdate({
                _id: new mongoose_1.default.Types.ObjectId(id),
                isDeleted: false
            }, {
                isDeleted: true,
                updatedBy: new mongoose_1.default.Types.ObjectId(updatedBy)
            }, { new: true });
            if (!serviceProvider) {
                throw new errorHandler_1.AppError('Service provider not found', 404);
            }
            res.json({
                status: 'success',
                message: 'Service provider deleted successfully',
                data: {
                    serviceProvider
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Delete service provider error:', error);
            next(error);
        }
    }
    // Get service providers by category
    static async getServiceProvidersByCategory(req, res, next) {
        try {
            const { facilityId, category } = req.params;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!Object.values(ServiceProvider_1.ServiceCategory).includes(category)) {
                throw new errorHandler_1.AppError('Invalid service category', 400);
            }
            const serviceProviders = await ServiceProvider_1.ServiceProvider.getByCategory(new mongoose_1.default.Types.ObjectId(facilityId), category);
            res.json({
                status: 'success',
                data: {
                    serviceProviders
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get service providers by category error:', error);
            next(error);
        }
    }
    // Get active service providers
    static async getActiveServiceProviders(req, res, next) {
        try {
            const { facilityId } = req.params;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            const serviceProviders = await ServiceProvider_1.ServiceProvider.getActiveProviders(new mongoose_1.default.Types.ObjectId(facilityId));
            res.json({
                status: 'success',
                data: {
                    serviceProviders
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get active service providers error:', error);
            next(error);
        }
    }
    // Search service providers
    static async searchServiceProviders(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { q, category, contractStatus, limit = 10 } = req.query;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!q) {
                throw new errorHandler_1.AppError('Search query is required', 400);
            }
            const filter = {
                facilityId: new mongoose_1.default.Types.ObjectId(facilityId),
                isDeleted: false,
                $text: { $search: q }
            };
            if (category && Object.values(ServiceProvider_1.ServiceCategory).includes(category)) {
                filter.category = category;
            }
            if (contractStatus && Object.values(ServiceProvider_1.ContractStatus).includes(contractStatus)) {
                filter.contractStatus = contractStatus;
            }
            const serviceProviders = await ServiceProvider_1.ServiceProvider.find(filter)
                .populate('createdBy', 'firstName lastName email')
                .populate('facilityId', 'siteName city facilityType')
                .limit(Number(limit))
                .sort({ score: { $meta: 'textScore' } })
                .lean();
            res.json({
                status: 'success',
                data: {
                    serviceProviders,
                    searchQuery: q
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Search service providers error:', error);
            next(error);
        }
    }
    // Get service provider statistics
    static async getServiceProviderStatistics(req, res, next) {
        try {
            const { facilityId } = req.params;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            const [totalProviders, activeProviders, providersByCategory, providersByContractStatus, averageRating] = await Promise.all([
                ServiceProvider_1.ServiceProvider.countDocuments({ facilityId, isDeleted: false }),
                ServiceProvider_1.ServiceProvider.countDocuments({ facilityId, isDeleted: false, isActive: true }),
                ServiceProvider_1.ServiceProvider.aggregate([
                    { $match: { facilityId: new mongoose_1.default.Types.ObjectId(facilityId), isDeleted: false } },
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                ServiceProvider_1.ServiceProvider.aggregate([
                    { $match: { facilityId: new mongoose_1.default.Types.ObjectId(facilityId), isDeleted: false } },
                    { $group: { _id: '$contractStatus', count: { $sum: 1 } } }
                ]),
                ServiceProvider_1.ServiceProvider.aggregate([
                    { $match: { facilityId: new mongoose_1.default.Types.ObjectId(facilityId), isDeleted: false, rating: { $gt: 0 } } },
                    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
                ])
            ]);
            const statistics = {
                totalProviders,
                activeProviders,
                inactiveProviders: totalProviders - activeProviders,
                providersByCategory,
                providersByContractStatus,
                averageRating: averageRating.length > 0 ? Number(averageRating[0].avgRating.toFixed(2)) : 0
            };
            res.json({
                status: 'success',
                data: {
                    statistics
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get service provider statistics error:', error);
            next(error);
        }
    }
    // Bulk update service providers
    static async bulkUpdateServiceProviders(req, res, next) {
        try {
            const { facilityId } = req.params;
            const { providers, updatedBy } = req.body;
            if (!(0, validation_1.validateObjectId)(facilityId)) {
                throw new errorHandler_1.AppError('Invalid facility ID', 400);
            }
            if (!(0, validation_1.validateObjectId)(updatedBy)) {
                throw new errorHandler_1.AppError('Invalid user ID', 400);
            }
            if (!Array.isArray(providers) || providers.length === 0) {
                throw new errorHandler_1.AppError('Please provide an array of providers to update', 400);
            }
            const updateResults = [];
            for (const providerUpdate of providers) {
                const { providerId, ...updateData } = providerUpdate;
                if (!(0, validation_1.validateObjectId)(providerId)) {
                    updateResults.push({
                        providerId,
                        success: false,
                        error: 'Invalid provider ID'
                    });
                    continue;
                }
                try {
                    const updatedProvider = await ServiceProvider_1.ServiceProvider.findOneAndUpdate({
                        _id: new mongoose_1.default.Types.ObjectId(providerId),
                        facilityId: new mongoose_1.default.Types.ObjectId(facilityId),
                        isDeleted: false
                    }, {
                        ...updateData,
                        updatedBy: new mongoose_1.default.Types.ObjectId(updatedBy)
                    }, { new: true, runValidators: true });
                    updateResults.push({
                        providerId,
                        success: !!updatedProvider,
                        provider: updatedProvider
                    });
                }
                catch (error) {
                    updateResults.push({
                        providerId,
                        success: false,
                        error: error.message
                    });
                }
            }
            res.json({
                status: 'success',
                message: 'Bulk update completed',
                data: {
                    updateResults
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Bulk update service providers error:', error);
            next(error);
        }
    }
}
exports.ServiceProviderController = ServiceProviderController;
