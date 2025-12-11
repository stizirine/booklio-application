#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';

// Charger les variables d'environnement
config();

async function deleteAppointment(appointmentId: string, tenantId: string, hard = false) {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connecté à MongoDB');

    // Vérifier que le rendez-vous existe
    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      tenantId,
    });
    if (!appointment) {
      console.log('❌ Rendez-vous non trouvé');
      return;
    }

    console.log(
      `📅 Rendez-vous trouvé: ${appointment.title || 'Sans titre'} (${appointment.startAt})`
    );

    if (hard) {
      // Suppression physique
      console.log('🗑️  Suppression physique...');
      const result = await AppointmentModel.deleteOne({
        _id: appointmentId,
        tenantId,
      });
      console.log(`✅ Rendez-vous supprimé: ${result.deletedCount}`);
    } else {
      // Suppression logique (soft delete)
      console.log('🗑️  Suppression logique...');
      const result = await AppointmentModel.findOneAndUpdate(
        { _id: appointmentId, tenantId },
        { deletedAt: new Date() },
        { new: true }
      );
      console.log(`✅ Rendez-vous soft-deleted: ${result ? 'Oui' : 'Non'}`);
    }

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const appointmentId = args[0];
  const tenantId = args[1] || 't1';
  const hard = args[2] === '--hard';

  if (!appointmentId) {
    console.log('Usage: tsx scripts/delete-appointment.ts <appointmentId> [tenantId] [--hard]');
    console.log('Exemple: tsx scripts/delete-appointment.ts 507f1f77bcf86cd799439011 t1 --hard');
    process.exit(1);
  }

  deleteAppointment(appointmentId, tenantId, hard);
}

export { deleteAppointment };
