import mongoose, { Schema, type Model } from 'mongoose';

import { Capability, FeatureFlag } from './types.js';

export enum ClientType {
  Generic = 'generic',
  Optician = 'optician',
}

export interface TenantDoc {
  tenantId: string;
  clientType: ClientType;
  capabilities: Capability[];
  featureFlags: Record<FeatureFlag, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<TenantDoc>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    clientType: {
      type: String,
      enum: Object.values(ClientType),
      required: true,
      default: ClientType.Generic,
    },
    capabilities: { type: [String], enum: Object.values(Capability), required: true, default: [] },
    featureFlags: { type: Schema.Types.Mixed, required: false, default: {} },
  },
  { timestamps: true }
);

export const TenantModel: Model<TenantDoc> =
  (mongoose.models.Tenant as Model<TenantDoc>) || mongoose.model<TenantDoc>('Tenant', tenantSchema);
