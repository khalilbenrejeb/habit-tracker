import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { onlyAdmin } from '../middleware/authorize.js';
import { validate, validateQuery } from '../validators/validate.js';
import { createUserSchema, updateUserSchema, paginationSchema } from '../validators/schemas.js';
import { handleAsyncError } from '../utils/generics.js';

const router = express.Router();

router.use(authMiddleware);

// Get all users (admin only)
router.get('/', onlyAdmin, validateQuery(paginationSchema), handleAsyncError(userController.getUsers));

// Create user (admin only)
router.post('/', onlyAdmin, validate(createUserSchema), handleAsyncError(userController.createUser));

// Get user by ID
router.get('/:id', handleAsyncError(userController.getUserById));

// Update user (admin only)
router.put('/:id', onlyAdmin, validate(updateUserSchema), handleAsyncError(userController.updateUser));

// Delete user (admin only)
router.delete('/:id', onlyAdmin, handleAsyncError(userController.deleteUser));

export default router;
