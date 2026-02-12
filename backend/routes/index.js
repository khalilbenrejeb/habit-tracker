import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import projectRoutes from './projects.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
