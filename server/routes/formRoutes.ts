import { Router } from 'express';
import { listForms, createForm, getFormById, updateForm } from '../controllers/formsController';
import { validateRequest, createFormSchema } from '../middleware/validationMiddleware';

export const formRoutes = Router();

formRoutes.get('/forms', listForms);
formRoutes.post('/forms', validateRequest(createFormSchema), createForm);
formRoutes.get('/forms/:id', getFormById);
formRoutes.patch('/forms/:id', updateForm);
