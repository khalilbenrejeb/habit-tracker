import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase, testConnection } from './config/database.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { loggingMiddleware, errorLoggingMiddleware } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(errorLoggingMiddleware);

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test Supabase connection
    await testConnection();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        env: process.env.NODE_ENV,
        port: PORT
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();

export default app;
