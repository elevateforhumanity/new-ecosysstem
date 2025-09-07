/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import express from 'express';
import { loadEnv } from '../../src/env.js';
import { logger } from '../../src/logger.js';
import { getDatabaseStatus } from '../services/database.js';

const router = express.Router();

// Aggregated health check endpoint
router.get('/', async (req: express.Request, res: express.Response) => {
  const correlationId = req.headers['x-request-id'] as string;
  const startTime = Date.now();

  try {
    const env = loadEnv();
    
    // Check application health
    const appHealth = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    };

    // Check database health
    const dbHealth = await getDatabaseStatus();

    // Check environment validation
    const envHealth = {
      status: 'valid',
      nodeEnv: env.NODE_ENV,
      hasJwtSecret: !!env.JWT_SECRET,
      hasDatabase: !!env.DATABASE_URL,
      hasStripe: !!env.STRIPE_SECRET_KEY,
      hasSupabase: !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    };

    // Overall health determination
    const isHealthy = appHealth.status === 'healthy' && 
                     (dbHealth.status === 'connected' || dbHealth.status === 'disabled') &&
                     envHealth.status === 'valid';

    const responseTime = Date.now() - startTime;

    const healthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      correlationId,
      responseTime,
      checks: {
        app: appHealth,
        database: dbHealth,
        environment: envHealth,
      },
    };

    res.status(isHealthy ? 200 : 503).json(healthResponse);

  } catch (error: any) {
    logger.error({
      err: error,
      correlationId,
    }, 'Health check failed');

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      correlationId,
      error: error.message,
      responseTime: Date.now() - startTime,
    });
  }
});

// Legacy health endpoint (for backward compatibility)
router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
  });
});

export default router;