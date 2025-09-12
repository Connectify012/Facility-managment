"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIoTServiceQuery = exports.validateDeleteIoTServiceManagement = exports.validateBulkUpdateIoTServices = exports.validateRemoveIoTServiceFromCategory = exports.validateUpdateIoTServiceDetails = exports.validateUpdateIoTServiceStatus = exports.validateAddIoTServiceToCategory = exports.validateInitializeIoTServices = exports.iotServiceQueryValidation = exports.deleteIoTServiceManagementValidation = exports.bulkUpdateIoTServicesValidation = exports.removeIoTServiceFromCategoryValidation = exports.updateIoTServiceDetailsValidation = exports.updateIoTServiceStatusValidation = exports.addIoTServiceToCategoryValidation = exports.initializeIoTServicesValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const IoTServiceManagement_1 = require("../models/IoTServiceManagement");
// Validation schema for initializing IoT services
exports.initializeIoTServicesValidation = joi_1.default.object({
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
        .required()
        .messages({
        'string.empty': 'Facility type is required'
    }),
    createdBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Created by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for adding IoT service to category
exports.addIoTServiceToCategoryValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.IoTServiceCategory))
        .required()
        .messages({
        'string.empty': 'IoT service category is required',
        'any.only': 'Invalid IoT service category'
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
    status: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.ServiceStatus))
        .optional()
        .default(IoTServiceManagement_1.ServiceStatus.SETUP_REQUIRED)
        .messages({
        'any.only': 'Invalid service status'
    }),
    features: joi_1.default.array()
        .items(joi_1.default.string().trim().min(1).max(100))
        .optional()
        .default([])
        .messages({
        'array.base': 'Features must be an array of strings'
    }),
    integrationEndpoint: joi_1.default.string()
        .uri()
        .optional()
        .messages({
        'string.uri': 'Integration endpoint must be a valid URL'
    }),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for updating IoT service status
exports.updateIoTServiceStatusValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.IoTServiceCategory))
        .required()
        .messages({
        'string.empty': 'IoT service category is required',
        'any.only': 'Invalid IoT service category'
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
// Validation schema for updating IoT service details
exports.updateIoTServiceDetailsValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.IoTServiceCategory))
        .required()
        .messages({
        'string.empty': 'IoT service category is required',
        'any.only': 'Invalid IoT service category'
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
    status: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.ServiceStatus))
        .optional()
        .messages({
        'any.only': 'Invalid service status'
    }),
    features: joi_1.default.array()
        .items(joi_1.default.string().trim().min(1).max(100))
        .optional()
        .messages({
        'array.base': 'Features must be an array of strings'
    }),
    integrationEndpoint: joi_1.default.string()
        .uri()
        .optional()
        .allow('')
        .messages({
        'string.uri': 'Integration endpoint must be a valid URL'
    }),
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for removing IoT service from category
exports.removeIoTServiceFromCategoryValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.IoTServiceCategory))
        .required()
        .messages({
        'string.empty': 'IoT service category is required',
        'any.only': 'Invalid IoT service category'
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
// Validation schema for bulk update IoT services
exports.bulkUpdateIoTServicesValidation = joi_1.default.object({
    services: joi_1.default.array()
        .items(joi_1.default.object({
        category: joi_1.default.string()
            .valid(...Object.values(IoTServiceManagement_1.IoTServiceCategory))
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
        'array.min': 'At least one IoT service update is required',
        'array.max': 'Cannot update more than 50 IoT services at once',
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
// Validation schema for delete IoT service management
exports.deleteIoTServiceManagementValidation = joi_1.default.object({
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.empty': 'Updated by user ID is required',
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for query parameters
exports.iotServiceQueryValidation = joi_1.default.object({
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
        .optional(),
    category: joi_1.default.string()
        .valid(...Object.values(IoTServiceManagement_1.IoTServiceCategory))
        .optional(),
    iotEnabled: joi_1.default.string()
        .valid('true', 'false')
        .optional(),
    includeInactive: joi_1.default.string()
        .valid('true', 'false')
        .optional()
        .default('false'),
    sortBy: joi_1.default.string()
        .valid('facilityName', 'facilityType', 'totalServicesActive', 'totalServicesAvailable', 'iotEnabled', 'lastUpdated', 'createdAt')
        .optional()
        .default('lastUpdated'),
    sortOrder: joi_1.default.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
});
// Middleware to validate request body
const validateInitializeIoTServices = (req, res, next) => {
    const { error } = exports.initializeIoTServicesValidation.validate(req.body);
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
exports.validateInitializeIoTServices = validateInitializeIoTServices;
const validateAddIoTServiceToCategory = (req, res, next) => {
    const { error } = exports.addIoTServiceToCategoryValidation.validate(req.body);
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
exports.validateAddIoTServiceToCategory = validateAddIoTServiceToCategory;
const validateUpdateIoTServiceStatus = (req, res, next) => {
    const { error } = exports.updateIoTServiceStatusValidation.validate(req.body);
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
exports.validateUpdateIoTServiceStatus = validateUpdateIoTServiceStatus;
const validateUpdateIoTServiceDetails = (req, res, next) => {
    const { error } = exports.updateIoTServiceDetailsValidation.validate(req.body);
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
exports.validateUpdateIoTServiceDetails = validateUpdateIoTServiceDetails;
const validateRemoveIoTServiceFromCategory = (req, res, next) => {
    const { error } = exports.removeIoTServiceFromCategoryValidation.validate(req.body);
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
exports.validateRemoveIoTServiceFromCategory = validateRemoveIoTServiceFromCategory;
const validateBulkUpdateIoTServices = (req, res, next) => {
    const { error } = exports.bulkUpdateIoTServicesValidation.validate(req.body);
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
exports.validateBulkUpdateIoTServices = validateBulkUpdateIoTServices;
const validateDeleteIoTServiceManagement = (req, res, next) => {
    const { error } = exports.deleteIoTServiceManagementValidation.validate(req.body);
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
exports.validateDeleteIoTServiceManagement = validateDeleteIoTServiceManagement;
const validateIoTServiceQuery = (req, res, next) => {
    const { error } = exports.iotServiceQueryValidation.validate(req.query);
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
exports.validateIoTServiceQuery = validateIoTServiceQuery;
