import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../validators/validate.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { handleAsyncError } from '../utils/generics.js';

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), handleAsyncError(authController.login));
router.post('/register', validate(registerSchema), handleAsyncError(authController.register));

// Protected routes
router.get('/validate', authMiddleware, handleAsyncError(authController.validate));

export default router;
