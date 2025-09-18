import Joi from 'joi';
import { ContractStatus, ServiceCategory } from '../models/ServiceProvider';

// Base validation schemas
const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId format');
const phoneSchema = Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).message('Please provide a valid phone number');
const emailSchema = Joi.string().email().lowercase().trim();

// Create service provider validation schema
export const createServiceProviderSchema = Joi.object({
  body: Joi.object({
    facilityId: objectIdSchema.required(),
    providerName: Joi.string().trim().min(2).max(100).required(),
    category: Joi.string().valid(...Object.values(ServiceCategory)).required(),
    contactPerson: Joi.string().trim().min(2).max(100).required(),
    phone: phoneSchema.required(),
    email: emailSchema.required(),
    contractStatus: Joi.string().valid(...Object.values(ContractStatus)).required(),
    contractStartDate: Joi.date().iso().optional(),
    contractEndDate: Joi.date().iso().min(Joi.ref('contractStartDate')).optional(),
    services: Joi.array().items(Joi.string().trim().min(1).max(100)).optional(),
    description: Joi.string().trim().max(500).optional().allow(''),
    address: Joi.string().trim().max(200).optional().allow(''),
    rating: Joi.number().min(0).max(5).optional(),
    createdBy: objectIdSchema.required()
  }).required(),
  params: Joi.object({
    facilityId: objectIdSchema.required()
  }).required()
});

// Update service provider validation schema
export const updateServiceProviderSchema = Joi.object({
  body: Joi.object({
    providerName: Joi.string().trim().min(2).max(100).optional(),
    category: Joi.string().valid(...Object.values(ServiceCategory)).optional(),
    contactPerson: Joi.string().trim().min(2).max(100).optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    contractStatus: Joi.string().valid(...Object.values(ContractStatus)).optional(),
    contractStartDate: Joi.date().iso().optional().allow(null),
    contractEndDate: Joi.date().iso().when('contractStartDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('contractStartDate')),
      otherwise: Joi.date()
    }).optional().allow(null),
    services: Joi.array().items(Joi.string().trim().min(1).max(100)).optional(),
    description: Joi.string().trim().max(500).optional().allow(''),
    address: Joi.string().trim().max(200).optional().allow(''),
    rating: Joi.number().min(0).max(5).optional(),
    totalContracts: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
    updatedBy: objectIdSchema.required()
  }).required(),
  params: Joi.object({
    id: objectIdSchema.required()
  }).required()
});

// Delete service provider validation schema
export const deleteServiceProviderSchema = Joi.object({
  body: Joi.object({
    updatedBy: objectIdSchema.required()
  }).required(),
  params: Joi.object({
    id: objectIdSchema.required()
  }).required()
});

// Get all service providers validation schema
export const getAllServiceProvidersSchema = Joi.object({
  params: Joi.object({
    facilityId: objectIdSchema.required()
  }).required(),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().valid(...Object.values(ServiceCategory)).optional(),
    contractStatus: Joi.string().valid(...Object.values(ContractStatus)).optional(),
    isActive: Joi.string().valid('true', 'false').optional(),
    search: Joi.string().trim().min(1).max(100).optional(),
    sortBy: Joi.string().valid(
      'providerName', 'category', 'contactPerson', 'contractStatus', 
      'rating', 'createdAt', 'updatedAt'
    ).default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }).optional()
});

// Get service provider by ID validation schema
export const getServiceProviderByIdSchema = Joi.object({
  params: Joi.object({
    id: objectIdSchema.required()
  }).required()
});

// Get service providers by category validation schema
export const getServiceProvidersByCategorySchema = Joi.object({
  params: Joi.object({
    facilityId: objectIdSchema.required(),
    category: Joi.string().valid(...Object.values(ServiceCategory)).required()
  }).required()
});

// Get active service providers validation schema
export const getActiveServiceProvidersSchema = Joi.object({
  params: Joi.object({
    facilityId: objectIdSchema.required()
  }).required()
});

// Search service providers validation schema
export const searchServiceProvidersSchema = Joi.object({
  params: Joi.object({
    facilityId: objectIdSchema.required()
  }).required(),
  query: Joi.object({
    q: Joi.string().trim().min(1).max(100).required(),
    category: Joi.string().valid(...Object.values(ServiceCategory)).optional(),
    contractStatus: Joi.string().valid(...Object.values(ContractStatus)).optional(),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }).required()
});

// Get service provider statistics validation schema
export const getServiceProviderStatisticsSchema = Joi.object({
  params: Joi.object({
    facilityId: objectIdSchema.required()
  }).required()
});

// Bulk update service providers validation schema
export const bulkUpdateServiceProvidersSchema = Joi.object({
  body: Joi.object({
    providers: Joi.array().items(
      Joi.object({
        providerId: objectIdSchema.required(),
        providerName: Joi.string().trim().min(2).max(100).optional(),
        category: Joi.string().valid(...Object.values(ServiceCategory)).optional(),
        contactPerson: Joi.string().trim().min(2).max(100).optional(),
        phone: phoneSchema.optional(),
        email: emailSchema.optional(),
        contractStatus: Joi.string().valid(...Object.values(ContractStatus)).optional(),
        contractStartDate: Joi.date().iso().optional().allow(null),
        contractEndDate: Joi.date().iso().optional().allow(null),
        services: Joi.array().items(Joi.string().trim().min(1).max(100)).optional(),
        description: Joi.string().trim().max(500).optional().allow(''),
        address: Joi.string().trim().max(200).optional().allow(''),
        rating: Joi.number().min(0).max(5).optional(),
        isActive: Joi.boolean().optional()
      })
    ).min(1).required(),
    updatedBy: objectIdSchema.required()
  }).required(),
  params: Joi.object({
    facilityId: objectIdSchema.required()
  }).required()
});

// Validation schemas for specific operations
export const serviceProviderValidationSchemas = {
  create: createServiceProviderSchema,
  update: updateServiceProviderSchema,
  delete: deleteServiceProviderSchema,
  getAll: getAllServiceProvidersSchema,
  getById: getServiceProviderByIdSchema,
  getByCategory: getServiceProvidersByCategorySchema,
  getActive: getActiveServiceProvidersSchema,
  search: searchServiceProvidersSchema,
  getStatistics: getServiceProviderStatisticsSchema,
  bulkUpdate: bulkUpdateServiceProvidersSchema
};

// Helper validation functions
export const validateServiceCategory = (category: string): boolean => {
  return Object.values(ServiceCategory).includes(category as ServiceCategory);
};

export const validateContractStatus = (status: string): boolean => {
  return Object.values(ContractStatus).includes(status as ContractStatus);
};

export const validateContractDates = (startDate?: Date | string, endDate?: Date | string): boolean => {
  if (!startDate || !endDate) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start < end;
};

export const validateProviderRating = (rating?: number): boolean => {
  if (rating === undefined) return true;
  return rating >= 0 && rating <= 5;
};

// Schema for query parameters validation
export const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid(
    'providerName', 'category', 'contactPerson', 'contractStatus', 
    'rating', 'createdAt', 'updatedAt'
  ).default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().trim().min(1).max(100).optional(),
  category: Joi.string().valid(...Object.values(ServiceCategory)).optional(),
  contractStatus: Joi.string().valid(...Object.values(ContractStatus)).optional(),
  isActive: Joi.string().valid('true', 'false').optional()
});

// Schema for facility ID parameter validation
export const facilityIdParamSchema = Joi.object({
  facilityId: objectIdSchema.required()
});

// Schema for provider ID parameter validation
export const providerIdParamSchema = Joi.object({
  id: objectIdSchema.required()
});

export default {
  createServiceProviderSchema,
  updateServiceProviderSchema,
  deleteServiceProviderSchema,
  getAllServiceProvidersSchema,
  getServiceProviderByIdSchema,
  getServiceProvidersByCategorySchema,
  getActiveServiceProvidersSchema,
  searchServiceProvidersSchema,
  getServiceProviderStatisticsSchema,
  bulkUpdateServiceProvidersSchema,
  serviceProviderValidationSchemas,
  validateServiceCategory,
  validateContractStatus,
  validateContractDates,
  validateProviderRating,
  queryParamsSchema,
  facilityIdParamSchema,
  providerIdParamSchema
};