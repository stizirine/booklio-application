import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  tenantId: string;
  email: string;
  passwordHash: string;
  roles: string[];
  // Informations personnelles
  firstName?: string; // Prénom
  lastName?: string; // Nom de famille
  phone?: string; // Numéro de téléphone personnel
  // Informations du magasin/entreprise
  storeName?: string; // Nom du magasin ou raison sociale
  storeAddress?: string; // Adresse du magasin
  phoneNumber?: string; // Numéro de téléphone du magasin (fixe)
  storePhone?: string; // Autre téléphone du magasin (WhatsApp, mobile, etc.)
  patenteNumber?: string; // Numéro de patente
  rcNumber?: string; // Registre de commerce (RC)
  npeNumber?: string; // NPE
  iceNumber?: string; // ICE
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['user'] },
    // Informations personnelles
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    phone: { type: String, required: false, trim: true },
    // Informations du magasin/entreprise
    storeName: { type: String, required: false, trim: true },
    storeAddress: { type: String, required: false, trim: true },
    phoneNumber: { type: String, required: false, trim: true },
    storePhone: { type: String, required: false, trim: true },
    patenteNumber: { type: String, required: false, trim: true },
    rcNumber: { type: String, required: false, trim: true },
    npeNumber: { type: String, required: false, trim: true },
    iceNumber: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
