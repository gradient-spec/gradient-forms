import { Router } from 'express';
import { healthRoutes } from './healthRoutes';
import { formRoutes } from './formRoutes';
import { responseRoutes } from './responseRoutes';
import { exportRoutes } from './exportRoutes';
import { integrationRoutes } from './integrationRoutes';

export const apiRouter = Router();

// Mount API v1 sub-routers
apiRouter.use(healthRoutes);
apiRouter.use(formRoutes);
apiRouter.use(responseRoutes);
apiRouter.use(exportRoutes);
apiRouter.use(integrationRoutes);
