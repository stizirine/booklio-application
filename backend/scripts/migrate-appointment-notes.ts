#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';

config();

async function migrateAppointmentNotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connecté à MongoDB');

    // Compter les rendez-vous avec notes en string
    const count = await AppointmentModel.countDocuments({
      notes: { $type: 'string' },
    });

    console.log(`📊 ${count} rendez-vous avec notes en string trouvés`);

    if (count === 0) {
      console.log('✅ Aucune migration nécessaire');
      return;
    }

    // Migration: convertir les notes string vers objet { reason, comment }
    const result = await AppointmentModel.updateMany({ notes: { $type: 'string' } }, [
      {
        $set: {
          notes: {
            $cond: {
              if: { $ne: ['$notes', null] },
              then: {
                reason: null,
                comment: '$notes',
              },
              else: null,
            },
          },
        },
      },
    ]);

    console.log(`✅ Migration terminée: ${result.modifiedCount} rendez-vous mis à jour`);
    console.log('📝 Les anciennes notes sont maintenant dans notes.comment');
    console.log('📝 notes.reason est null (à remplir manuellement si nécessaire)');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

migrateAppointmentNotes();
