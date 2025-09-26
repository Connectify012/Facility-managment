import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Validation schema for creating floor location
const createFloorLocationSchema = Joi.object({
  floorName: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Floor name is required',
      'string.min': 'Floor name must be at least 1 character long',
      'string.max': 'Floor name cannot exceed 100 characters',
      'any.required': 'Floor name is required'
    }),
  
  floorNumber: Joi.number()
    .integer()
    .min(0)
    .max(999)
    .required()
    .messages({
      'number.base': 'Floor number must be a number',
      'number.integer': 'Floor number must be an integer',
      'number.min': 'Floor number must be at least 0',
      'number.max': 'Floor number cannot exceed 999',
      'any.required': 'Floor number is required'
    }),
  
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Validation schema for updating floor location
const updateFloorLocationSchema = Joi.object({
  floorName: Joi.string()
    .optional()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Floor name cannot be empty',
      'string.min': 'Floor name must be at least 1 character long',
      'string.max': 'Floor name cannot exceed 100 characters'
    }),
  
  floorNumber: Joi.number()
    .integer()
    .min(0)
    .max(999)
    .optional()
    .messages({
      'number.base': 'Floor number must be a number',
      'number.integer': 'Floor number must be an integer',
      'number.min': 'Floor number must be at least 0',
      'number.max': 'Floor number cannot exceed 999'
    }),
  
  description: Joi.string()
    .optional()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean value'
    })
});

// Middleware function for validating floor location creation
export const validateFloorLocation = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createFloorLocationSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
    return;
  }
  
  next();
};

// Middleware function for validating floor location updates
export const validateFloorLocationUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateFloorLocationSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
    return;
  }
  
  next();
};