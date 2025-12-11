import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { AppointmentStatusValues, AppointmentStatuses } from './status.js';

export interface AppointmentNotes {
  reason?: string;
  comment?: string;
}

const appointmentSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    title: { type: String, required: false },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: [...AppointmentStatusValues],
      default: AppointmentStatuses.Scheduled,
      index: true,
    },
    // Marqueur idempotent pour le rappel 48h
    reminder48hSentAt: { type: Date, required: false, index: true, default: null },
    notes: {
      type: new Schema<AppointmentNotes>(
        {
          reason: { type: String, required: false },
          comment: { type: String, required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    deletedAt: { type: Date, required: false, index: true, default: null },
  },
  { timestamps: true }
);

export type Appointment = InferSchemaType<typeof appointmentSchema> & {
  _id: string;
};
export const AppointmentModel: Model<Appointment> =
  (mongoose.models.Appointment as Model<Appointment>) ||
  mongoose.model<Appointment>('Appointment', appointmentSchema);
