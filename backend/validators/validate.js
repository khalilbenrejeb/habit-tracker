import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validated = validated;
      next();
    } catch (error) {
      logger.warn('Validation error', { error: error.errors });
      next(new ValidationError(error.errors[0].message));
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated;
      next();
    } catch (error) {
      logger.warn('Query validation error', { error: error.errors });
      next(new ValidationError(error.errors[0].message));
    }
  };
};
