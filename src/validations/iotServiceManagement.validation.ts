import Joi from 'joi';
import { IoTServiceCategory, ServiceStatus } from '../models/IoTServiceManagement';

// Validation schema for initializing IoT services
export const initializeIoTServicesValidation = Joi.object({
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
    .required()
    .messages({
      'string.empty': 'Facility type is required'
    }),
    
  createdBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Created by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for adding IoT service to category
export const addIoTServiceToCategoryValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(IoTServiceCategory))
    .required()
    .messages({
      'string.empty': 'IoT service category is required',
      'any.only': 'Invalid IoT service category'
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
    
  status: Joi.string()
    .valid(...Object.values(ServiceStatus))
    .optional()
    .default(ServiceStatus.SETUP_REQUIRED)
    .messages({
      'any.only': 'Invalid service status'
    }),
    
  features: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .optional()
    .default([])
    .messages({
      'array.base': 'Features must be an array of strings'
    }),
    
  integrationEndpoint: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Integration endpoint must be a valid URL'
    }),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for updating IoT service status
export const updateIoTServiceStatusValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(IoTServiceCategory))
    .required()
    .messages({
      'string.empty': 'IoT service category is required',
      'any.only': 'Invalid IoT service category'
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

// Validation schema for updating IoT service details
export const updateIoTServiceDetailsValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(IoTServiceCategory))
    .required()
    .messages({
      'string.empty': 'IoT service category is required',
      'any.only': 'Invalid IoT service category'
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
    
  status: Joi.string()
    .valid(...Object.values(ServiceStatus))
    .optional()
    .messages({
      'any.only': 'Invalid service status'
    }),
    
  features: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .optional()
    .messages({
      'array.base': 'Features must be an array of strings'
    }),
    
  integrationEndpoint: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Integration endpoint must be a valid URL'
    }),
    
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for removing IoT service from category
export const removeIoTServiceFromCategoryValidation = Joi.object({
  category: Joi.string()
    .valid(...Object.values(IoTServiceCategory))
    .required()
    .messages({
      'string.empty': 'IoT service category is required',
      'any.only': 'Invalid IoT service category'
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

// Validation schema for bulk update IoT services
export const bulkUpdateIoTServicesValidation = Joi.object({
  services: Joi.array()
    .items(
      Joi.object({
        category: Joi.string()
          .valid(...Object.values(IoTServiceCategory))
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
      'array.min': 'At least one IoT service update is required',
      'array.max': 'Cannot update more than 50 IoT services at once',
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

// Validation schema for delete IoT service management
export const deleteIoTServiceManagementValidation = Joi.object({
  updatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Updated by user ID is required',
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for query parameters
export const iotServiceQueryValidation = Joi.object({
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
    .optional(),
    
  category: Joi.string()
    .valid(...Object.values(IoTServiceCategory))
    .optional(),
    
  iotEnabled: Joi.string()
    .valid('true', 'false')
    .optional(),
    
  includeInactive: Joi.string()
    .valid('true', 'false')
    .optional()
    .default('false'),
    
  sortBy: Joi.string()
    .valid('facilityName', 'facilityType', 'totalServicesActive', 'totalServicesAvailable', 'iotEnabled', 'lastUpdated', 'createdAt')
    .optional()
    .default('lastUpdated'),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// Middleware to validate request body
export const validateInitializeIoTServices = (req: any, res: any, next: any) => {
  const { error } = initializeIoTServicesValidation.validate(req.body);
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

export const validateAddIoTServiceToCategory = (req: any, res: any, next: any) => {
  const { error } = addIoTServiceToCategoryValidation.validate(req.body);
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

export const validateUpdateIoTServiceStatus = (req: any, res: any, next: any) => {
  const { error } = updateIoTServiceStatusValidation.validate(req.body);
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

export const validateUpdateIoTServiceDetails = (req: any, res: any, next: any) => {
  const { error } = updateIoTServiceDetailsValidation.validate(req.body);
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

export const validateRemoveIoTServiceFromCategory = (req: any, res: any, next: any) => {
  const { error } = removeIoTServiceFromCategoryValidation.validate(req.body);
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

export const validateBulkUpdateIoTServices = (req: any, res: any, next: any) => {
  const { error } = bulkUpdateIoTServicesValidation.validate(req.body);
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

export const validateDeleteIoTServiceManagement = (req: any, res: any, next: any) => {
  const { error } = deleteIoTServiceManagementValidation.validate(req.body);
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

export const validateIoTServiceQuery = (req: any, res: any, next: any) => {
  const { error } = iotServiceQueryValidation.validate(req.query);
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
