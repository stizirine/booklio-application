import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { MessageChannels, TemplatePurposes } from './enums.js';

const messageTemplateSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    channel: {
      type: String,
      required: true,
      enum: Object.values(MessageChannels),
      default: MessageChannels.WhatsApp,
    },
    locale: { type: String, required: true, default: 'fr' },
    // Identifiant du template côté provider (Meta/Twilio)
    providerTemplateId: { type: String, required: false },
    purpose: {
      type: String,
      required: true,
      enum: Object.values(TemplatePurposes),
      default: TemplatePurposes.Reminder48h,
      index: true,
    },
    // Placeholders attendus dans le template: ex: ['firstName','date','time','bookingLink']
    placeholders: { type: [String], required: false, default: [] },
    // Optionnel: prévisualisation/texte local pour mock
    previewText: { type: String, required: false },
  },
  { timestamps: true }
);

messageTemplateSchema.index({ tenantId: 1, name: 1, locale: 1 }, { unique: true });

export type MessageTemplate = InferSchemaType<typeof messageTemplateSchema> & { _id: string };
export const MessageTemplateModel: Model<MessageTemplate> =
  (mongoose.models.MessageTemplate as Model<MessageTemplate>) ||
  mongoose.model<MessageTemplate>('MessageTemplate', messageTemplateSchema);
