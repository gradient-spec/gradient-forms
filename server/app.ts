import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  // Core Middleware
  app.use(cors());
  app.use(express.json());

  // Mount API v1 Routes
  app.use('/api/v1', apiRouter);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

export const app = createApp();
