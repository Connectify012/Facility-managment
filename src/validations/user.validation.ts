import Joi from 'joi';
import { UserRole, UserStatus, VerificationStatus } from '../models/User';

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
    .valid(...Object.values(UserRole))
    .default(UserRole.USER)
    .messages({
      'any.only': 'Role must be one of: ' + Object.values(UserRole).join(', ')
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
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(500).optional().trim(),
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
    hireDate: Joi.date().optional()
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
  assignedFacilities: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),

  managedFacilities: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),

  // Organization data
  organizationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Organization ID must be a valid ObjectId'
    }),

  departmentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Department ID must be a valid ObjectId'
    }),

  managerId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Manager ID must be a valid ObjectId'
    }),

  subordinates: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Each subordinate ID must be a valid ObjectId'
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
    avatar: Joi.string().uri().allow(''),
    bio: Joi.string().max(500).trim().allow(''),
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
    hireDate: Joi.date().allow(null)
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
  assignedFacilities: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),

  managedFacilities: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'string.pattern.base': 'Each facility ID must be a valid ObjectId'
    }),

  // Organization data
  organizationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'Organization ID must be a valid ObjectId'
    }),

  departmentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'Department ID must be a valid ObjectId'
    }),

  managerId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'Manager ID must be a valid ObjectId'
    }),

  subordinates: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'string.pattern.base': 'Each subordinate ID must be a valid ObjectId'
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