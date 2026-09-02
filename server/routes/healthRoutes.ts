import { Router } from 'express';
import { getSystemHealth, getDatabaseHealth } from '../controllers/healthController';

export const healthRoutes = Router();

healthRoutes.get('/health', getSystemHealth);
healthRoutes.get('/health/db', getDatabaseHealth);
