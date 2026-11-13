import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(here, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_BASE_URL: z.string().url(),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_WHATSAPP_FROM: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_INTERNAL_TOKEN: z.string().optional(),
  MERCHANT_ALERT_WHATSAPP: z.string().optional(),
  DASHBOARD_USER: z.string().optional(),
  DASHBOARD_PASSWORD: z.string().optional(),
  SESSION_SECRET: z.string().min(1),
});

export type AppConfig = {
  port: number;
  publicBaseUrl: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappFrom: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  geminiApiKey: string;
  geminiModel: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret?: string;
  n8nWebhookUrl?: string;
  n8nInternalToken?: string;
  merchantAlertWhatsapp?: string;
  dashboardUser?: string;
  dashboardPassword?: string;
  sessionSecret: string;
};

function toAppConfig(env: z.infer<typeof envSchema>): AppConfig {
  return {
    port: env.PORT,
    publicBaseUrl: env.PUBLIC_BASE_URL,
    twilioAccountSid: env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: env.TWILIO_AUTH_TOKEN,
    twilioWhatsappFrom: env.TWILIO_WHATSAPP_FROM,
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL,
    razorpayKeyId: env.RAZORPAY_KEY_ID,
    razorpayKeySecret: env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
    n8nWebhookUrl: env.N8N_WEBHOOK_URL,
    n8nInternalToken: env.N8N_INTERNAL_TOKEN,
    merchantAlertWhatsapp: env.MERCHANT_ALERT_WHATSAPP,
    dashboardUser: env.DASHBOARD_USER,
    dashboardPassword: env.DASHBOARD_PASSWORD,
    sessionSecret: env.SESSION_SECRET,
  };
}

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    throw new Error(
      `Invalid or missing environment variables: ${names.join(', ')}. ` +
        'Fill them in .env (see .env.example).',
    );
  }

  cached = toAppConfig(parsed.data);
  return cached;
}

export function resetConfigForTests(): void {
  cached = null;
}
