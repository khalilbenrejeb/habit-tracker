import { logger } from '../utils/logger.js';

export const loggingMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous'
    });
  });

  next();
};

export const errorLoggingMiddleware = (err, req, res, next) => {
  const errorData = {
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    userId: req.user?.userId || 'anonymous'
  };

  if (process.env.NODE_ENV === 'development') {
    errorData.stack = err.stack;
  }

  logger.error('Request error', errorData);
  next(err);
};
