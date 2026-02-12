import { AuthorizationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      logger.warn('Authorization failed', { userId: req.user.userId, required: roles, actual: userRole });
      return next(new AuthorizationError(`Requires one of these roles: ${roles.join(', ')}`));
    }

    next();
  };
};

export const onlyAdmin = requireRole(['admin']);
export const onlyModerator = requireRole(['moderator']);
export const onlyUser = requireRole(['user']);
