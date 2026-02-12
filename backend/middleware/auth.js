import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    logger.debug('User authenticated', { userId: decoded.userId });
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });
    next(new AuthenticationError(error.message));
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      logger.debug('User authenticated', { userId: decoded.userId });
    }
    next();
  } catch (error) {
    // Optional auth, so we don't fail
    next();
  }
};
