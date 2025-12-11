#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';

config();

async function migrate() {
  const uri = process.env.MONGO_URI as string;
  if (!uri) {
    console.error('MONGO_URI manquant');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connecté à MongoDB');

  const filter: any = { status: 'inProgress' };
  const count = await AppointmentModel.countDocuments(filter);
  console.log('Documents à migrer:', count);
  if (count > 0) {
    const res = await AppointmentModel.updateMany(filter, {
      $set: { status: 'in_progress' },
    });
    console.log('Modifiés:', res.modifiedCount);
  }

  await mongoose.disconnect();
  console.log('Déconnecté de MongoDB');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch((e) => {
    console.error('Erreur migration:', e?.message || e);
    process.exit(1);
  });
}

export {};
