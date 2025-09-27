import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Validation for employee deletion with exit details
export const deleteEmployeeSchema = Joi.object({
  exitDate: Joi.date().iso().max('now').required().messages({
    'date.base': 'Exit date must be a valid date',
    'date.max': 'Exit date cannot be in the future',
    'any.required': 'Exit date is required'
  }),
  exitReason: Joi.string().trim().min(5).max(500).required().messages({
    'string.base': 'Exit reason must be a string',
    'string.empty': 'Exit reason is required',
    'string.min': 'Exit reason must be at least 5 characters long',
    'string.max': 'Exit reason cannot exceed 500 characters',
    'any.required': 'Exit reason is required'
  })
});

// Validation middleware for employee deletion
export const validateDeleteEmployee = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = deleteEmployeeSchema.validate(req.body);
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

// Common exit reasons enum for reference
export const ExitReasons = {
  RESIGNATION: 'Resignation',
  TERMINATION: 'Termination',
  LAYOFF: 'Layoff',
  RETIREMENT: 'Retirement',
  CONTRACT_END: 'Contract End',
  PERFORMANCE_ISSUES: 'Performance Issues',
  MISCONDUCT: 'Misconduct',
  MEDICAL_REASONS: 'Medical Reasons',
  RELOCATION: 'Relocation',
  BETTER_OPPORTUNITY: 'Better Opportunity',
  PERSONAL_REASONS: 'Personal Reasons',
  COMPANY_RESTRUCTURING: 'Company Restructuring',
  OTHER: 'Other'
} as const;