#!/usr/bin/env tsx

import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function testAggregation() {
  console.log("🧪 Test de l'agrégation MongoDB...\n");

  try {
    const mongo = new MongoClient(MONGO_URI);
    await mongo.connect();
    const db = mongo.db();

    // Récupérer les appointments récents
    const appointments = await db
      .collection('appointments')
      .find({
        tenantId: 't1',
        deletedAt: null,
      })
      .limit(1)
      .toArray();

    console.log('Appointments trouvés:', appointments.length);
    if (appointments.length > 0) {
      const apt = appointments[0];
      console.log('Appointment:', {
        _id: apt._id,
        clientId: apt.clientId,
        clientIdType: typeof apt.clientId,
      });

      // Tester l'agrégation avec le clientId de l'appointment
      const clientId = apt.clientId;
      console.log('ClientId pour agrégation:', clientId);

      // Tester avec un clientId spécifique
      const testClientId = new ObjectId('68db1494b2552af441015f63');
      console.log('Test avec clientId spécifique:', testClientId);

      const invoiceSummaries = await db
        .collection('invoices')
        .aggregate([
          { $match: { tenantId: 't1', deletedAt: null, clientId: testClientId } },
          {
            $group: {
              _id: '$clientId',
              totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
              dueAmount: {
                $sum: {
                  $let: {
                    vars: {
                      paid: {
                        $add: [
                          { $ifNull: ['$advanceAmount', 0] },
                          { $ifNull: ['$creditAmount', 0] },
                        ],
                      },
                    },
                    in: {
                      $max: [
                        0,
                        {
                          $subtract: [{ $ifNull: ['$totalAmount', 0] }, '$$paid'],
                        },
                      ],
                    },
                  },
                },
              },
              invoiceCount: { $sum: 1 },
              lastInvoiceAt: { $max: '$createdAt' },
            },
          },
        ])
        .toArray();

      console.log('Résultat agrégation:', invoiceSummaries);

      // Vérifier les factures directement
      const invoices = await db
        .collection('invoices')
        .find({
          tenantId: 't1',
          deletedAt: null,
          clientId: testClientId,
        })
        .toArray();

      console.log('Factures trouvées:', invoices.length);
      invoices.forEach((inv) => {
        console.log(`  - ${inv._id}: ${inv.totalAmount}€ (${inv.status})`);
      });
    }

    await mongo.close();
    console.log('\n✅ Test terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testAggregation();
