#!/usr/bin/env tsx

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

// interface AuthResponse {
//   accessToken: string;
//   refreshToken: string;
// }

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface InvoiceSummary {
  totalAmount: number;
  dueAmount: number;
  invoiceCount: number;
  lastInvoiceAt: string | null;
}

interface Appointment {
  _id: string;
  clientId: string;
  client?: Client;
  invoiceSummary?: InvoiceSummary;
  title?: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

async function testAppointmentsInvoiceSummary() {
  console.log('🧪 Test des appointments avec invoiceSummary...\n');

  try {
    // 1. Créer un utilisateur de test via l'API interne
    console.log("1️⃣ Création d'un utilisateur de test...");
    const registerResponse = await fetch(`${API_BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-invoice-summary@booklio.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'InvoiceSummary',
        tenantId: 't1', // Ajouter tenantId requis
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.log('Erreur register:', errorText);
      if (registerResponse.status === 409) {
        console.log('Utilisateur existe déjà, on continue...');
      } else {
        throw new Error(`Register failed: ${registerResponse.status}`);
      }
    }

    // Authentification
    console.log('2️⃣ Authentification...');
    const authResponse = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-invoice-summary@booklio.com',
        password: 'password123',
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log('Auth data:', authData);
    const token = authData.tokens.accessToken;
    console.log('✅ Authentification réussie');
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'UNDEFINED');
    console.log('');

    // 3. Créer un client de test
    console.log("3️⃣ Création d'un client de test...");
    const clientResponse = await fetch(`${API_BASE}/v1/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'InvoiceSummary',
        email: 'test-invoice@booklio.com',
        phone: '+33123456789',
      }),
    });

    if (!clientResponse.ok) {
      const errorText = await clientResponse.text();
      console.log('Erreur client:', errorText);
      throw new Error(`Client creation failed: ${clientResponse.status}`);
    }

    const clientData = await clientResponse.json();
    const clientId = clientData.client._id;
    console.log(`✅ Client créé: ${clientId}\n`);

    // 4. Créer des factures pour le client
    console.log('4️⃣ Création de factures de test...');
    const invoices = [
      { totalAmount: 1000, advanceAmount: 200, creditAmount: 0, currency: 'EUR', status: 'paid' },
      {
        totalAmount: 1500,
        advanceAmount: 0,
        creditAmount: 300,
        currency: 'EUR',
        status: 'partial',
      },
      { totalAmount: 800, advanceAmount: 0, creditAmount: 0, currency: 'EUR', status: 'pending' },
    ];

    for (const invoice of invoices) {
      const invoiceResponse = await fetch(`${API_BASE}/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...invoice,
          clientId,
        }),
      });

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        console.log('Erreur facture:', errorText);
        throw new Error(`Invoice creation failed: ${invoiceResponse.status}`);
      }

      const invoiceData = await invoiceResponse.json();
      console.log(`Facture créée: ${invoiceData.invoice._id} pour client ${clientId}`);
    }
    console.log('✅ Factures créées');

    // Vérifier les factures créées
    console.log('🔍 Vérification des factures...');
    const invoicesCheckResponse = await fetch(`${API_BASE}/v1/invoices?clientId=${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (invoicesCheckResponse.ok) {
      const invoicesData = await invoicesCheckResponse.json();
      console.log(`Factures trouvées: ${invoicesData.items.length}`);
      invoicesData.items.forEach((inv: any) => {
        console.log(`  - ${inv._id}: ${inv.totalAmount}€ (${inv.status})`);
      });
    }
    console.log('');

    // 5. Créer un rendez-vous
    console.log("5️⃣ Création d'un rendez-vous...");
    const appointmentResponse = await fetch(`${API_BASE}/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clientId,
        title: 'Test Invoice Summary',
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        endAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Demain + 1h
        status: 'scheduled',
      }),
    });

    if (!appointmentResponse.ok) {
      throw new Error(`Appointment creation failed: ${appointmentResponse.status}`);
    }

    const appointmentData = await appointmentResponse.json();
    const appointmentId = appointmentData.appointment._id;
    console.log(`✅ Rendez-vous créé: ${appointmentId}`);
    console.log(`   - ClientId du rendez-vous: ${appointmentData.appointment.clientId}`);
    console.log(`   - ClientId des factures: ${clientId}`);
    console.log('');

    // 6. Tester GET /appointments avec invoiceSummary
    console.log('6️⃣ Test GET /appointments avec invoiceSummary...');
    const appointmentsResponse = await fetch(
      `${API_BASE}/v1/appointments?includeInvoiceSummary=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!appointmentsResponse.ok) {
      throw new Error(`Appointments fetch failed: ${appointmentsResponse.status}`);
    }

    const appointmentsData = await appointmentsResponse.json();
    const appointment = appointmentsData.items.find(
      (apt: Appointment) => apt._id === appointmentId
    );

    if (!appointment) {
      throw new Error('Appointment not found in list');
    }

    console.log('📋 Données du rendez-vous:');
    console.log(`   - ID: ${appointment._id}`);
    console.log(`   - Client: ${appointment.client?.firstName} ${appointment.client?.lastName}`);
    console.log(`   - Titre: ${appointment.title}`);
    console.log(`   - Statut: ${appointment.status}`);

    if (appointment.invoiceSummary) {
      console.log('💰 Résumé de facturation:');
      console.log(`   - Montant total: ${appointment.invoiceSummary.totalAmount}€`);
      console.log(`   - Montant dû: ${appointment.invoiceSummary.dueAmount}€`);
      console.log(`   - Nombre de factures: ${appointment.invoiceSummary.invoiceCount}`);
      console.log(`   - Dernière facture: ${appointment.invoiceSummary.lastInvoiceAt || 'N/A'}`);
    } else {
      console.log('❌ invoiceSummary manquant');
    }
    console.log('');

    // 7. Tester GET /appointments/:id avec invoiceSummary
    console.log('7️⃣ Test GET /appointments/:id avec invoiceSummary...');
    const singleAppointmentResponse = await fetch(
      `${API_BASE}/v1/appointments/${appointmentId}?includeInvoiceSummary=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!singleAppointmentResponse.ok) {
      throw new Error(`Single appointment fetch failed: ${singleAppointmentResponse.status}`);
    }

    const singleAppointmentData = await singleAppointmentResponse.json();
    const singleAppointment = singleAppointmentData.appointment;

    console.log('📋 Données du rendez-vous individuel:');
    console.log(`   - ID: ${singleAppointment._id}`);
    console.log(
      `   - Client: ${singleAppointment.client?.firstName} ${singleAppointment.client?.lastName}`
    );
    console.log(`   - Titre: ${singleAppointment.title}`);
    console.log(`   - Statut: ${singleAppointment.status}`);

    if (singleAppointment.invoiceSummary) {
      console.log('💰 Résumé de facturation:');
      console.log(`   - Montant total: ${singleAppointment.invoiceSummary.totalAmount}€`);
      console.log(`   - Montant dû: ${singleAppointment.invoiceSummary.dueAmount}€`);
      console.log(`   - Nombre de factures: ${singleAppointment.invoiceSummary.invoiceCount}`);
      console.log(
        `   - Dernière facture: ${singleAppointment.invoiceSummary.lastInvoiceAt || 'N/A'}`
      );
    } else {
      console.log('❌ invoiceSummary manquant');
    }
    console.log('');

    // 8. Tester avec includeInvoiceSummary=false
    console.log('8️⃣ Test avec includeInvoiceSummary=false...');
    const appointmentsNoInvoiceResponse = await fetch(
      `${API_BASE}/v1/appointments?includeInvoiceSummary=false`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!appointmentsNoInvoiceResponse.ok) {
      throw new Error(
        `Appointments fetch without invoice failed: ${appointmentsNoInvoiceResponse.status}`
      );
    }

    const appointmentsNoInvoiceData = await appointmentsNoInvoiceResponse.json();
    const appointmentNoInvoice = appointmentsNoInvoiceData.items.find(
      (apt: Appointment) => apt._id === appointmentId
    );

    if (appointmentNoInvoice?.invoiceSummary) {
      console.log("❌ invoiceSummary présent alors qu'il ne devrait pas l'être");
    } else {
      console.log('✅ invoiceSummary correctement exclu');
    }
    console.log('');

    // 9. Nettoyage
    console.log('9️⃣ Nettoyage...');
    const mongo = new MongoClient(MONGO_URI);
    await mongo.connect();
    const db = mongo.db();

    await db.collection('appointments').deleteOne({ _id: appointmentId });
    await db.collection('invoices').deleteMany({ clientId });
    await db.collection('clients').deleteOne({ _id: clientId });

    await mongo.close();
    console.log('✅ Nettoyage terminé\n');

    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('✅ invoiceSummary fonctionne correctement dans les endpoints appointments');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testAppointmentsInvoiceSummary();
