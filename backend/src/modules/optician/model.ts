import mongoose, { Schema, type Model } from 'mongoose';

export interface EyeValues {
  sphere?: number | null;
  cylinder?: number | null;
  axis?: number | null; // 0-180
  add?: number | null;
}

export interface EyeMeasurementSetDoc {
  tenantId: string;
  clientId: string;
  measuredAt: Date;
  receivedAt?: Date | null;
  source?: MeasurementSource;
  nextRenewalAt?: Date | null;
  notes?: string | null;
  observation?: string | null;
  ep?: number | null; // Eye distance
  od: EyeValues; // Oeil droit
  og: EyeValues; // Oeil gauche
  createdAt: Date;
  updatedAt: Date;
}

export enum MeasurementSource {
  Manual = 'manual',
  OCR = 'ocr',
}

const eyeValues = new Schema<EyeValues>(
  {
    sphere: { type: Number, required: false, default: null, min: -20, max: 20 },
    cylinder: { type: Number, required: false, default: null, min: -20, max: 20 },
    axis: { type: Number, required: false, default: null, min: 0, max: 180 },
    add: { type: Number, required: false, default: null, min: -10, max: 10 },
  },
  { _id: false }
);

const schema = new Schema<EyeMeasurementSetDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    measuredAt: { type: Date, required: true },
    receivedAt: { type: Date, required: false, default: null },
    source: { type: String, enum: Object.values(MeasurementSource), required: false },
    nextRenewalAt: { type: Date, required: false, default: null },
    notes: { type: String, required: false, default: null },
    observation: { type: String, required: false, default: null },
    ep: { type: Number, required: false, default: null, min: 40, max: 80 },
    od: { type: eyeValues, required: true },
    og: { type: eyeValues, required: true },
  },
  { timestamps: true }
);

export const EyeMeasurementSet: Model<EyeMeasurementSetDoc> =
  (mongoose.models.EyeMeasurementSet as Model<EyeMeasurementSetDoc>) ||
  mongoose.model<EyeMeasurementSetDoc>('EyeMeasurementSet', schema);
