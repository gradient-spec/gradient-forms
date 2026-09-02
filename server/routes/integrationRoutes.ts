import { Router } from 'express';
import { getGoogleSheetsInfo, syncGoogleSheets } from '../controllers/integrationsController';

export const integrationRoutes = Router();

integrationRoutes.get('/forms/:id/integrations/google-sheets', getGoogleSheetsInfo);
integrationRoutes.post('/forms/:id/integrations/google-sheets/sync', syncGoogleSheets);
