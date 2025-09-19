"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeQuerySchema = exports.workScheduleSchema = exports.terminateEmployeeSchema = exports.employeeTypeParamSchema = exports.employmentStatusParamSchema = exports.roleParamSchema = exports.objectIdParamSchema = exports.getUsersQuerySchema = exports.updatePasswordSchema = exports.updateUserStatusSchema = exports.updateUserRoleSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const User_1 = require("../models/User");
// User creation validation schema
exports.createUserSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    username: joi_1.default.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional()
        .trim()
        .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
    }),
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
    }),
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .pattern(/^[a-zA-Z\s\-']+$/)
        .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'First name is required'
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .pattern(/^[a-zA-Z\s\-']+$/)
        .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'Last name is required'
    }),
    phone: joi_1.default.string()
        .optional()
        .trim()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .messages({
        'string.pattern.base': 'Please provide a valid phone number'
    }),
    role: joi_1.default.string()
        .valid(...Object.values(User_1.UserRole).filter(role => role !== User_1.UserRole.SUPER_ADMIN && role !== User_1.UserRole.ADMIN))
        .default(User_1.UserRole.USER)
        .messages({
        'any.only': 'Role must be one of: ' + Object.values(User_1.UserRole).filter(role => role !== User_1.UserRole.SUPER_ADMIN && role !== User_1.UserRole.ADMIN).join(', ')
    }),
    status: joi_1.default.string()
        .valid(...Object.values(User_1.UserStatus))
        .default(User_1.UserStatus.PENDING)
        .messages({
        'any.only': 'Status must be one of: ' + Object.values(User_1.UserStatus).join(', ')
    }),
    verificationStatus: joi_1.default.string()
        .valid(...Object.values(User_1.VerificationStatus))
        .default(User_1.VerificationStatus.PENDING)
        .messages({
        'any.only': 'Verification status must be one of: ' + Object.values(User_1.VerificationStatus).join(', ')
    }),
    // Profile information
    profile: joi_1.default.object({
        dateOfBirth: joi_1.default.date().optional(),
        address: joi_1.default.object({
            street: joi_1.default.string().optional().trim(),
            city: joi_1.default.string().optional().trim(),
            state: joi_1.default.string().optional().trim(),
            country: joi_1.default.string().optional().trim(),
            postalCode: joi_1.default.string().optional().trim()
        }).optional(),
        emergencyContact: joi_1.default.object({
            name: joi_1.default.string().optional().trim(),
            relationship: joi_1.default.string().optional().trim(),
            phone: joi_1.default.string().optional().trim().pattern(/^\+?[\d\s\-\(\)]+$/),
            email: joi_1.default.string().email().optional().trim()
        }).optional(),
        department: joi_1.default.string().optional().trim(),
        jobTitle: joi_1.default.string().optional().trim(),
        employeeId: joi_1.default.string().optional().trim(),
        hireDate: joi_1.default.date().optional(),
        // Enhanced employee fields
        employeeType: joi_1.default.string().valid(...Object.values(User_1.EmployeeType)).optional(),
        employmentStatus: joi_1.default.string().valid(...Object.values(User_1.EmploymentStatus)).optional(),
        workLocation: joi_1.default.string().valid(...Object.values(User_1.WorkLocation)).optional(),
        shiftType: joi_1.default.string().valid(...Object.values(User_1.ShiftType)).optional(),
        probationEndDate: joi_1.default.date().optional(),
        confirmationDate: joi_1.default.date().optional(),
        terminationDate: joi_1.default.date().optional(),
        lastWorkingDay: joi_1.default.date().optional(),
        noticePeriod: joi_1.default.number().integer().min(0).optional(),
        // Compensation & Benefits
        salary: joi_1.default.object({
            basic: joi_1.default.number().positive().optional(),
            currency: joi_1.default.string().default('INR'),
            payFrequency: joi_1.default.string().valid('monthly', 'weekly', 'bi_weekly', 'annual').default('monthly'),
            effectiveDate: joi_1.default.date().optional()
        }).optional(),
        // Work Schedule
        workSchedule: joi_1.default.object({
            workingDays: joi_1.default.array().items(joi_1.default.string()).optional(),
            startTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            endTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            breakDuration: joi_1.default.number().integer().min(0).optional(),
            weeklyHours: joi_1.default.number().min(0).max(168).optional()
        }).optional(),
    }).optional(),
    // Settings
    settings: joi_1.default.object({
        notifications: joi_1.default.object({
            email: joi_1.default.boolean().default(true),
            sms: joi_1.default.boolean().default(false),
            push: joi_1.default.boolean().default(true),
            inApp: joi_1.default.boolean().default(true)
        }).optional(),
        privacy: joi_1.default.object({
            profileVisibility: joi_1.default.string().valid('public', 'private', 'contacts').default('private'),
            showEmail: joi_1.default.boolean().default(false),
            showPhone: joi_1.default.boolean().default(false)
        }).optional(),
        language: joi_1.default.string().default('en'),
        timezone: joi_1.default.string().default('UTC'),
        theme: joi_1.default.string().valid('light', 'dark', 'auto').default('light')
    }).optional(),
    // Facility associations
    managedFacilities: joi_1.default.array()
        .items(joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/))
        .optional()
        .messages({
        'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),
    // Audit fields
    createdBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Created by ID must be a valid ObjectId'
    })
});
// User update validation schema (excluding password and certain fields)
exports.updateUserSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .trim()
        .messages({
        'string.email': 'Please provide a valid email address'
    }),
    username: joi_1.default.string()
        .alphanum()
        .min(3)
        .max(30)
        .trim()
        .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
    }),
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .trim()
        .pattern(/^[a-zA-Z\s\-']+$/)
        .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .trim()
        .pattern(/^[a-zA-Z\s\-']+$/)
        .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }),
    phone: joi_1.default.string()
        .trim()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .allow('')
        .messages({
        'string.pattern.base': 'Please provide a valid phone number'
    }),
    // Profile information (same as create but all optional)
    profile: joi_1.default.object({
        dateOfBirth: joi_1.default.date().allow(null),
        address: joi_1.default.object({
            street: joi_1.default.string().trim().allow(''),
            city: joi_1.default.string().trim().allow(''),
            state: joi_1.default.string().trim().allow(''),
            country: joi_1.default.string().trim().allow(''),
            postalCode: joi_1.default.string().trim().allow('')
        }),
        emergencyContact: joi_1.default.object({
            name: joi_1.default.string().trim().allow(''),
            relationship: joi_1.default.string().trim().allow(''),
            phone: joi_1.default.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).allow(''),
            email: joi_1.default.string().email().trim().allow('')
        }),
        department: joi_1.default.string().trim().allow(''),
        jobTitle: joi_1.default.string().trim().allow(''),
        employeeId: joi_1.default.string().trim().allow(''),
        hireDate: joi_1.default.date().allow(null),
        // Enhanced employee fields
        employeeType: joi_1.default.string().valid(...Object.values(User_1.EmployeeType)),
        employmentStatus: joi_1.default.string().valid(...Object.values(User_1.EmploymentStatus)),
        workLocation: joi_1.default.string().valid(...Object.values(User_1.WorkLocation)),
        shiftType: joi_1.default.string().valid(...Object.values(User_1.ShiftType)),
        probationEndDate: joi_1.default.date().allow(null),
        confirmationDate: joi_1.default.date().allow(null),
        terminationDate: joi_1.default.date().allow(null),
        lastWorkingDay: joi_1.default.date().allow(null),
        noticePeriod: joi_1.default.number().integer().min(0),
        // Compensation & Benefits
        salary: joi_1.default.object({
            basic: joi_1.default.number().positive(),
            currency: joi_1.default.string(),
            payFrequency: joi_1.default.string().valid('monthly', 'weekly', 'bi_weekly', 'annual'),
            effectiveDate: joi_1.default.date().allow(null)
        }),
        // Work Schedule
        workSchedule: joi_1.default.object({
            workingDays: joi_1.default.array().items(joi_1.default.string()),
            startTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            endTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            breakDuration: joi_1.default.number().integer().min(0),
            weeklyHours: joi_1.default.number().min(0).max(168)
        }),
    }),
    // Settings
    settings: joi_1.default.object({
        notifications: joi_1.default.object({
            email: joi_1.default.boolean(),
            sms: joi_1.default.boolean(),
            push: joi_1.default.boolean(),
            inApp: joi_1.default.boolean()
        }),
        privacy: joi_1.default.object({
            profileVisibility: joi_1.default.string().valid('public', 'private', 'contacts'),
            showEmail: joi_1.default.boolean(),
            showPhone: joi_1.default.boolean()
        }),
        language: joi_1.default.string(),
        timezone: joi_1.default.string(),
        theme: joi_1.default.string().valid('light', 'dark', 'auto')
    }),
    // Facility associations
    managedFacilities: joi_1.default.array()
        .items(joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/))
        .messages({
        'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),
    // Audit fields
    updatedBy: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
        'string.pattern.base': 'Updated by ID must be a valid ObjectId'
    })
});
// User role update validation schema
exports.updateUserRoleSchema = joi_1.default.object({
    role: joi_1.default.string()
        .valid(...Object.values(User_1.UserRole))
        .required()
        .messages({
        'any.only': 'Role must be one of: ' + Object.values(User_1.UserRole).join(', '),
        'any.required': 'Role is required'
    })
});
// User status update validation schema
exports.updateUserStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid(...Object.values(User_1.UserStatus))
        .required()
        .messages({
        'any.only': 'Status must be one of: ' + Object.values(User_1.UserStatus).join(', '),
        'any.required': 'Status is required'
    })
});
// Password update validation schema
exports.updatePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Current password is required'
    }),
    newPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
    })
});
// Query parameters validation schema
exports.getUsersQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    role: joi_1.default.string().valid(...Object.values(User_1.UserRole)).optional(),
    status: joi_1.default.string().valid(...Object.values(User_1.UserStatus)).optional(),
    search: joi_1.default.string().max(100).optional().trim()
});
// ObjectId parameter validation schema
exports.objectIdParamSchema = joi_1.default.object({
    id: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.pattern.base': 'Invalid user ID format',
        'any.required': 'User ID is required'
    })
});
// Role parameter validation schema
exports.roleParamSchema = joi_1.default.object({
    role: joi_1.default.string()
        .valid(...Object.values(User_1.UserRole))
        .required()
        .messages({
        'any.only': 'Role must be one of: ' + Object.values(User_1.UserRole).join(', '),
        'any.required': 'Role is required'
    })
});
// ===== EMPLOYEE-SPECIFIC VALIDATION SCHEMAS =====
// Employment status parameter validation schema
exports.employmentStatusParamSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid(...Object.values(User_1.EmploymentStatus))
        .required()
        .messages({
        'any.only': 'Employment status must be one of: ' + Object.values(User_1.EmploymentStatus).join(', '),
        'any.required': 'Employment status is required'
    })
});
// Employee type parameter validation schema
exports.employeeTypeParamSchema = joi_1.default.object({
    type: joi_1.default.string()
        .valid(...Object.values(User_1.EmployeeType))
        .required()
        .messages({
        'any.only': 'Employee type must be one of: ' + Object.values(User_1.EmployeeType).join(', '),
        'any.required': 'Employee type is required'
    })
});
// Employee termination validation schema
exports.terminateEmployeeSchema = joi_1.default.object({
    terminationDate: joi_1.default.date()
        .required()
        .messages({
        'any.required': 'Termination date is required'
    }),
    lastWorkingDay: joi_1.default.date()
        .required()
        .messages({
        'any.required': 'Last working day is required'
    }),
    reason: joi_1.default.string()
        .optional()
        .trim()
        .max(500)
        .messages({
        'string.max': 'Reason cannot exceed 500 characters'
    })
});
// Work schedule validation schema
exports.workScheduleSchema = joi_1.default.object({
    workSchedule: joi_1.default.object({
        workingDays: joi_1.default.array()
            .items(joi_1.default.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
            .min(1)
            .required()
            .messages({
            'array.min': 'At least one working day is required'
        }),
        startTime: joi_1.default.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required()
            .messages({
            'string.pattern.base': 'Start time must be in HH:MM format',
            'any.required': 'Start time is required'
        }),
        endTime: joi_1.default.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required()
            .messages({
            'string.pattern.base': 'End time must be in HH:MM format',
            'any.required': 'End time is required'
        }),
        breakDuration: joi_1.default.number()
            .integer()
            .min(0)
            .max(480)
            .default(60)
            .messages({
            'number.min': 'Break duration cannot be negative',
            'number.max': 'Break duration cannot exceed 8 hours (480 minutes)'
        }),
        weeklyHours: joi_1.default.number()
            .min(1)
            .max(168)
            .required()
            .messages({
            'number.min': 'Weekly hours must be at least 1',
            'number.max': 'Weekly hours cannot exceed 168 (24 hours × 7 days)',
            'any.required': 'Weekly hours is required'
        })
    }).required()
});
// Employee query parameters validation schema
exports.employeeQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    employmentStatus: joi_1.default.string().valid(...Object.values(User_1.EmploymentStatus)).optional(),
    employeeType: joi_1.default.string().valid(...Object.values(User_1.EmployeeType)).optional(),
    department: joi_1.default.string().optional().trim(),
    workLocation: joi_1.default.string().valid(...Object.values(User_1.WorkLocation)).optional(),
    shiftType: joi_1.default.string().valid(...Object.values(User_1.ShiftType)).optional(),
    search: joi_1.default.string().max(100).optional().trim()
});
