const Joi = require('joi');

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a Joi schema
 * 
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
}

/**
 * Common validation schemas
 */
const schemas = {
  // Authentication schemas
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    role: Joi.string().valid('student', 'instructor', 'admin').default('student')
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Course schemas
  createCourse: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(5000).required(),
    category: Joi.string().required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    duration: Joi.number().positive().required(),
    modules: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string(),
      order: Joi.number().integer().positive()
    })).default([])
  }),

  // Email schemas
  sendEmail: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().min(1).max(200).required(),
    body: Joi.string().min(1).max(10000).required(),
    cc: Joi.array().items(Joi.string().email()).default([]),
    bcc: Joi.array().items(Joi.string().email()).default([])
  }),

  // Calendar schemas
  createEvent: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(5000).allow(''),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
    location: Joi.string().max(500).allow(''),
    attendees: Joi.array().items(Joi.string().email()).default([])
  }),

  // AI Tutor schemas
  chatMessage: Joi.object({
    message: Joi.string().min(1).max(5000).required(),
    conversationId: Joi.string().allow(null)
  }),

  gradeEssay: Joi.object({
    essay: Joi.string().min(50).max(50000).required(),
    rubric: Joi.object().allow(null)
  })
};

module.exports = {
  validate,
  schemas
};
