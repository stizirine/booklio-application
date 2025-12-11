import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { ProviderTypes } from './enums.js';

const agentPolicySchema = new Schema(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, required: true, default: false },
    // Heures silencieuses locales (par tenant) ex: { start: '21:00', end: '08:00' }
    quietHours: {
      type: new Schema(
        {
          start: { type: String, required: false },
          end: { type: String, required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    daysBeforeReminder: { type: Number, required: true, default: 2 },
    reengageAfterDays: { type: Number, required: true, default: 30 },
    locale: { type: String, required: true, default: 'fr' },
    fallbackLocale: { type: String, required: true, default: 'fr' },
    timezone: { type: String, required: false },
    model: { type: String, required: false, default: 'gpt-4o-mini' },
    tone: { type: String, required: false, default: 'friendly' },
    provider: {
      type: String,
      required: true,
      enum: Object.values(ProviderTypes),
      default: ProviderTypes.Mock,
      index: true,
    },
  },
  { timestamps: true }
);

export type AgentPolicy = InferSchemaType<typeof agentPolicySchema> & { _id: string };
export const AgentPolicyModel: Model<AgentPolicy> =
  (mongoose.models.AgentPolicy as Model<AgentPolicy>) ||
  mongoose.model<AgentPolicy>('AgentPolicy', agentPolicySchema);
