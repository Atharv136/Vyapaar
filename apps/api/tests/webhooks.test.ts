import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/channel/twilio.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/channel/twilio.js')>();
  return {
    ...actual,
    sendText: vi.fn().mockResolvedValue({ sid: 'SM_OUT', status: 'queued' }),
  };
});

import { buildApp } from '../src/app.js';
import { sendText } from '../src/channel/twilio.js';
import { getConfig } from '../src/config.js';

const mockedSendText = vi.mocked(sendText);

function expectedSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): string {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);
  return crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf8')).digest('base64');
}

function formBody(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

describe('webhooks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET /health returns ok', async () => {
    const app = buildApp({ logger: false });
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
    await app.close();
  });

  it('rejects an unsigned webhook with 401', async () => {
    const app = buildApp({ logger: false });
    const response = await app.inject({
      method: 'POST',
      url: '/webhooks/twilio/whatsapp',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: formBody({ From: 'whatsapp:+919876543210', Body: 'hi', MessageSid: 'SM1' }),
    });

    expect(response.statusCode).toBe(401);
    expect(mockedSendText).not.toHaveBeenCalled();
    await app.close();
  });

  it('accepts a signed webhook, replies with empty TwiML and echoes the text', async () => {
    const config = getConfig();
    const params = {
      From: 'whatsapp:+919876543210',
      Body: 'hi',
      MessageSid: 'SM2',
      NumMedia: '0',
    };
    const url = `${config.publicBaseUrl}/webhooks/twilio/whatsapp`;
    const signature = expectedSignature(config.twilioAuthToken, url, params);

    const app = buildApp({ logger: false });
    const response = await app.inject({
      method: 'POST',
      url: '/webhooks/twilio/whatsapp',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-twilio-signature': signature,
      },
      payload: formBody(params),
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/xml');
    expect(response.body).toContain('<Response/>');

    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(mockedSendText).toHaveBeenCalledWith('919876543210', 'Got it: hi');
    await app.close();
  });
});
