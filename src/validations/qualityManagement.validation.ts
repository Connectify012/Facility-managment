import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// STP Validations
export const createSTPSchema = Joi.object({
  mlss: Joi.number().min(0).required().messages({
    'number.base': 'MLSS must be a number',
    'number.min': 'MLSS must be positive',
    'any.required': 'MLSS is required'
  }),
  mlssNormalRangeMin: Joi.number().min(0).default(2000),
  mlssNormalRangeMax: Joi.number().min(0).default(4000),
  backwash: Joi.string().valid('ON', 'OFF').default('OFF'),
  backwashWaterFlow: Joi.number().min(0).default(0),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateSTPSchema = Joi.object({
  mlss: Joi.number().min(0).messages({
    'number.base': 'MLSS must be a number',
    'number.min': 'MLSS must be positive'
  }),
  mlssNormalRangeMin: Joi.number().min(0),
  mlssNormalRangeMax: Joi.number().min(0),
  backwash: Joi.string().valid('ON', 'OFF'),
  backwashWaterFlow: Joi.number().min(0),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// WTP Validations
export const createWTPSchema = Joi.object({
  inputHardness: Joi.number().min(0).required().messages({
    'number.base': 'Input hardness must be a number',
    'number.min': 'Input hardness must be positive',
    'any.required': 'Input hardness is required'
  }),
  outputHardness: Joi.number().min(0).required().messages({
    'number.base': 'Output hardness must be a number',
    'number.min': 'Output hardness must be positive',
    'any.required': 'Output hardness is required'
  }),
  regeneration: Joi.string().valid('ON', 'OFF').default('OFF'),
  regenWaterFlow: Joi.number().min(0).default(0),
  tds: Joi.number().min(0).required().messages({
    'number.base': 'TDS must be a number',
    'number.min': 'TDS must be positive',
    'any.required': 'TDS is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateWTPSchema = Joi.object({
  inputHardness: Joi.number().min(0).messages({
    'number.base': 'Input hardness must be a number',
    'number.min': 'Input hardness must be positive'
  }),
  outputHardness: Joi.number().min(0).messages({
    'number.base': 'Output hardness must be a number',
    'number.min': 'Output hardness must be positive'
  }),
  regeneration: Joi.string().valid('ON', 'OFF'),
  regenWaterFlow: Joi.number().min(0),
  tds: Joi.number().min(0).messages({
    'number.base': 'TDS must be a number',
    'number.min': 'TDS must be positive'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// Swimming Pool Validations
export const createSwimmingPoolSchema = Joi.object({
  phLevel: Joi.number().min(0).max(14).required().messages({
    'number.base': 'pH level must be a number',
    'number.min': 'pH level must be positive',
    'number.max': 'pH level must be between 0-14',
    'any.required': 'pH level is required'
  }),
  phNormalRangeMin: Joi.number().min(0).max(14).default(7.2),
  phNormalRangeMax: Joi.number().min(0).max(14).default(7.6),
  chlorine: Joi.number().min(0).required().messages({
    'number.base': 'Chlorine level must be a number',
    'number.min': 'Chlorine level must be positive',
    'any.required': 'Chlorine level is required'
  }),
  chlorineNormalRangeMin: Joi.number().min(0).default(1.0),
  chlorineNormalRangeMax: Joi.number().min(0).default(3.0),
  backwash: Joi.string().valid('ON', 'OFF').default('OFF'),
  backwashFlow: Joi.number().min(0).default(0),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateSwimmingPoolSchema = Joi.object({
  phLevel: Joi.number().min(0).max(14).messages({
    'number.base': 'pH level must be a number',
    'number.min': 'pH level must be positive',
    'number.max': 'pH level must be between 0-14'
  }),
  phNormalRangeMin: Joi.number().min(0).max(14),
  phNormalRangeMax: Joi.number().min(0).max(14),
  chlorine: Joi.number().min(0).messages({
    'number.base': 'Chlorine level must be a number',
    'number.min': 'Chlorine level must be positive'
  }),
  chlorineNormalRangeMin: Joi.number().min(0),
  chlorineNormalRangeMax: Joi.number().min(0),
  backwash: Joi.string().valid('ON', 'OFF'),
  backwashFlow: Joi.number().min(0),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// RO Plant Validations
export const createROPlantSchema = Joi.object({
  inputTDS: Joi.number().min(0).required().messages({
    'number.base': 'Input TDS must be a number',
    'number.min': 'Input TDS must be positive',
    'any.required': 'Input TDS is required'
  }),
  outputTDS: Joi.number().min(0).required().messages({
    'number.base': 'Output TDS must be a number',
    'number.min': 'Output TDS must be positive',
    'any.required': 'Output TDS is required'
  }),
  regeneration: Joi.string().valid('ON', 'OFF').default('OFF'),
  regenWaterFlow: Joi.number().min(0).default(0),
  usagePointHardness: Joi.number().min(0).required().messages({
    'number.base': 'Usage point hardness must be a number',
    'number.min': 'Usage point hardness must be positive',
    'any.required': 'Usage point hardness is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updateROPlantSchema = Joi.object({
  inputTDS: Joi.number().min(0).messages({
    'number.base': 'Input TDS must be a number',
    'number.min': 'Input TDS must be positive'
  }),
  outputTDS: Joi.number().min(0).messages({
    'number.base': 'Output TDS must be a number',
    'number.min': 'Output TDS must be positive'
  }),
  regeneration: Joi.string().valid('ON', 'OFF'),
  regenWaterFlow: Joi.number().min(0),
  usagePointHardness: Joi.number().min(0).messages({
    'number.base': 'Usage point hardness must be a number',
    'number.min': 'Usage point hardness must be positive'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

// Validation Middleware Functions
export const validateCreateSTP = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createSTPSchema.validate(req.body);
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

export const validateUpdateSTP = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateSTPSchema.validate(req.body);
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

export const validateCreateWTP = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createWTPSchema.validate(req.body);
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

export const validateUpdateWTP = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateWTPSchema.validate(req.body);
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

export const validateCreateSwimmingPool = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createSwimmingPoolSchema.validate(req.body);
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

export const validateUpdateSwimmingPool = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateSwimmingPoolSchema.validate(req.body);
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

export const validateCreateROPlant = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createROPlantSchema.validate(req.body);
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

export const validateUpdateROPlant = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateROPlantSchema.validate(req.body);
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