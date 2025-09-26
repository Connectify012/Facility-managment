import Joi from 'joi';

// Validation schema for creating a daily checklist
export const createDailyChecklistValidation = Joi.object({
  hygieneSectionId: Joi.string().required().messages({
    'string.empty': 'Hygiene section ID is required',
    'any.required': 'Hygiene section ID is required'
  }),
  floorLocationId: Joi.string().required().messages({
    'string.empty': 'Floor location ID is required',
    'any.required': 'Floor location ID is required'
  }),
  checklistDate: Joi.date().required().messages({
    'date.base': 'Checklist date must be a valid date',
    'any.required': 'Checklist date is required'
  }),
  checklistItems: Joi.array().items(
    Joi.object({
      itemName: Joi.string().required().messages({
        'string.empty': 'Item name is required',
        'any.required': 'Item name is required'
      }),
      description: Joi.string().optional().allow('', null)
    })
  ).min(1).required().messages({
    'array.min': 'At least one checklist item is required',
    'any.required': 'Checklist items are required'
  }),
  assignedDepartment: Joi.string().valid('HOUSEKEEPING', 'GARDENING', 'PEST_CONTROL').required().messages({
    'any.only': 'Assigned department must be one of: HOUSEKEEPING, GARDENING, PEST_CONTROL',
    'any.required': 'Assigned department is required'
  })
});

// Validation schema for completing a checklist item
export const completeChecklistItemValidation = Joi.object({
  notes: Joi.string().optional().allow('', null).max(500).messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});

// Validation schema for getting daily checklists with filters
export const getDailyChecklistsValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  checklistDate: Joi.date().optional(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').optional(),
  assignedDepartment: Joi.string().valid('HOUSEKEEPING', 'GARDENING', 'PEST_CONTROL').optional(),
  floorLocationId: Joi.string().optional(),
  hygieneSectionId: Joi.string().optional()
});

// Validation schema for checklist statistics
export const getChecklistStatsValidation = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('startDate')).messages({
      'date.min': 'End date must be after start date'
    })
  })
});

// Validation schema for QR code parameter
export const qrCodeValidation = Joi.object({
  qrCode: Joi.string().required().messages({
    'string.empty': 'QR code is required',
    'any.required': 'QR code is required'
  }),
  checklistDate: Joi.date().optional()
});