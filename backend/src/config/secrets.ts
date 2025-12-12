import { z } from 'zod';

const SecretsSchema = z.object({
  // On accepte aussi staging/recette pour les environnements intermédiaires
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production', 'recette', 'rec']).optional(),
  PORT: z.string().regex(/^\d+$/).transform(Number).optional(),

  // Requis pour démarrer l'API
  MONGO_URI: z
    .string()
    .min(1)
    .refine((v) => v.startsWith('mongodb'), {
      message: 'MONGO_URI doit commencer par mongodb',
    }),

  // Optionnels (avec défauts raisonnables)
  REDIS_URL: z
    .string()
    .default('redis://localhost:6379')
    .refine((v) => v.startsWith('redis'), { message: 'REDIS_URL doit commencer par redis' }),

  // Placeholders pour providers externes (non bloquants tant qu'on reste sur mock)
  WHATSAPP_META_TOKEN: z.string().optional(),
  WHATSAPP_TWILIO_SID: z.string().optional(),
  WHATSAPP_TWILIO_TOKEN: z.string().optional(),

  // Auth
  JWT_SECRET: z.string().optional(),

  // API Key Header (par environnement)
  REQUIRED_HEADER_NAME: z.string().default('x-api-key'),
  REQUIRED_HEADER_VALUE: z.string().optional(),
  REQUIRED_HEADER_VALUE_DEV: z.string().optional(),
  REQUIRED_HEADER_VALUE_STAGING: z.string().optional(),
  REQUIRED_HEADER_VALUE_PROD: z.string().optional(),
});

export type Secrets = z.infer<typeof SecretsSchema>;

let cached: Secrets | undefined;

export function getSecrets(): Secrets {
  if (cached) return cached;
  const parsed = SecretsSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Secrets invalides: ${details}`);
  }
  cached = parsed.data;
  return cached;
}
