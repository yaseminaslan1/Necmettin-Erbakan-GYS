const Joi = require('joi');

/**
 * Common validation schemas
 */
const schemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // ID parameter
  id: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  // Email
  email: Joi.string().email().max(255),

  // Password
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
};

/**
 * Validate request data against schema
 */
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return { isValid: false, errors, value: null };
  }

  return { isValid: true, errors: null, value };
};

/**
 * Create validation middleware
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : 
                 source === 'query' ? req.query : 
                 source === 'params' ? req.params : req.body;

    const { isValid, errors, value } = validate(schema, data);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace with validated data
    if (source === 'body') req.body = value;
    else if (source === 'query') req.query = value;
    else if (source === 'params') req.params = value;

    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateRequest,
  Joi,
};
