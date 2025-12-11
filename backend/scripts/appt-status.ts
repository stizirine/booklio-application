#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';
import { z } from 'zod';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import {
  AppointmentStatusValues,
  AppointmentStatuses,
} from '../src/modules/crm/appointments/status.js';

config();

const StatusSchema = z.enum([...AppointmentStatusValues]);

async function updateAppointmentStatus(appointmentId: string, tenantId: string, status: string) {
  try {
    const parsed = StatusSchema.safeParse(status);
    if (!parsed.success) {
      console.error(
        '❌ Statut invalide. Utiliser:',
        Object.values(AppointmentStatuses).join(' | ')
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connecté à MongoDB');

    const updated = await AppointmentModel.findOneAndUpdate(
      { _id: appointmentId, tenantId, deletedAt: null },
      { status: parsed.data },
      { new: true }
    );

    if (!updated) {
      console.log('❌ Rendez-vous non trouvé (ou supprimé)');
    } else {
      console.log('✅ Statut mis à jour:', {
        id: updated.id,
        status: updated.status,
      });
    }

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (err) {
    console.error('❌ Erreur:', (err as any)?.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [appointmentId, status, tenantId = 't1'] = process.argv.slice(2);
  if (!appointmentId || !status) {
    console.log('Usage: tsx scripts/appt-status.ts <appointmentId> <status> [tenantId]');
    console.log(
      'Exemple: tsx scripts/appt-status.ts 507f1f77bcf86cd799439011',
      AppointmentStatuses.Done,
      't1'
    );
    process.exit(1);
  }
  updateAppointmentStatus(appointmentId, tenantId, status);
}

export { updateAppointmentStatus };
