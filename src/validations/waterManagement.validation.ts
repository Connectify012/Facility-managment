import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Water Tank Validations
export const createWaterTankSchema = Joi.object({
  tankName: Joi.string().required().trim().messages({
    'string.empty': 'Tank name is required',
    'any.required': 'Tank name is required'
  }),
  location: Joi.string().required().trim().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required'
  }),
  capacity: Joi.number().min(0).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be positive',
    'any.required': 'Capacity is required'
  }),
  type: Joi.string().valid('overhead', 'underground', 'surface', 'storage').required().messages({
    'any.only': 'Type must be one of: overhead, underground, surface, storage',
    'any.required': 'Type is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateWaterTankSchema = Joi.object({
  tankName: Joi.string().trim().messages({
    'string.empty': 'Tank name cannot be empty'
  }),
  location: Joi.string().trim().messages({
    'string.empty': 'Location cannot be empty'
  }),
  capacity: Joi.number().min(0).messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be positive'
  }),
  type: Joi.string().valid('overhead', 'underground', 'surface', 'storage').messages({
    'any.only': 'Type must be one of: overhead, underground, surface, storage'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// Borewell Validations
export const createBorewellSchema = Joi.object({
  borewellName: Joi.string().required().trim().messages({
    'string.empty': 'Borewell name is required',
    'any.required': 'Borewell name is required'
  }),
  location: Joi.string().required().trim().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required'
  }),
  depth: Joi.number().min(0).required().messages({
    'number.base': 'Depth must be a number',
    'number.min': 'Depth must be positive',
    'any.required': 'Depth is required'
  }),
  waterSupplied: Joi.number().min(0).required().messages({
    'number.base': 'Water supplied must be a number',
    'number.min': 'Water supplied must be positive',
    'any.required': 'Water supplied is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateBorewellSchema = Joi.object({
  borewellName: Joi.string().trim().messages({
    'string.empty': 'Borewell name cannot be empty'
  }),
  location: Joi.string().trim().messages({
    'string.empty': 'Location cannot be empty'
  }),
  depth: Joi.number().min(0).messages({
    'number.base': 'Depth must be a number',
    'number.min': 'Depth must be positive'
  }),
  waterSupplied: Joi.number().min(0).messages({
    'number.base': 'Water supplied must be a number',
    'number.min': 'Water supplied must be positive'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// Cauvery Validations
export const createCauverySchema = Joi.object({
  waterSupplied: Joi.number().min(0).required().messages({
    'number.base': 'Water supplied must be a number',
    'number.min': 'Water supplied must be positive',
    'any.required': 'Water supplied is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateCauverySchema = Joi.object({
  waterSupplied: Joi.number().min(0).messages({
    'number.base': 'Water supplied must be a number',
    'number.min': 'Water supplied must be positive'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// Tanker Validations
export const createTankerSchema = Joi.object({
  totalTankers: Joi.number().min(0).required().messages({
    'number.base': 'Total tankers must be a number',
    'number.min': 'Total tankers must be positive',
    'any.required': 'Total tankers is required'
  }),
  tankerCapacity: Joi.number().min(0).required().messages({
    'number.base': 'Tanker capacity must be a number',
    'number.min': 'Tanker capacity must be positive',
    'any.required': 'Tanker capacity is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateTankerSchema = Joi.object({
  totalTankers: Joi.number().min(0).messages({
    'number.base': 'Total tankers must be a number',
    'number.min': 'Total tankers must be positive'
  }),
  tankerCapacity: Joi.number().min(0).messages({
    'number.base': 'Tanker capacity must be a number',
    'number.min': 'Tanker capacity must be positive'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// Validation Middleware Functions
export const validateCreateWaterTank = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createWaterTankSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateUpdateWaterTank = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateWaterTankSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateCreateBorewell = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createBorewellSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateUpdateBorewell = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateBorewellSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateCreateCauvery = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createCauverySchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateUpdateCauvery = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateCauverySchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateCreateTanker = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createTankerSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};

export const validateUpdateTanker = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateTankerSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
    return;
  }
  next();
};