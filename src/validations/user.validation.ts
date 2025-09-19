import Joi from 'joi';
import { EmployeeType, EmploymentStatus, ShiftType, UserRole, UserStatus, VerificationStatus, WorkLocation } from '../models/User';

// User creation validation schema
export const createUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  username: Joi.string()
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

  password: Joi.string()
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

  firstName: Joi.string()
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

  lastName: Joi.string()
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

  phone: Joi.string()
    .optional()
    .trim()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  role: Joi.string()
    .valid(...Object.values(UserRole).filter(role => role !== UserRole.SUPER_ADMIN && role !== UserRole.ADMIN))
    .default(UserRole.USER)
    .messages({
      'any.only': 'Role must be one of: ' + Object.values(UserRole).filter(role => role !== UserRole.SUPER_ADMIN && role !== UserRole.ADMIN).join(', ')
    }),

  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .default(UserStatus.PENDING)
    .messages({
      'any.only': 'Status must be one of: ' + Object.values(UserStatus).join(', ')
    }),

  verificationStatus: Joi.string()
    .valid(...Object.values(VerificationStatus))
    .default(VerificationStatus.PENDING)
    .messages({
      'any.only': 'Verification status must be one of: ' + Object.values(VerificationStatus).join(', ')
    }),

  // Profile information
  profile: Joi.object({
    dateOfBirth: Joi.date().optional(),
    address: Joi.object({
      street: Joi.string().optional().trim(),
      city: Joi.string().optional().trim(),
      state: Joi.string().optional().trim(),
      country: Joi.string().optional().trim(),
      postalCode: Joi.string().optional().trim()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().optional().trim(),
      relationship: Joi.string().optional().trim(),
      phone: Joi.string().optional().trim().pattern(/^\+?[\d\s\-\(\)]+$/),
      email: Joi.string().email().optional().trim()
    }).optional(),
    department: Joi.string().optional().trim(),
    jobTitle: Joi.string().optional().trim(),
    employeeId: Joi.string().optional().trim(),
    hireDate: Joi.date().optional(),
    
    // Enhanced employee fields
    employeeType: Joi.string().valid(...Object.values(EmployeeType)).optional(),
    employmentStatus: Joi.string().valid(...Object.values(EmploymentStatus)).optional(),
    workLocation: Joi.string().valid(...Object.values(WorkLocation)).optional(),
    shiftType: Joi.string().valid(...Object.values(ShiftType)).optional(),
    probationEndDate: Joi.date().optional(),
    confirmationDate: Joi.date().optional(),
    terminationDate: Joi.date().optional(),
    lastWorkingDay: Joi.date().optional(),
    noticePeriod: Joi.number().integer().min(0).optional(),
    
    // Compensation & Benefits
    salary: Joi.object({
      basic: Joi.number().positive().optional(),
      currency: Joi.string().default('INR'),
      payFrequency: Joi.string().valid('monthly', 'weekly', 'bi_weekly', 'annual').default('monthly'),
      effectiveDate: Joi.date().optional()
    }).optional(),
    
    // Work Schedule
    workSchedule: Joi.object({
      workingDays: Joi.array().items(Joi.string()).optional(),
      startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      breakDuration: Joi.number().integer().min(0).optional(),
      weeklyHours: Joi.number().min(0).max(168).optional()
    }).optional(),

  }).optional(),

  // Settings
  settings: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(true),
      inApp: Joi.boolean().default(true)
    }).optional(),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'private', 'contacts').default('private'),
      showEmail: Joi.boolean().default(false),
      showPhone: Joi.boolean().default(false)
    }).optional(),
    language: Joi.string().default('en'),
    timezone: Joi.string().default('UTC'),
    theme: Joi.string().valid('light', 'dark', 'auto').default('light')
  }).optional(),

  // Facility associations
  managedFacilities: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),

  // Audit fields
  createdBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Created by ID must be a valid ObjectId'
    })
});

// User update validation schema (excluding password and certain fields)
export const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s\-']+$/)
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s\-']+$/)
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  // Profile information (same as create but all optional)
  profile: Joi.object({
    dateOfBirth: Joi.date().allow(null),
    address: Joi.object({
      street: Joi.string().trim().allow(''),
      city: Joi.string().trim().allow(''),
      state: Joi.string().trim().allow(''),
      country: Joi.string().trim().allow(''),
      postalCode: Joi.string().trim().allow('')
    }),
    emergencyContact: Joi.object({
      name: Joi.string().trim().allow(''),
      relationship: Joi.string().trim().allow(''),
      phone: Joi.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).allow(''),
      email: Joi.string().email().trim().allow('')
    }),
    department: Joi.string().trim().allow(''),
    jobTitle: Joi.string().trim().allow(''),
    employeeId: Joi.string().trim().allow(''),
    hireDate: Joi.date().allow(null),
    
    // Enhanced employee fields
    employeeType: Joi.string().valid(...Object.values(EmployeeType)),
    employmentStatus: Joi.string().valid(...Object.values(EmploymentStatus)),
    workLocation: Joi.string().valid(...Object.values(WorkLocation)),
    shiftType: Joi.string().valid(...Object.values(ShiftType)),
    probationEndDate: Joi.date().allow(null),
    confirmationDate: Joi.date().allow(null),
    terminationDate: Joi.date().allow(null),
    lastWorkingDay: Joi.date().allow(null),
    noticePeriod: Joi.number().integer().min(0),
    
    // Compensation & Benefits
    salary: Joi.object({
      basic: Joi.number().positive(),
      currency: Joi.string(),
      payFrequency: Joi.string().valid('monthly', 'weekly', 'bi_weekly', 'annual'),
      effectiveDate: Joi.date().allow(null)
    }),
    
    // Work Schedule
    workSchedule: Joi.object({
      workingDays: Joi.array().items(Joi.string()),
      startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      breakDuration: Joi.number().integer().min(0),
      weeklyHours: Joi.number().min(0).max(168)
    }),

  }),

  // Settings
  settings: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'private', 'contacts'),
      showEmail: Joi.boolean(),
      showPhone: Joi.boolean()
    }),
    language: Joi.string(),
    timezone: Joi.string(),
    theme: Joi.string().valid('light', 'dark', 'auto')
  }),

  // Facility associations
  managedFacilities: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),

  // Audit fields
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Updated by ID must be a valid ObjectId'
    })
});

// User role update validation schema
export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': 'Role must be one of: ' + Object.values(UserRole).join(', '),
      'any.required': 'Role is required'
    })
});

// User status update validation schema
export const updateUserStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .required()
    .messages({
      'any.only': 'Status must be one of: ' + Object.values(UserStatus).join(', '),
      'any.required': 'Status is required'
    })
});

// Password update validation schema
export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
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
export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid(...Object.values(UserStatus)).optional(),
  search: Joi.string().max(100).optional().trim()
});

// ObjectId parameter validation schema
export const objectIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});

// Role parameter validation schema
export const roleParamSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': 'Role must be one of: ' + Object.values(UserRole).join(', '),
      'any.required': 'Role is required'
    })
});

// ===== EMPLOYEE-SPECIFIC VALIDATION SCHEMAS =====

// Employment status parameter validation schema
export const employmentStatusParamSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(EmploymentStatus))
    .required()
    .messages({
      'any.only': 'Employment status must be one of: ' + Object.values(EmploymentStatus).join(', '),
      'any.required': 'Employment status is required'
    })
});

// Employee type parameter validation schema
export const employeeTypeParamSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(EmployeeType))
    .required()
    .messages({
      'any.only': 'Employee type must be one of: ' + Object.values(EmployeeType).join(', '),
      'any.required': 'Employee type is required'
    })
});

// Employee termination validation schema
export const terminateEmployeeSchema = Joi.object({
  terminationDate: Joi.date()
    .required()
    .messages({
      'any.required': 'Termination date is required'
    }),
  
  lastWorkingDay: Joi.date()
    .required()
    .messages({
      'any.required': 'Last working day is required'
    }),
  
  reason: Joi.string()
    .optional()
    .trim()
    .max(500)
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    })
});

// Work schedule validation schema
export const workScheduleSchema = Joi.object({
  workSchedule: Joi.object({
    workingDays: Joi.array()
      .items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one working day is required'
      }),
    
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:MM format',
        'any.required': 'Start time is required'
      }),
    
    endTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'End time must be in HH:MM format',
        'any.required': 'End time is required'
      }),
    
    breakDuration: Joi.number()
      .integer()
      .min(0)
      .max(480)
      .default(60)
      .messages({
        'number.min': 'Break duration cannot be negative',
        'number.max': 'Break duration cannot exceed 8 hours (480 minutes)'
      }),
    
    weeklyHours: Joi.number()
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
export const employeeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  employmentStatus: Joi.string().valid(...Object.values(EmploymentStatus)).optional(),
  employeeType: Joi.string().valid(...Object.values(EmployeeType)).optional(),
  department: Joi.string().optional().trim(),
  workLocation: Joi.string().valid(...Object.values(WorkLocation)).optional(),
  shiftType: Joi.string().valid(...Object.values(ShiftType)).optional(),
  search: Joi.string().max(100).optional().trim()
});