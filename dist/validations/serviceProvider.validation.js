"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerIdParamSchema = exports.facilityIdParamSchema = exports.queryParamsSchema = exports.validateProviderRating = exports.validateContractDates = exports.validateContractStatus = exports.validateServiceCategory = exports.serviceProviderValidationSchemas = exports.bulkUpdateServiceProvidersSchema = exports.getServiceProviderStatisticsSchema = exports.searchServiceProvidersSchema = exports.getActiveServiceProvidersSchema = exports.getServiceProvidersByCategorySchema = exports.getServiceProviderByIdSchema = exports.getAllServiceProvidersSchema = exports.deleteServiceProviderSchema = exports.updateServiceProviderSchema = exports.createServiceProviderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const ServiceProvider_1 = require("../models/ServiceProvider");
// Base validation schemas
const objectIdSchema = joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId format');
const phoneSchema = joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).message('Please provide a valid phone number');
const emailSchema = joi_1.default.string().email().lowercase().trim();
// Create service provider validation schema
exports.createServiceProviderSchema = joi_1.default.object({
    body: joi_1.default.object({
        facilityId: objectIdSchema.required(),
        providerName: joi_1.default.string().trim().min(2).max(100).required(),
        category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).required(),
        contactPerson: joi_1.default.string().trim().min(2).max(100).required(),
        phone: phoneSchema.required(),
        email: emailSchema.required(),
        contractStatus: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ContractStatus)).required(),
        contractStartDate: joi_1.default.date().iso().optional(),
        contractEndDate: joi_1.default.date().iso().min(joi_1.default.ref('contractStartDate')).optional(),
        services: joi_1.default.array().items(joi_1.default.string().trim().min(1).max(100)).optional(),
        description: joi_1.default.string().trim().max(500).optional().allow(''),
        address: joi_1.default.string().trim().max(200).optional().allow(''),
        rating: joi_1.default.number().min(0).max(5).optional(),
        createdBy: objectIdSchema.required()
    }).required(),
    params: joi_1.default.object({
        facilityId: objectIdSchema.required()
    }).required()
});
// Update service provider validation schema
exports.updateServiceProviderSchema = joi_1.default.object({
    body: joi_1.default.object({
        providerName: joi_1.default.string().trim().min(2).max(100).optional(),
        category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).optional(),
        contactPerson: joi_1.default.string().trim().min(2).max(100).optional(),
        phone: phoneSchema.optional(),
        email: emailSchema.optional(),
        contractStatus: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ContractStatus)).optional(),
        contractStartDate: joi_1.default.date().iso().optional().allow(null),
        contractEndDate: joi_1.default.date().iso().when('contractStartDate', {
            is: joi_1.default.exist(),
            then: joi_1.default.date().min(joi_1.default.ref('contractStartDate')),
            otherwise: joi_1.default.date()
        }).optional().allow(null),
        services: joi_1.default.array().items(joi_1.default.string().trim().min(1).max(100)).optional(),
        description: joi_1.default.string().trim().max(500).optional().allow(''),
        address: joi_1.default.string().trim().max(200).optional().allow(''),
        rating: joi_1.default.number().min(0).max(5).optional(),
        totalContracts: joi_1.default.number().min(0).optional(),
        isActive: joi_1.default.boolean().optional(),
        updatedBy: objectIdSchema.required()
    }).required(),
    params: joi_1.default.object({
        id: objectIdSchema.required()
    }).required()
});
// Delete service provider validation schema
exports.deleteServiceProviderSchema = joi_1.default.object({
    body: joi_1.default.object({
        updatedBy: objectIdSchema.required()
    }).required(),
    params: joi_1.default.object({
        id: objectIdSchema.required()
    }).required()
});
// Get all service providers validation schema
exports.getAllServiceProvidersSchema = joi_1.default.object({
    params: joi_1.default.object({
        facilityId: objectIdSchema.required()
    }).required(),
    query: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
        category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).optional(),
        contractStatus: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ContractStatus)).optional(),
        isActive: joi_1.default.string().valid('true', 'false').optional(),
        search: joi_1.default.string().trim().min(1).max(100).optional(),
        sortBy: joi_1.default.string().valid('providerName', 'category', 'contactPerson', 'contractStatus', 'rating', 'createdAt', 'updatedAt').default('createdAt'),
        sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
    }).optional()
});
// Get service provider by ID validation schema
exports.getServiceProviderByIdSchema = joi_1.default.object({
    params: joi_1.default.object({
        id: objectIdSchema.required()
    }).required()
});
// Get service providers by category validation schema
exports.getServiceProvidersByCategorySchema = joi_1.default.object({
    params: joi_1.default.object({
        facilityId: objectIdSchema.required(),
        category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).required()
    }).required()
});
// Get active service providers validation schema
exports.getActiveServiceProvidersSchema = joi_1.default.object({
    params: joi_1.default.object({
        facilityId: objectIdSchema.required()
    }).required()
});
// Search service providers validation schema
exports.searchServiceProvidersSchema = joi_1.default.object({
    params: joi_1.default.object({
        facilityId: objectIdSchema.required()
    }).required(),
    query: joi_1.default.object({
        q: joi_1.default.string().trim().min(1).max(100).required(),
        category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).optional(),
        contractStatus: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ContractStatus)).optional(),
        limit: joi_1.default.number().integer().min(1).max(50).default(10)
    }).required()
});
// Get service provider statistics validation schema
exports.getServiceProviderStatisticsSchema = joi_1.default.object({
    params: joi_1.default.object({
        facilityId: objectIdSchema.required()
    }).required()
});
// Bulk update service providers validation schema
exports.bulkUpdateServiceProvidersSchema = joi_1.default.object({
    body: joi_1.default.object({
        providers: joi_1.default.array().items(joi_1.default.object({
            providerId: objectIdSchema.required(),
            providerName: joi_1.default.string().trim().min(2).max(100).optional(),
            category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).optional(),
            contactPerson: joi_1.default.string().trim().min(2).max(100).optional(),
            phone: phoneSchema.optional(),
            email: emailSchema.optional(),
            contractStatus: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ContractStatus)).optional(),
            contractStartDate: joi_1.default.date().iso().optional().allow(null),
            contractEndDate: joi_1.default.date().iso().optional().allow(null),
            services: joi_1.default.array().items(joi_1.default.string().trim().min(1).max(100)).optional(),
            description: joi_1.default.string().trim().max(500).optional().allow(''),
            address: joi_1.default.string().trim().max(200).optional().allow(''),
            rating: joi_1.default.number().min(0).max(5).optional(),
            isActive: joi_1.default.boolean().optional()
        })).min(1).required(),
        updatedBy: objectIdSchema.required()
    }).required(),
    params: joi_1.default.object({
        facilityId: objectIdSchema.required()
    }).required()
});
// Validation schemas for specific operations
exports.serviceProviderValidationSchemas = {
    create: exports.createServiceProviderSchema,
    update: exports.updateServiceProviderSchema,
    delete: exports.deleteServiceProviderSchema,
    getAll: exports.getAllServiceProvidersSchema,
    getById: exports.getServiceProviderByIdSchema,
    getByCategory: exports.getServiceProvidersByCategorySchema,
    getActive: exports.getActiveServiceProvidersSchema,
    search: exports.searchServiceProvidersSchema,
    getStatistics: exports.getServiceProviderStatisticsSchema,
    bulkUpdate: exports.bulkUpdateServiceProvidersSchema
};
// Helper validation functions
const validateServiceCategory = (category) => {
    return Object.values(ServiceProvider_1.ServiceCategory).includes(category);
};
exports.validateServiceCategory = validateServiceCategory;
const validateContractStatus = (status) => {
    return Object.values(ServiceProvider_1.ContractStatus).includes(status);
};
exports.validateContractStatus = validateContractStatus;
const validateContractDates = (startDate, endDate) => {
    if (!startDate || !endDate)
        return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};
exports.validateContractDates = validateContractDates;
const validateProviderRating = (rating) => {
    if (rating === undefined)
        return true;
    return rating >= 0 && rating <= 5;
};
exports.validateProviderRating = validateProviderRating;
// Schema for query parameters validation
exports.queryParamsSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sortBy: joi_1.default.string().valid('providerName', 'category', 'contactPerson', 'contractStatus', 'rating', 'createdAt', 'updatedAt').default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
    search: joi_1.default.string().trim().min(1).max(100).optional(),
    category: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ServiceCategory)).optional(),
    contractStatus: joi_1.default.string().valid(...Object.values(ServiceProvider_1.ContractStatus)).optional(),
    isActive: joi_1.default.string().valid('true', 'false').optional()
});
// Schema for facility ID parameter validation
exports.facilityIdParamSchema = joi_1.default.object({
    facilityId: objectIdSchema.required()
});
// Schema for provider ID parameter validation
exports.providerIdParamSchema = joi_1.default.object({
    id: objectIdSchema.required()
});
exports.default = {
    createServiceProviderSchema: exports.createServiceProviderSchema,
    updateServiceProviderSchema: exports.updateServiceProviderSchema,
    deleteServiceProviderSchema: exports.deleteServiceProviderSchema,
    getAllServiceProvidersSchema: exports.getAllServiceProvidersSchema,
    getServiceProviderByIdSchema: exports.getServiceProviderByIdSchema,
    getServiceProvidersByCategorySchema: exports.getServiceProvidersByCategorySchema,
    getActiveServiceProvidersSchema: exports.getActiveServiceProvidersSchema,
    searchServiceProvidersSchema: exports.searchServiceProvidersSchema,
    getServiceProviderStatisticsSchema: exports.getServiceProviderStatisticsSchema,
    bulkUpdateServiceProvidersSchema: exports.bulkUpdateServiceProvidersSchema,
    serviceProviderValidationSchemas: exports.serviceProviderValidationSchemas,
    validateServiceCategory: exports.validateServiceCategory,
    validateContractStatus: exports.validateContractStatus,
    validateContractDates: exports.validateContractDates,
    validateProviderRating: exports.validateProviderRating,
    queryParamsSchema: exports.queryParamsSchema,
    facilityIdParamSchema: exports.facilityIdParamSchema,
    providerIdParamSchema: exports.providerIdParamSchema
};
