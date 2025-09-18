import Joi from 'joi';

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .optional()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be more than 50 characters long',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty',
    }),
  rememberMe: Joi.boolean()
    .optional()
    .default(false)
}).xor('email', 'username')
  .messages({
    'object.xor': 'Either email or username is required',
  });

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
      'string.empty': 'Refresh token cannot be empty',
    })
});

// Change password validation schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
      'string.empty': 'Current password cannot be empty',
    }),
  newPassword: Joi.string()
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
  logoutAllDevices: Joi.boolean()
    .optional()
    .default(false)
});

// Forgot password validation schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
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
export const resetPasswordSchema = Joi.object({
  password: Joi.string()
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
export const tokenParamSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token is required',
      'string.empty': 'Token cannot be empty',
    })
});