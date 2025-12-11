#!/usr/bin/env tsx
import { enqueueReminder } from '@agent/queue/remindersQueue.js';
import mongoose from 'mongoose';

import { AppointmentModel } from '@crm/appointments/model.js';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
const TENANT_ID = process.env.TENANT_ID as string;

if (!TENANT_ID) {
  console.error('TENANT_ID manquant');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const appt = await AppointmentModel.findOne({ tenantId: TENANT_ID, deletedAt: null })
      .sort({ startAt: -1 })
      .exec();
    if (!appt) {
      console.error('Aucun rendez-vous trouvé');
      process.exit(1);
    }
    await enqueueReminder({ tenantId: TENANT_ID, appointmentId: String(appt._id) });
    console.log('✅ Enqueued reminder for appointment', String(appt._id));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
