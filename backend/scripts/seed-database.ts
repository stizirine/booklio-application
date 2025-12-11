import bcrypt from 'bcrypt';
import 'dotenv/config.js';
import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import { AppointmentStatuses } from '../src/modules/crm/appointments/status.js';
import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel } from '../src/modules/crm/invoices/model.js';
import { InvoiceStatuses } from '../src/modules/crm/invoices/status.js';
import { User } from '../src/modules/users/model.js';

const TENANT_ID = 't1';
const MONGO_URI = process.env.MONGO_URI as string;

// Données de test
const testClients = [
  {
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@example.com',
    phone: '+33612345678',
    address: '12 Rue de la Paix, 75002 Paris',
  },
  {
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@example.com',
    phone: '+33623456789',
    address: '45 Avenue des Champs-Élysées, 75008 Paris',
  },
  {
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@example.com',
    phone: '+33634567890',
    address: '7 Boulevard Saint-Germain, 75005 Paris',
  },
  {
    firstName: 'Pierre',
    lastName: 'Dubois',
    email: 'pierre.dubois@example.com',
    phone: '+33645678901',
    address: '23 Rue du Faubourg Saint-Honoré, 75001 Paris',
  },
  {
    firstName: 'Claire',
    lastName: 'Lefevre',
    email: 'claire.lefevre@example.com',
    phone: '+33656789012',
    address: '89 Rue de Rivoli, 75004 Paris',
  },
];

async function seedDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Créer un utilisateur de test
    console.log("👤 Création de l'utilisateur de test...");
    const existingUser = await User.findOne({ email: 'test@booklio.com' });

    if (existingUser) {
      console.log('   ℹ️  Utilisateur test@booklio.com existe déjà');
    } else {
      const passwordHash = await bcrypt.hash('password123', 12);
      await User.create({
        tenantId: TENANT_ID,
        email: 'test@booklio.com',
        passwordHash,
        roles: ['admin', 'user'],
      });
      console.log('   ✅ Utilisateur créé : test@booklio.com (password: password123)');
    }

    // 2. Créer des clients
    console.log('\n👥 Création des clients...');
    const clientIds: string[] = [];

    for (const clientData of testClients) {
      const existing = await ClientModel.findOne({
        tenantId: TENANT_ID,
        email: clientData.email,
      });

      if (existing) {
        console.log(`   ℹ️  Client ${clientData.firstName} ${clientData.lastName} existe déjà`);
        clientIds.push(existing._id.toString());
      } else {
        const client = await ClientModel.create({
          tenantId: TENANT_ID,
          ...clientData,
        });
        clientIds.push(client._id.toString());
        console.log(`   ✅ Client créé : ${clientData.firstName} ${clientData.lastName}`);
      }
    }

    // 3. Créer des rendez-vous
    console.log('\n📅 Création des rendez-vous...');
    const now = new Date();
    const appointments = [
      // Rendez-vous passés
      {
        clientId: clientIds[0],
        title: 'Consultation initiale',
        startAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        endAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: AppointmentStatuses.Done,
        notes: {
          reason: 'Première consultation',
          comment: 'Client très satisfait',
        },
      },
      {
        clientId: clientIds[1],
        title: 'Suivi mensuel',
        startAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        endAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: AppointmentStatuses.Done,
        notes: {
          reason: 'Contrôle mensuel',
          comment: 'Bonne progression',
        },
      },
      {
        clientId: clientIds[2],
        title: 'Rendez-vous annulé',
        startAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        endAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: AppointmentStatuses.Canceled,
        notes: {
          reason: 'Empêchement',
          comment: 'Client malade, à reprogrammer',
        },
      },
      // Rendez-vous à venir
      {
        clientId: clientIds[0],
        title: 'Séance de suivi',
        startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: AppointmentStatuses.Scheduled,
        notes: {
          reason: 'Suivi régulier',
        },
      },
      {
        clientId: clientIds[3],
        title: 'Première consultation',
        startAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
        endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        status: AppointmentStatuses.Scheduled,
        notes: {
          reason: 'Nouveau client',
        },
      },
      {
        clientId: clientIds[4],
        title: 'Consultation express',
        startAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        status: AppointmentStatuses.Scheduled,
        notes: {
          reason: 'Consultation rapide',
        },
      },
      {
        clientId: clientIds[1],
        title: 'Bilan trimestriel',
        startAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
        endAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
        status: AppointmentStatuses.Scheduled,
        notes: {
          reason: 'Bilan complet',
        },
      },
    ];

    let appointmentCount = 0;
    for (const apptData of appointments) {
      const existing = await AppointmentModel.findOne({
        tenantId: TENANT_ID,
        clientId: apptData.clientId,
        startAt: apptData.startAt,
      });

      if (!existing) {
        await AppointmentModel.create({
          tenantId: TENANT_ID,
          ...apptData,
        });
        appointmentCount++;
        console.log(`   ✅ Rendez-vous créé : ${apptData.title} (${apptData.status})`);
      } else {
        console.log(`   ℹ️  Rendez-vous ${apptData.title} existe déjà`);
      }
    }

    // 4. Créer des factures
    console.log('\n💰 Création des factures...');
    const invoices = [
      // Facture payée
      {
        clientId: clientIds[0],
        totalAmount: 150,
        advanceAmount: 150,
        creditAmount: 0,
        currency: 'EUR',
        status: InvoiceStatuses.Paid,
        notes: {
          reason: 'Consultation initiale',
          comment: 'Payé en espèces',
        },
      },
      // Facture partiellement payée
      {
        clientId: clientIds[1],
        totalAmount: 200,
        advanceAmount: 100,
        creditAmount: 0,
        currency: 'EUR',
        status: InvoiceStatuses.Partial,
        notes: {
          reason: 'Forfait 3 séances',
          comment: 'Acompte versé',
        },
      },
      // Facture en attente
      {
        clientId: clientIds[2],
        totalAmount: 180,
        advanceAmount: 0,
        creditAmount: 0,
        currency: 'EUR',
        status: InvoiceStatuses.Draft,
        notes: {
          reason: 'Nouvelle facture',
          comment: 'En attente de paiement',
        },
      },
      // Facture payée avec crédit
      {
        clientId: clientIds[3],
        totalAmount: 250,
        advanceAmount: 200,
        creditAmount: 50,
        currency: 'EUR',
        status: InvoiceStatuses.Paid,
        notes: {
          reason: 'Bilan complet',
          comment: 'Avoir appliqué',
        },
      },
      // Facture draft
      {
        clientId: clientIds[4],
        totalAmount: 120,
        advanceAmount: 0,
        creditAmount: 0,
        currency: 'EUR',
        status: InvoiceStatuses.Draft,
        notes: {
          reason: 'Consultation express',
          comment: 'À finaliser',
        },
      },
    ];

    let invoiceCount = 0;
    for (const invData of invoices) {
      const existing = await InvoiceModel.findOne({
        tenantId: TENANT_ID,
        clientId: invData.clientId,
        totalAmount: invData.totalAmount,
      });

      if (!existing) {
        await InvoiceModel.create({
          tenantId: TENANT_ID,
          ...invData,
        });
        invoiceCount++;
        console.log(`   ✅ Facture créée : ${invData.totalAmount}€ (${invData.status})`);
      } else {
        console.log(`   ℹ️  Facture de ${invData.totalAmount}€ existe déjà`);
      }
    }

    // Résumé
    console.log('\n📊 Résumé du peuplement :');
    console.log(`   👤 Utilisateurs : 1`);
    console.log(`   👥 Clients : ${clientIds.length}`);
    console.log(`   📅 Rendez-vous : ${appointmentCount} créés`);
    console.log(`   💰 Factures : ${invoiceCount} créées`);

    console.log('\n✨ Base de données peuplée avec succès !');
    console.log('\n🔐 Identifiants de connexion :');
    console.log('   Email    : test@booklio.com');
    console.log('   Password : password123');
  } catch (error) {
    console.error('❌ Erreur lors du peuplement :', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Exécution
seedDatabase();
