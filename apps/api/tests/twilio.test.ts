import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  buildButtonsFallback,
  maskPhone,
  normalizeWaId,
  parseInbound,
  verifyTwilioSignature,
} from '../src/channel/twilio.js';
import { getConfig } from '../src/config.js';

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

describe('verifyTwilioSignature', () => {
  const url = 'https://test.example.com/webhooks/twilio/whatsapp';
  const params = {
    From: 'whatsapp:+919876543210',
    Body: 'hi',
    MessageSid: 'SM123',
  };

  it('accepts a valid signature', () => {
    const signature = expectedSignature(getConfig().twilioAuthToken, url, params);
    expect(verifyTwilioSignature(url, params, signature)).toBe(true);
  });

  it('rejects an invalid signature', () => {
    expect(verifyTwilioSignature(url, params, 'bogus-signature')).toBe(false);
  });

  it('rejects a missing signature', () => {
    expect(verifyTwilioSignature(url, params, undefined)).toBe(false);
  });

  it('rejects a signature computed for a different URL', () => {
    const signature = expectedSignature(
      getConfig().twilioAuthToken,
      'https://evil.example.com/webhooks/twilio/whatsapp',
      params,
    );
    expect(verifyTwilioSignature(url, params, signature)).toBe(false);
  });
});

describe('parseInbound', () => {
  it('parses a text message', () => {
    const inbound = parseInbound({
      MessageSid: 'SM123',
      From: 'whatsapp:+919876543210',
      Body: '  hi there  ',
      NumMedia: '0',
    });

    expect(inbound).toMatchObject({
      messageSid: 'SM123',
      from: '919876543210',
      type: 'text',
      text: 'hi there',
      numMedia: 0,
    });
  });

  it('parses a button reply', () => {
    const inbound = parseInbound({
      MessageSid: 'SM456',
      From: 'whatsapp:+919876543210',
      Body: '',
      ButtonPayload: 'YES',
      ButtonText: 'Yes, confirm',
      NumMedia: '0',
    });

    expect(inbound.type).toBe('button');
    expect(inbound.buttonPayload).toBe('YES');
    expect(inbound.text).toBe('Yes, confirm');
  });

  it('parses an audio message', () => {
    const inbound = parseInbound({
      MessageSid: 'SM789',
      From: 'whatsapp:+919876543210',
      NumMedia: '1',
      MediaUrl0: 'https://api.twilio.com/media/123',
      MediaContentType0: 'audio/ogg',
    });

    expect(inbound.type).toBe('audio');
    expect(inbound.mediaUrl).toBe('https://api.twilio.com/media/123');
    expect(inbound.mediaType).toBe('audio/ogg');
  });

  it('parses an image message', () => {
    const inbound = parseInbound({
      MessageSid: 'SM999',
      From: 'whatsapp:+919876543210',
      NumMedia: '1',
      MediaUrl0: 'https://api.twilio.com/media/456',
      MediaContentType0: 'image/jpeg',
    });

    expect(inbound.type).toBe('image');
  });

  it('returns unknown for an empty message', () => {
    const inbound = parseInbound({ MessageSid: 'SM000', From: 'whatsapp:+919876543210' });
    expect(inbound.type).toBe('unknown');
  });
});

describe('maskPhone', () => {
  it('shows only the last four digits', () => {
    expect(maskPhone('whatsapp:+919876543210')).toBe('***3210');
    expect(maskPhone('+14155238886')).toBe('***8886');
  });

  it('handles short and empty values', () => {
    expect(maskPhone('123')).toBe('***123');
    expect(maskPhone('')).toBe('***');
  });
});

describe('normalizeWaId', () => {
  it('strips the whatsapp prefix and non-digits', () => {
    expect(normalizeWaId('whatsapp:+91 98765 43210')).toBe('919876543210');
  });
});

describe('buildButtonsFallback', () => {
  it('lists button titles and reply ids', () => {
    const text = buildButtonsFallback('Confirm your order?', [
      { id: 'YES', title: 'Yes' },
      { id: 'NO', title: 'No' },
    ]);

    expect(text).toContain('Confirm your order?');
    expect(text).toContain('Yes / No');
    expect(text).toContain('Reply YES or NO.');
  });
});
