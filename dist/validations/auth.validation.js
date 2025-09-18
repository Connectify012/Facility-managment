"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenParamSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Login validation schema
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .optional()
        .messages({
        'string.email': 'Please provide a valid email address',
    }),
    username: joi_1.default.string()
        .alphanum()
        .min(3)
        .max(50)
        .optional()
        .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot be more than 50 characters long',
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty',
    }),
    rememberMe: joi_1.default.boolean()
        .optional()
        .default(false)
}).xor('email', 'username')
    .messages({
    'object.xor': 'Either email or username is required',
});
// Refresh token validation schema
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Refresh token is required',
        'string.empty': 'Refresh token cannot be empty',
    })
});
// Change password validation schema
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Current password is required',
        'string.empty': 'Current password cannot be empty',
    }),
    newPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
        'any.required': 'New password is required',
        'string.empty': 'New password cannot be empty',
        'string.min': 'New password must be at least 8 characters long',
        'string.max': 'New password cannot be more than 128 characters long',
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    }),
    logoutAllDevices: joi_1.default.boolean()
        .optional()
        .default(false)
});
// Forgot password validation schema
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .required()
        .messages({
        'any.required': 'Email is required',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please provide a valid email address',
    })
});
// Reset password validation schema
exports.resetPasswordSchema = joi_1.default.object({
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot be more than 128 characters long',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    })
});
// Token parameter validation schema
exports.tokenParamSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Token is required',
        'string.empty': 'Token cannot be empty',
    })
});
