import twilio from 'twilio';
import { getConfig } from '../config.js';

export type InboundType = 'text' | 'audio' | 'image' | 'button' | 'unknown';

export type InboundMessage = {
  messageSid: string;
  from: string;
  type: InboundType;
  text: string;
  buttonPayload?: string;
  mediaUrl?: string;
  mediaType?: string;
  numMedia: number;
};

export type Button = {
  id: string;
  title: string;
  contentSid?: string;
};

type TwilioClient = ReturnType<typeof twilio>;

let cachedClient: TwilioClient | null = null;

function getClient(): TwilioClient {
  if (cachedClient) return cachedClient;
  const config = getConfig();
  cachedClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
  return cachedClient;
}

export function resetTwilioClientForTests(): void {
  cachedClient = null;
}

export function normalizeWaId(value: string): string {
  return (value ?? '').replace(/^whatsapp:/i, '').replace(/[^\d]/g, '');
}

function toWhatsAppAddress(to: string): string {
  if (/^whatsapp:/i.test(to)) return to;
  const digits = normalizeWaId(to);
  return `whatsapp:+${digits}`;
}

export function maskPhone(value: string): string {
  const digits = normalizeWaId(value);
  if (!digits) return '***';
  if (digits.length <= 4) return `***${digits}`;
  return `***${digits.slice(-4)}`;
}

export function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signatureHeader: string | undefined,
): boolean {
  if (!signatureHeader) return false;
  try {
    const { twilioAuthToken } = getConfig();
    return twilio.validateRequest(twilioAuthToken, signatureHeader, url, params);
  } catch {
    return false;
  }
}

export function parseInbound(form: Record<string, string | undefined>): InboundMessage {
  const from = normalizeWaId(form.From ?? '');
  const body = (form.Body ?? '').trim();
  const buttonPayload = form.ButtonPayload || undefined;
  const buttonText = form.ButtonText || undefined;
  const mediaUrl = form.MediaUrl0 || undefined;
  const mediaType = form.MediaContentType0 || undefined;
  const numMedia = Number.parseInt(form.NumMedia ?? '0', 10) || 0;

  let type: InboundType = 'unknown';
  if (buttonPayload || buttonText) {
    type = 'button';
  } else if (numMedia > 0 && mediaType?.startsWith('audio/')) {
    type = 'audio';
  } else if (numMedia > 0 && mediaType?.startsWith('image/')) {
    type = 'image';
  } else if (body) {
    type = 'text';
  }

  return {
    messageSid: form.MessageSid ?? '',
    from,
    type,
    text: body || buttonText || '',
    buttonPayload,
    mediaUrl,
    mediaType,
    numMedia,
  };
}

export async function sendText(to: string, body: string): Promise<{ sid: string; status: string }> {
  const config = getConfig();
  const message = await getClient().messages.create({
    from: config.twilioWhatsappFrom,
    to: toWhatsAppAddress(to),
    body,
  });
  return { sid: message.sid, status: message.status };
}

export function buildButtonsFallback(body: string, buttons: Button[]): string {
  if (buttons.length === 0) return body;
  const labels = buttons.map((button) => button.title).join(' / ');
  const replies = buttons.map((button) => button.id).join(' or ');
  return `${body}\n\n${labels}\n\nReply ${replies}.`;
}

export async function sendButtons(
  to: string,
  body: string,
  buttons: Button[],
): Promise<{ sid: string; status: string }> {
  const contentButton = buttons.find((button) => button.contentSid);

  if (contentButton) {
    try {
      const config = getConfig();
      const contentVariables = Object.fromEntries(
        buttons.map((button, index) => [String(index + 1), button.title]),
      );
      const message = await getClient().messages.create({
        from: config.twilioWhatsappFrom,
        to: toWhatsAppAddress(to),
        contentSid: contentButton.contentSid,
        contentVariables: JSON.stringify(contentVariables),
      });
      return { sid: message.sid, status: message.status };
    } catch {
      // Content templates must be pre-approved; fall through to plain text.
    }
  }

  return sendText(to, buildButtonsFallback(body, buttons));
}

export async function downloadMedia(
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const config = getConfig();
  const auth = Buffer.from(
    `${config.twilioAccountSid}:${config.twilioAuthToken}`,
  ).toString('base64');

  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Media download failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}
