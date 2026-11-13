import formbody from '@fastify/formbody';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { webhookRoutes } from './routes/webhooks.js';

export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  app.register(formbody);
  app.register(webhookRoutes);

  return app;
}
