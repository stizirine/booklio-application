#!/usr/bin/env tsx
/**
 * Initialise la base (crée collections + indexes) en important les modèles
 * et en appelant syncIndexes().
 *
 * Usage:
 *   MONGO_URI="mongodb://..." ./backend/scripts/init-db.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel } from '../src/modules/crm/invoices/model.js';
import { EyeMeasurementSet } from '../src/modules/optician/model.js';
import { OpticalPrescription } from '../src/modules/optician/prescriptions.model.js';
import { TenantModel } from '../src/modules/tenants/model.js';
import { User } from '../src/modules/users/model.js';

const models = [
  User,
  TenantModel,
  ClientModel,
  AppointmentModel,
  InvoiceModel,
  EyeMeasurementSet,
  OpticalPrescription,
];

async function main() {
  const uri =
    process.env.MONGO_URI ||
    'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';

  await mongoose.connect(uri);
  console.log('✅ Connecté à MongoDB');

  for (const m of models) {
    console.log(`→ syncIndexes(${m.modelName})`);
    await m.syncIndexes();
  }

  await mongoose.disconnect();
  console.log('✅ Indexes synchronisés et déconnexion effectuée.');
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

