import { app } from './app';

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ [GRADIENT FORMS API SERVER] Running on http://localhost:${PORT}`);
  });
}

export default app;
