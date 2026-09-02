import { Router } from 'express';
import { exportCsv } from '../controllers/exportController';

export const exportRoutes = Router();

// Live CSV feed for Google Sheets =IMPORTDATA()
export const exportCsvRoute = exportRoutes.get('/forms/:id/export.csv', exportCsv);
