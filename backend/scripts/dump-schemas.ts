#!/usr/bin/env tsx
/**
 * Dump lisible des schémas Mongoose (champs + index) pour les modèles principaux.
 * Usage:
 *   MONGO_URI="mongodb://..." ./backend/scripts/dump-schemas.ts
 *
 * Les modèles sont importés explicitement ci-dessous.
 */
import mongoose, { type Model } from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel } from '../src/modules/crm/invoices/model.js';
import { EyeMeasurementSet } from '../src/modules/optician/model.js';
import { OpticalPrescription } from '../src/modules/optician/prescriptions.model.js';
import { TenantModel } from '../src/modules/tenants/model.js';
import { User } from '../src/modules/users/model.js';

type AnyModel = Model<any>;

const models: Array<{ name: string; model: AnyModel }> = [
  { name: 'User', model: User },
  { name: 'Tenant', model: TenantModel },
  { name: 'Client', model: ClientModel },
  { name: 'Appointment', model: AppointmentModel },
  { name: 'Invoice', model: InvoiceModel },
  { name: 'EyeMeasurementSet', model: EyeMeasurementSet },
  { name: 'OpticalPrescription', model: OpticalPrescription },
];

function dumpModel(model: AnyModel, name: string) {
  const schema = model.schema;
  console.log(`\n=== ${name} ===`);

  console.log('Champs:');
  schema.eachPath((path, schemaType) => {
    const opts = schemaType.options || {};
    const type = (schemaType as any).instance || (opts.type && opts.type.name) || 'Mixed';
    const required = opts.required ? '✅' : '❌';
    const def = opts.default === undefined ? '' : ` (default: ${JSON.stringify(opts.default)})`;
    console.log(` - ${path} : ${type} | required: ${required}${def}`);
  });

  const indexes = schema.indexes();
  if (indexes.length) {
    console.log('Indexes:');
    indexes.forEach(([fields, options]) => {
      console.log(` - ${JSON.stringify(fields)} ${JSON.stringify(options || {})}`);
    });
  } else {
    console.log('Indexes: aucun');
  }
}

async function main() {
  const uri =
    process.env.MONGO_URI ||
    'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';

  await mongoose.connect(uri);
  console.log('✅ Connecté à MongoDB\n');

  models.forEach(({ name, model }) => dumpModel(model, name));

  await mongoose.disconnect();
  console.log('\n✅ Déconnexion terminée.');
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

