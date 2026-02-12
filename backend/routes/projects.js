import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate, validateQuery } from '../validators/validate.js';
import { createProjectSchema, updateProjectSchema, paginationSchema } from '../validators/schemas.js';
import { handleAsyncError } from '../utils/generics.js';

const router = express.Router();

router.use(authMiddleware);

// Get all projects for user
router.get('/', validateQuery(paginationSchema), handleAsyncError(projectController.getProjects));

// Create project
router.post('/', validate(createProjectSchema), handleAsyncError(projectController.createProject));

// Get project by ID
router.get('/:id', handleAsyncError(projectController.getProjectById));

// Update project
router.put('/:id', validate(updateProjectSchema), handleAsyncError(projectController.updateProject));

// Delete project
router.delete('/:id', handleAsyncError(projectController.deleteProject));

export default router;
