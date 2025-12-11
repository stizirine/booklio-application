import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { MessageChannels, MessageStatuses, ProviderTypes } from './enums.js';

const messageLogSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: Object.values(MessageChannels),
      default: MessageChannels.WhatsApp,
      index: true,
    },
    templateName: { type: String, required: true },
    locale: { type: String, required: false },
    content: { type: String, required: true },
    variables: { type: Schema.Types.Mixed, required: false },
    status: {
      type: String,
      enum: Object.values(MessageStatuses),
      required: true,
      index: true,
      default: MessageStatuses.Queued,
    },
    error: { type: String, required: false },
    retries: { type: Number, required: true, default: 0 },
    provider: {
      type: String,
      required: true,
      enum: Object.values(ProviderTypes),
      default: ProviderTypes.Mock,
    },
    providerMessageId: { type: String, required: false, index: true },
    idempotencyKey: { type: String, required: true, index: true },
    sentAt: { type: Date, required: false, index: true },
    deliveredAt: { type: Date, required: false, index: true },
    readAt: { type: Date, required: false, index: true },
  },
  { timestamps: true }
);

messageLogSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true });

export type MessageLog = InferSchemaType<typeof messageLogSchema> & { _id: string };
export const MessageLogModel: Model<MessageLog> =
  (mongoose.models.MessageLog as Model<MessageLog>) ||
  mongoose.model<MessageLog>('MessageLog', messageLogSchema);
