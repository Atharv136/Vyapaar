import { buildApp } from './app.js';
import { getConfig } from './config.js';

const config = getConfig();
const isProduction = process.env.NODE_ENV === 'production';

const app = buildApp({
  logger: isProduction
    ? { level: process.env.LOG_LEVEL ?? 'info' }
    : {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      },
});

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info(
    { port: config.port, publicBaseUrl: config.publicBaseUrl },
    'Vyapaar API listening',
  );
} catch (error) {
  app.log.error(error, 'Failed to start API');
  process.exit(1);
}
