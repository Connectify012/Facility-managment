"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArrayLength = exports.validateRange = exports.validateDate = exports.validateSort = exports.sanitizeString = exports.validateUrl = exports.validatePassword = exports.validatePagination = exports.validatePhoneNumber = exports.validateEmail = exports.validateName = exports.validateObjectId = void 0;
const mongoose_1 = require("mongoose");
/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param id - The ID to validate
 * @returns boolean
 */
const validateObjectId = (id) => {
    return mongoose_1.Types.ObjectId.isValid(id);
};
exports.validateObjectId = validateObjectId;
/**
 * Validate name fields (firstName, lastName, etc.)
 * @param name - The name to validate
 * @returns boolean
 */
const validateName = (name) => {
    if (!name || typeof name !== 'string')
        return false;
    const trimmedName = name.trim();
    // Check if name is between 2 and 50 characters
    if (trimmedName.length < 2 || trimmedName.length > 50)
        return false;
    // Check if name contains only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(trimmedName);
};
exports.validateName = validateName;
/**
 * Validate email format
 * @param email - The email to validate
 * @returns boolean
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string')
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
};
exports.validateEmail = validateEmail;
/**
 * Validate phone number format
 * @param phoneNumber - The phone number to validate
 * @returns boolean
 */
const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber || typeof phoneNumber !== 'string')
        return false;
    // Allow various phone number formats
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phoneNumber.trim());
};
exports.validatePhoneNumber = validatePhoneNumber;
/**
 * Validate and sanitize pagination parameters
 * @param pageParam - Page parameter from query
 * @param limitParam - Limit parameter from query
 * @returns Object with validated page and limit
 */
const validatePagination = (pageParam, limitParam) => {
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '10', 10) || 10));
    return { page, limit };
};
exports.validatePagination = validatePagination;
/**
 * Validate password strength
 * @param password - The password to validate
 * @returns Object with isValid boolean and messages array
 */
const validatePassword = (password) => {
    const messages = [];
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
exports.validatePassword = validatePassword;
/**
 * Validate URL format
 * @param url - The URL to validate
 * @returns boolean
 */
const validateUrl = (url) => {
    if (!url || typeof url !== 'string')
        return false;
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.validateUrl = validateUrl;
/**
 * Sanitize string input by trimming and removing extra spaces
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
const sanitizeString = (input) => {
    if (!input || typeof input !== 'string')
        return '';
    return input.trim().replace(/\s+/g, ' ');
};
exports.sanitizeString = sanitizeString;
/**
 * Validate and parse sort parameters
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order (asc/desc)
 * @param allowedFields - Array of allowed sort fields
 * @returns Object with validated sort parameters
 */
const validateSort = (sortBy, sortOrder, allowedFields = ['createdAt', 'updatedAt']) => {
    const validSortBy = sortBy && allowedFields.includes(sortBy) ? sortBy : allowedFields[0];
    const validSortOrder = sortOrder && ['asc', 'desc'].includes(sortOrder.toLowerCase())
        ? sortOrder.toLowerCase()
        : 'desc';
    return {
        sortBy: validSortBy,
        sortOrder: validSortOrder
    };
};
exports.validateSort = validateSort;
/**
 * Validate date string format
 * @param dateString - The date string to validate
 * @returns boolean
 */
const validateDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string')
        return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};
exports.validateDate = validateDate;
/**
 * Validate if a value is within a numeric range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns boolean
 */
const validateRange = (value, min, max) => {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
};
exports.validateRange = validateRange;
/**
 * Validate array length
 * @param array - The array to validate
 * @param minLength - Minimum length (default: 0)
 * @param maxLength - Maximum length (default: Infinity)
 * @returns boolean
 */
const validateArrayLength = (array, minLength = 0, maxLength = Infinity) => {
    return Array.isArray(array) && array.length >= minLength && array.length <= maxLength;
};
exports.validateArrayLength = validateArrayLength;
