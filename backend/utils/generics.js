import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const formatResponse = (success, data = null, message = null) => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
});

export const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};
