import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { formsStore } from '../db/inMemoryStore';

export const getSystemHealth = (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Gradient Forms REST API Server',
    formsCount: formsStore.length
  });
};

export const getDatabaseHealth = async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as db_health`;
    res.json({
      status: 'healthy',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString(),
      ping: 'OK',
      result
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'PostgreSQL',
      error: error?.message || 'Database connection error'
    });
  }
};
