import { Types } from 'mongoose';

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param id - The ID to validate
 * @returns boolean
 */
export const validateObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

/**
 * Validate name fields (firstName, lastName, etc.)
 * @param name - The name to validate
 * @returns boolean
 */
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  
  // Check if name is between 2 and 50 characters
  if (trimmedName.length < 2 || trimmedName.length > 50) return false;
  
  // Check if name contains only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(trimmedName);
};

/**
 * Validate email format
 * @param email - The email to validate
 * @returns boolean
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Validate phone number format
 * @param phoneNumber - The phone number to validate
 * @returns boolean
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  // Allow various phone number formats
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phoneNumber.trim());
};

/**
 * Validate and sanitize pagination parameters
 * @param pageParam - Page parameter from query
 * @param limitParam - Limit parameter from query
 * @returns Object with validated page and limit
 */
export const validatePagination = (pageParam?: string, limitParam?: string) => {
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitParam || '10', 10) || 10));
  
  return { page, limit };
};

/**
 * Validate password strength
 * @param password - The password to validate
 * @returns Object with isValid boolean and messages array
 */
export const validatePassword = (password: string): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, messages: ['Password is required'] };
  }
  
  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    messages.push('Password cannot exceed 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    messages.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    messages.push('Password must contain at least one special character');
  }
  
  return {
    isValid: messages.length === 0,
    messages
  };
};

/**
 * Validate URL format
 * @param url - The URL to validate
 * @returns boolean
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize string input by trimming and removing extra spaces
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate and parse sort parameters
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order (asc/desc)
 * @param allowedFields - Array of allowed sort fields
 * @returns Object with validated sort parameters
 */
export const validateSort = (
  sortBy?: string,
  sortOrder?: string,
  allowedFields: string[] = ['createdAt', 'updatedAt']
) => {
  const validSortBy = sortBy && allowedFields.includes(sortBy) ? sortBy : allowedFields[0];
  const validSortOrder = sortOrder && ['asc', 'desc'].includes(sortOrder.toLowerCase()) 
    ? sortOrder.toLowerCase() 
    : 'desc';
    
  return {
    sortBy: validSortBy,
    sortOrder: validSortOrder
  };
};

/**
 * Validate date string format
 * @param dateString - The date string to validate
 * @returns boolean
 */
export const validateDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate if a value is within a numeric range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns boolean
 */
export const validateRange = (value: number, min: number, max: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
};

/**
 * Validate array length
 * @param array - The array to validate
 * @param minLength - Minimum length (default: 0)
 * @param maxLength - Maximum length (default: Infinity)
 * @returns boolean
 */
export const validateArrayLength = (
  array: any[], 
  minLength: number = 0, 
  maxLength: number = Infinity
): boolean => {
  return Array.isArray(array) && array.length >= minLength && array.length <= maxLength;
};
