import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const clientSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: false, trim: true },
    email: {
      type: String,
      required: false,
      index: true,
      trim: true,
      lowercase: true,
    },
    address: { type: String, required: false, trim: true },
    deletedAt: { type: Date, required: false, index: true, default: null },
  },
  { timestamps: true }
);

// Unicité par locataire si fourni
clientSchema.index(
  { tenantId: 1, email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $type: 'string' } },
  }
);
clientSchema.index(
  { tenantId: 1, phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: 'string' } },
  }
);

export type Client = InferSchemaType<typeof clientSchema> & { _id: string };
export const ClientModel: Model<Client> =
  (mongoose.models.Client as Model<Client>) || mongoose.model<Client>('Client', clientSchema);
