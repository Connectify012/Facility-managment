import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const createPowerManagementSchema = Joi.object({
  meterId: Joi.string().required().trim().uppercase().messages({
    'string.empty': 'Meter ID is required',
    'any.required': 'Meter ID is required'
  }),
  location: Joi.string().required().trim().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required'
  }),
  connectedLoad: Joi.number().min(0).required().messages({
    'number.base': 'Connected load must be a number',
    'number.min': 'Connected load must be positive',
    'any.required': 'Connected load is required'
  }),
  units: Joi.number().min(0).required().messages({
    'number.base': 'Units must be a number',
    'number.min': 'Units must be positive',
    'any.required': 'Units are required'
  }),
  powerFactor: Joi.number().min(0).max(1).required().messages({
    'number.base': 'Power factor must be a number',
    'number.min': 'Power factor must be between 0 and 1',
    'number.max': 'Power factor must be between 0 and 1',
    'any.required': 'Power factor is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  facilityId: Joi.string().required().messages({
    'string.empty': 'Facility ID is required',
    'any.required': 'Facility ID is required'
  })
});

export const updatePowerManagementSchema = Joi.object({
  meterId: Joi.string().trim().uppercase().messages({
    'string.empty': 'Meter ID cannot be empty'
  }),
  location: Joi.string().trim().messages({
    'string.empty': 'Location cannot be empty'
  }),
  connectedLoad: Joi.number().min(0).messages({
    'number.base': 'Connected load must be a number',
    'number.min': 'Connected load must be positive'
  }),
  units: Joi.number().min(0).messages({
    'number.base': 'Units must be a number',
    'number.min': 'Units must be positive'
  }),
  powerFactor: Joi.number().min(0).max(1).messages({
    'number.base': 'Power factor must be a number',
    'number.min': 'Power factor must be between 0 and 1',
    'number.max': 'Power factor must be between 0 and 1'
  }),
  status: Joi.string().valid('active', 'inactive'),
  facilityId: Joi.string().messages({
    'string.empty': 'Facility ID cannot be empty'
  })
});

export const validateCreatePowerManagement = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createPowerManagementSchema.validate(req.body);
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

export const validateUpdatePowerManagement = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updatePowerManagementSchema.validate(req.body);
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