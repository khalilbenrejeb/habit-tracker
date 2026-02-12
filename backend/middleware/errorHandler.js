import { logger } from '../utils/logger.js';
import { formatResponse } from '../utils/generics.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error('Error handler', { statusCode, message, path: req.path });

  res.status(statusCode).json(
    formatResponse(false, null, message)
  );
};

export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json(
    formatResponse(false, null, 'Route not found')
  );
};
