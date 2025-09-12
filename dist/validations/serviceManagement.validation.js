"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateServiceQuery = exports.validateDeleteServiceManagement = exports.validateBulkUpdateServices = exports.validateRemoveServiceFromCategory = exports.validateUpdateServiceDetails = exports.validateUpdateServiceStatus = exports.validateAddServiceToCategory = exports.validateInitializeServices = exports.serviceQueryValidation = exports.deleteServiceManagementValidation = exports.bulkUpdateServicesValidation = exports.removeServiceFromCategoryValidation = exports.updateServiceDetailsValidation = exports.updateServiceStatusValidation = exports.addServiceToCategoryValidation = exports.initializeServicesValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const ServiceManagement_1 = require("../models/ServiceManagement");
// Validation schema for initializing services
exports.initializeServicesValidation = joi_1.default.object({
    facilityId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Facility ID is required',
        'string.pattern.base': 'Invalid facility ID format'
    }),
    facilityName: joi_1.default.string()
        .trim()
        .min(2)
        .max(200)
        .required()
        .messages({
        'string.empty': 'Facility name is required',
        'string.min': 'Facility name must be at least 2 characters long',
        'string.max': 'Facility name cannot exceed 200 characters'
    }),
    facilityType: joi_1.default.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.empty': 'Facility type is required',
        'string.min': 'Facility type must be at least 2 characters long',
        'string.max': 'Facility type cannot exceed 50 characters'
    }),
    createdBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Created by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for adding service to category
exports.addServiceToCategoryValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(ServiceManagement_1.ServiceCategory))
        .required()
        .messages({
        'string.empty': 'Service category is required',
        'any.only': 'Invalid service category'
    }),
    name: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Service name is required',
        'string.min': 'Service name must be at least 2 characters long',
        'string.max': 'Service name cannot exceed 100 characters'
    }),
    description: joi_1.default.string()
        .trim()
        .min(5)
        .max(500)
        .required()
        .messages({
        'string.empty': 'Service description is required',
        'string.min': 'Service description must be at least 5 characters long',
        'string.max': 'Service description cannot exceed 500 characters'
    }),
    isActive: joi_1.default.boolean()
        .optional()
        .default(false),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for updating service status
exports.updateServiceStatusValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(ServiceManagement_1.ServiceCategory))
        .required()
        .messages({
        'string.empty': 'Service category is required',
        'any.only': 'Invalid service category'
    }),
    serviceName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Service name is required',
        'string.min': 'Service name must be at least 2 characters long',
        'string.max': 'Service name cannot exceed 100 characters'
    }),
    isActive: joi_1.default.boolean()
        .required()
        .messages({
        'boolean.base': 'isActive must be a boolean value'
    }),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for updating service details
exports.updateServiceDetailsValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(ServiceManagement_1.ServiceCategory))
        .required()
        .messages({
        'string.empty': 'Service category is required',
        'any.only': 'Invalid service category'
    }),
    oldServiceName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Old service name is required',
        'string.min': 'Old service name must be at least 2 characters long',
        'string.max': 'Old service name cannot exceed 100 characters'
    }),
    newServiceName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'New service name must be at least 2 characters long',
        'string.max': 'New service name cannot exceed 100 characters'
    }),
    description: joi_1.default.string()
        .trim()
        .min(5)
        .max(500)
        .optional()
        .messages({
        'string.min': 'Service description must be at least 5 characters long',
        'string.max': 'Service description cannot exceed 500 characters'
    }),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for removing service from category
exports.removeServiceFromCategoryValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(ServiceManagement_1.ServiceCategory))
        .required()
        .messages({
        'string.empty': 'Service category is required',
        'any.only': 'Invalid service category'
    }),
    serviceName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Service name is required',
        'string.min': 'Service name must be at least 2 characters long',
        'string.max': 'Service name cannot exceed 100 characters'
    }),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for bulk update services
exports.bulkUpdateServicesValidation = joi_1.default.object({
    services: joi_1.default.array()
        .items(joi_1.default.object({
        category: joi_1.default.string()
            .valid(...Object.values(ServiceManagement_1.ServiceCategory))
            .required(),
        serviceName: joi_1.default.string()
            .trim()
            .min(2)
            .max(100)
            .required(),
        isActive: joi_1.default.boolean()
            .required()
    }))
        .min(1)
        .max(50)
        .required()
        .messages({
        'array.min': 'At least one service update is required',
        'array.max': 'Cannot update more than 50 services at once',
        'array.base': 'Services must be an array'
    }),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for delete service management
exports.deleteServiceManagementValidation = joi_1.default.object({
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for query parameters
exports.serviceQueryValidation = joi_1.default.object({
    page: joi_1.default.number()
        .integer()
        .min(1)
        .optional()
        .default(1),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10),
    search: joi_1.default.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),
    facilityType: joi_1.default.string()
        .trim()
        .min(2)
        .max(50)
        .optional(),
    category: joi_1.default.string()
        .valid(...Object.values(ServiceManagement_1.ServiceCategory))
        .optional(),
    includeInactive: joi_1.default.string()
        .valid('true', 'false')
        .optional()
        .default('false'),
    sortBy: joi_1.default.string()
        .valid('facilityName', 'facilityType', 'totalServicesActive', 'totalServicesAvailable', 'lastUpdated', 'createdAt')
        .optional()
        .default('lastUpdated'),
    sortOrder: joi_1.default.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
});
// Middleware to validate request body
const validateInitializeServices = (req, res, next) => {
    const { error } = exports.initializeServicesValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateInitializeServices = validateInitializeServices;
const validateAddServiceToCategory = (req, res, next) => {
    const { error } = exports.addServiceToCategoryValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateAddServiceToCategory = validateAddServiceToCategory;
const validateUpdateServiceStatus = (req, res, next) => {
    const { error } = exports.updateServiceStatusValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateUpdateServiceStatus = validateUpdateServiceStatus;
const validateUpdateServiceDetails = (req, res, next) => {
    const { error } = exports.updateServiceDetailsValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateUpdateServiceDetails = validateUpdateServiceDetails;
const validateRemoveServiceFromCategory = (req, res, next) => {
    const { error } = exports.removeServiceFromCategoryValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateRemoveServiceFromCategory = validateRemoveServiceFromCategory;
const validateBulkUpdateServices = (req, res, next) => {
    const { error } = exports.bulkUpdateServicesValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateBulkUpdateServices = validateBulkUpdateServices;
const validateDeleteServiceManagement = (req, res, next) => {
    const { error } = exports.deleteServiceManagementValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateDeleteServiceManagement = validateDeleteServiceManagement;
const validateServiceQuery = (req, res, next) => {
    const { error } = exports.serviceQueryValidation.validate(req.query);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        });
    }
    next();
};
exports.validateServiceQuery = validateServiceQuery;
