"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFacilityQuery = exports.validateBulkCreateFacilities = exports.validateUpdateFacility = exports.validateCreateFacility = exports.facilityQueryValidation = exports.bulkCreateFacilitiesValidation = exports.updateFacilityValidation = exports.createFacilityValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation schema for creating a facility
exports.createFacilityValidation = joi_1.default.object({
    siteName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Site name is required',
        'string.min': 'Site name must be at least 2 characters long',
        'string.max': 'Site name cannot exceed 100 characters'
    }),
    city: joi_1.default.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City cannot exceed 50 characters'
    }),
    location: joi_1.default.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
        'string.empty': 'Location is required',
        'string.min': 'Location must be at least 5 characters long',
        'string.max': 'Location cannot exceed 200 characters'
    }),
    clientName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Client name is required',
        'string.min': 'Client name must be at least 2 characters long',
        'string.max': 'Client name cannot exceed 100 characters'
    }),
    position: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Position is required',
        'string.min': 'Position must be at least 2 characters long',
        'string.max': 'Position cannot exceed 100 characters'
    }),
    contactNo: joi_1.default.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .required()
        .messages({
        'string.empty': 'Contact number is required',
        'string.pattern.base': 'Please provide a valid contact number'
    }),
    email: joi_1.default.string()
        .email()
        .optional()
        .allow('')
        .messages({
        'string.email': 'Please provide a valid email address'
    }),
    facilityType: joi_1.default.string()
        .valid('residential', 'corporate', 'industrial', 'hospitality')
        .required()
        .messages({
        'string.empty': 'Facility type is required',
        'any.only': 'Facility type must be one of: residential, corporate, industrial, hospitality'
    }),
    createdBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Invalid user ID format'
    })
});
// Validation schema for updating a facility
exports.updateFacilityValidation = joi_1.default.object({
    siteName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Site name must be at least 2 characters long',
        'string.max': 'Site name cannot exceed 100 characters'
    }),
    city: joi_1.default.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City cannot exceed 50 characters'
    }),
    location: joi_1.default.string()
        .trim()
        .min(5)
        .max(200)
        .optional()
        .messages({
        'string.min': 'Location must be at least 5 characters long',
        'string.max': 'Location cannot exceed 200 characters'
    }),
    clientName: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Client name must be at least 2 characters long',
        'string.max': 'Client name cannot exceed 100 characters'
    }),
    position: joi_1.default.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Position must be at least 2 characters long',
        'string.max': 'Position cannot exceed 100 characters'
    }),
    contactNo: joi_1.default.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional()
        .messages({
        'string.pattern.base': 'Please provide a valid contact number'
    }),
    email: joi_1.default.string()
        .email()
        .optional()
        .allow('')
        .messages({
        'string.email': 'Please provide a valid email address'
    }),
    facilityType: joi_1.default.string()
        .valid('residential', 'corporate', 'industrial', 'hospitality')
        .optional()
        .messages({
        'any.only': 'Facility type must be one of: residential, corporate, industrial, hospitality'
    })
});
// Validation schema for bulk create facilities
exports.bulkCreateFacilitiesValidation = joi_1.default.object({
    facilities: joi_1.default.array()
        .items(exports.createFacilityValidation)
        .min(1)
        .max(100)
        .required()
        .messages({
        'array.min': 'At least one facility is required',
        'array.max': 'Cannot create more than 100 facilities at once',
        'array.base': 'Facilities must be an array'
    })
});
// Validation schema for query parameters
exports.facilityQueryValidation = joi_1.default.object({
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
    city: joi_1.default.string()
        .trim()
        .min(1)
        .max(50)
        .optional(),
    facilityType: joi_1.default.string()
        .valid('residential', 'corporate', 'industrial', 'hospitality')
        .optional(),
    sortBy: joi_1.default.string()
        .valid('siteName', 'city', 'clientName', 'facilityType', 'createdAt', 'updatedAt')
        .optional()
        .default('createdAt'),
    sortOrder: joi_1.default.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
});
// Middleware to validate request body
const validateCreateFacility = (req, res, next) => {
    const { error } = exports.createFacilityValidation.validate(req.body);
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
exports.validateCreateFacility = validateCreateFacility;
const validateUpdateFacility = (req, res, next) => {
    const { error } = exports.updateFacilityValidation.validate(req.body);
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
exports.validateUpdateFacility = validateUpdateFacility;
const validateBulkCreateFacilities = (req, res, next) => {
    const { error } = exports.bulkCreateFacilitiesValidation.validate(req.body);
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
exports.validateBulkCreateFacilities = validateBulkCreateFacilities;
const validateFacilityQuery = (req, res, next) => {
    const { error } = exports.facilityQueryValidation.validate(req.query);
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
exports.validateFacilityQuery = validateFacilityQuery;
