import Joi from 'joi';
import { ServiceCategory } from '../models/ServiceManagement';

// Validation schema for initializing services
export const initializeServicesValidation = Joi.object({
  facilityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Facility ID is required',
      'string.pattern.base': 'Invalid facility ID format'
    }),
    
  facilityName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Facility name is required',
      'string.min': 'Facility name must be at least 2 characters long',
      'string.max': 'Facility name cannot exceed 200 characters'
    }),
    
  facilityType: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Facility type is required',
      'string.min': 'Facility type must be at least 2 characters long',
      'string.max': 'Facility type cannot exceed 50 characters'
    }),
    
  createdBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Created by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for adding service to category
export const addServiceToCategoryValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ServiceCategory))
    .required()
    .messages({
      'string.empty': 'Service category is required',
      'any.only': 'Invalid service category'
    }),
    
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters long',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    
  description: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Service description is required',
      'string.min': 'Service description must be at least 5 characters long',
      'string.max': 'Service description cannot exceed 500 characters'
    }),
    
  isActive: Joi.boolean()
    .optional()
    .default(false),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for updating service status
export const updateServiceStatusValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ServiceCategory))
    .required()
    .messages({
      'string.empty': 'Service category is required',
      'any.only': 'Invalid service category'
    }),
    
  serviceName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters long',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    
  isActive: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'isActive must be a boolean value'
    }),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for updating service details
export const updateServiceDetailsValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ServiceCategory))
    .required()
    .messages({
      'string.empty': 'Service category is required',
      'any.only': 'Invalid service category'
    }),
    
  oldServiceName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Old service name is required',
      'string.min': 'Old service name must be at least 2 characters long',
      'string.max': 'Old service name cannot exceed 100 characters'
    }),
    
  newServiceName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'New service name must be at least 2 characters long',
      'string.max': 'New service name cannot exceed 100 characters'
    }),
    
  description: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Service description must be at least 5 characters long',
      'string.max': 'Service description cannot exceed 500 characters'
    }),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for removing service from category
export const removeServiceFromCategoryValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ServiceCategory))
    .required()
    .messages({
      'string.empty': 'Service category is required',
      'any.only': 'Invalid service category'
    }),
    
  serviceName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters long',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for bulk update services
export const bulkUpdateServicesValidation = Joi.object({
  services: Joi.array()
    .items(
      Joi.object({
        category: Joi.string()
          .valid(...Object.values(ServiceCategory))
          .required(),
        serviceName: Joi.string()
          .trim()
          .min(2)
          .max(100)
          .required(),
        isActive: Joi.boolean()
          .required()
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one service update is required',
      'array.max': 'Cannot update more than 50 services at once',
      'array.base': 'Services must be an array'
    }),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for delete service management
export const deleteServiceManagementValidation = Joi.object({
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for query parameters
export const serviceQueryValidation = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
    
  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional(),
    
  facilityType: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),
    
  category: Joi.string()
    .valid(...Object.values(ServiceCategory))
    .optional(),
    
  includeInactive: Joi.string()
    .valid('true', 'false')
    .optional()
    .default('false'),
    
  sortBy: Joi.string()
    .valid('facilityName', 'facilityType', 'totalServicesActive', 'totalServicesAvailable', 'lastUpdated', 'createdAt')
    .optional()
    .default('lastUpdated'),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// Middleware to validate request body
export const validateInitializeServices = (req: any, res: any, next: any) => {
  const { error } = initializeServicesValidation.validate(req.body);
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

export const validateAddServiceToCategory = (req: any, res: any, next: any) => {
  const { error } = addServiceToCategoryValidation.validate(req.body);
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

export const validateUpdateServiceStatus = (req: any, res: any, next: any) => {
  const { error } = updateServiceStatusValidation.validate(req.body);
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

export const validateUpdateServiceDetails = (req: any, res: any, next: any) => {
  const { error } = updateServiceDetailsValidation.validate(req.body);
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

export const validateRemoveServiceFromCategory = (req: any, res: any, next: any) => {
  const { error } = removeServiceFromCategoryValidation.validate(req.body);
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

export const validateBulkUpdateServices = (req: any, res: any, next: any) => {
  const { error } = bulkUpdateServicesValidation.validate(req.body);
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

export const validateDeleteServiceManagement = (req: any, res: any, next: any) => {
  const { error } = deleteServiceManagementValidation.validate(req.body);
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

export const validateServiceQuery = (req: any, res: any, next: any) => {
  const { error } = serviceQueryValidation.validate(req.query);
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
