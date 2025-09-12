import Joi from 'joi';

// Validation schema for creating a facility
export const createFacilityValidation = Joi.object({
  siteName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Site name is required',
      'string.min': 'Site name must be at least 2 characters long',
      'string.max': 'Site name cannot exceed 100 characters'
    }),
    
  city: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'City is required',
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City cannot exceed 50 characters'
    }),
    
  location: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Location is required',
      'string.min': 'Location must be at least 5 characters long',
      'string.max': 'Location cannot exceed 200 characters'
    }),
    
  clientName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Client name is required',
      'string.min': 'Client name must be at least 2 characters long',
      'string.max': 'Client name cannot exceed 100 characters'
    }),
    
  position: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Position is required',
      'string.min': 'Position must be at least 2 characters long',
      'string.max': 'Position cannot exceed 100 characters'
    }),
    
  contactNo: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .required()
    .messages({
      'string.empty': 'Contact number is required',
      'string.pattern.base': 'Please provide a valid contact number'
    }),
    
  email: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
    
  facilityType: Joi.string()
    .valid('residential', 'corporate', 'industrial', 'hospitality')
    .required()
    .messages({
      'string.empty': 'Facility type is required',
      'any.only': 'Facility type must be one of: residential, corporate, industrial, hospitality'
    }),
    
  createdBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Validation schema for updating a facility
export const updateFacilityValidation = Joi.object({
  siteName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Site name must be at least 2 characters long',
      'string.max': 'Site name cannot exceed 100 characters'
    }),
    
  city: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City cannot exceed 50 characters'
    }),
    
  location: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Location must be at least 5 characters long',
      'string.max': 'Location cannot exceed 200 characters'
    }),
    
  clientName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Client name must be at least 2 characters long',
      'string.max': 'Client name cannot exceed 100 characters'
    }),
    
  position: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Position must be at least 2 characters long',
      'string.max': 'Position cannot exceed 100 characters'
    }),
    
  contactNo: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid contact number'
    }),
    
  email: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
    
  facilityType: Joi.string()
    .valid('residential', 'corporate', 'industrial', 'hospitality')
    .optional()
    .messages({
      'any.only': 'Facility type must be one of: residential, corporate, industrial, hospitality'
    })
});

// Validation schema for bulk create facilities
export const bulkCreateFacilitiesValidation = Joi.object({
  facilities: Joi.array()
    .items(createFacilityValidation)
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
export const facilityQueryValidation = Joi.object({
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
    
  city: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
    
  facilityType: Joi.string()
    .valid('residential', 'corporate', 'industrial', 'hospitality')
    .optional(),
    
  sortBy: Joi.string()
    .valid('siteName', 'city', 'clientName', 'facilityType', 'createdAt', 'updatedAt')
    .optional()
    .default('createdAt'),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// Middleware to validate request body
export const validateCreateFacility = (req: any, res: any, next: any) => {
  const { error } = createFacilityValidation.validate(req.body);
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

export const validateUpdateFacility = (req: any, res: any, next: any) => {
  const { error } = updateFacilityValidation.validate(req.body);
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

export const validateBulkCreateFacilities = (req: any, res: any, next: any) => {
  const { error } = bulkCreateFacilitiesValidation.validate(req.body);
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

export const validateFacilityQuery = (req: any, res: any, next: any) => {
  const { error } = facilityQueryValidation.validate(req.query);
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
