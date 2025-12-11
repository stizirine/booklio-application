import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGoogleToken extends Document {
  userId: string;
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  scope?: string;
  tokenType?: string;
  expiryDate?: number; // epoch ms
  createdAt: Date;
  updatedAt: Date;
}

const GoogleTokenSchema = new Schema<IGoogleToken>(
  {
    userId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    scope: { type: String },
    tokenType: { type: String },
    expiryDate: { type: Number },
  },
  { timestamps: true }
);

export const GoogleToken: Model<IGoogleToken> = mongoose.model<IGoogleToken>(
  'GoogleToken',
  GoogleTokenSchema
);
