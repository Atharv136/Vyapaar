import type { FastifyInstance } from 'fastify';
import {
  maskPhone,
  parseInbound,
  sendText,
  verifyTwilioSignature,
  type InboundMessage,
} from '../channel/twilio.js';
import { getConfig } from '../config.js';

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

async function handleInbound(inbound: InboundMessage): Promise<void> {
  switch (inbound.type) {
    case 'text':
    case 'button': {
      const text = inbound.text || inbound.buttonPayload || '';
      await sendText(inbound.from, `Got it: ${text}`);
      return;
    }
    case 'audio':
    case 'image': {
      await sendText(inbound.from, 'Got it. I received your media.');
      return;
    }
    default: {
      await sendText(inbound.from, 'Got it.');
    }
  }
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  app.post('/webhooks/twilio/whatsapp', async (request, reply) => {
    const config = getConfig();
    const params = (request.body ?? {}) as Record<string, string>;
    const header = request.headers['x-twilio-signature'];
    const signature = Array.isArray(header) ? header[0] : header;
    const url = `${config.publicBaseUrl.replace(/\/+$/, '')}${request.url}`;

    if (!verifyTwilioSignature(url, params, signature)) {
      request.log.warn(
        { from: maskPhone(params.From ?? '') },
        'Rejected inbound WhatsApp webhook: invalid signature',
      );
      return reply.code(401).send({ error: 'invalid signature' });
    }

    const inbound = parseInbound(params);
    request.log.info(
      {
        messageSid: inbound.messageSid,
        from: maskPhone(inbound.from),
        type: inbound.type,
      },
      'Inbound WhatsApp message',
    );

    reply.type('text/xml; charset=utf-8').send(EMPTY_TWIML);

    setImmediate(() => {
      handleInbound(inbound).catch((error) => {
        request.log.error(
          { err: error, from: maskPhone(inbound.from) },
          'Failed to process inbound WhatsApp message',
        );
      });
    });

    return reply;
  });
}
