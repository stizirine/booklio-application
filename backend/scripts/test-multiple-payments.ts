import 'dotenv/config';

const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function main() {
  console.log('🧪 Test des paiements multiples pour factures\n');

  // 1. Login pour obtenir un token
  console.log('1️⃣ Connexion...');
  const loginRes = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@booklio.com',
      password: 'Test123!',
    }),
  });

  if (!loginRes.ok) {
    console.error('❌ Erreur de connexion:', await loginRes.text());
    process.exit(1);
  }

  const { accessToken } = await loginRes.json();
  console.log('✅ Connecté\n');

  // 2. Créer un client
  console.log("2️⃣ Création d'un client de test...");
  const clientRes = await fetch(`${BASE}/v1/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: `jean.dupont.${Date.now()}@test.com`,
      phone: '+33612345678',
    }),
  });

  if (!clientRes.ok) {
    console.error('❌ Erreur création client:', await clientRes.text());
    process.exit(1);
  }

  const { client } = await clientRes.json();
  console.log(`✅ Client créé: ${client._id}\n`);

  // 3. Créer une facture de 1000€
  console.log("3️⃣ Création d'une facture de 1000€...");
  const invoiceRes = await fetch(`${BASE}/v1/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      clientId: client._id,
      totalAmount: 1000,
      currency: 'EUR',
      notes: {
        reason: 'Consultation et traitement',
        comment: 'Facture avec paiements échelonnés',
      },
    }),
  });

  if (!invoiceRes.ok) {
    console.error('❌ Erreur création facture:', await invoiceRes.text());
    process.exit(1);
  }

  const invoiceData = await invoiceRes.json();
  const invoice = invoiceData.invoice;
  console.log(`✅ Facture créée: ${invoice._id}`);
  console.log(`   Total: ${invoice.totalAmount}€`);
  console.log(`   Statut: ${invoice.status}`);
  console.log(`   Montant restant: ${invoice.remainingAmount}€\n`);

  // 4. Ajouter un premier paiement de 300€
  console.log('4️⃣ Ajout du 1er paiement: 300€ en espèces...');
  const payment1Res = await fetch(`${BASE}/v1/invoices/${invoice._id}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount: 300,
      method: 'cash',
      notes: 'Premier acompte',
    }),
  });

  if (!payment1Res.ok) {
    console.error('❌ Erreur ajout paiement 1:', await payment1Res.text());
    process.exit(1);
  }

  const payment1Data = await payment1Res.json();
  console.log('✅ Paiement 1 ajouté');
  console.log(`   Avance totale: ${payment1Data.invoice.advanceAmount}€`);
  console.log(`   Statut: ${payment1Data.invoice.status}`);
  console.log(`   Restant: ${payment1Data.invoice.remainingAmount}€`);
  console.log(`   Nombre de paiements: ${payment1Data.invoice.payments.length}\n`);

  // 5. Ajouter un deuxième paiement de 400€
  console.log('5️⃣ Ajout du 2ème paiement: 400€ par carte...');
  const payment2Res = await fetch(`${BASE}/v1/invoices/${invoice._id}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount: 400,
      method: 'card',
      reference: 'CARD-' + Date.now(),
      notes: 'Deuxième acompte',
    }),
  });

  if (!payment2Res.ok) {
    console.error('❌ Erreur ajout paiement 2:', await payment2Res.text());
    process.exit(1);
  }

  const payment2Data = await payment2Res.json();
  console.log('✅ Paiement 2 ajouté');
  console.log(`   Avance totale: ${payment2Data.invoice.advanceAmount}€`);
  console.log(`   Statut: ${payment2Data.invoice.status}`);
  console.log(`   Restant: ${payment2Data.invoice.remainingAmount}€`);
  console.log(`   Nombre de paiements: ${payment2Data.invoice.payments.length}\n`);

  // 6. Ajouter un troisième paiement de 300€ pour solder
  console.log('6️⃣ Ajout du 3ème paiement: 300€ par virement (solde)...');
  const payment3Res = await fetch(`${BASE}/v1/invoices/${invoice._id}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      amount: 300,
      method: 'transfer',
      reference: 'VIR-' + Date.now(),
      notes: 'Paiement final',
    }),
  });

  if (!payment3Res.ok) {
    console.error('❌ Erreur ajout paiement 3:', await payment3Res.text());
    process.exit(1);
  }

  const payment3Data = await payment3Res.json();
  console.log('✅ Paiement 3 ajouté');
  console.log(`   Avance totale: ${payment3Data.invoice.advanceAmount}€`);
  console.log(`   Statut: ${payment3Data.invoice.status}`);
  console.log(`   Restant: ${payment3Data.invoice.remainingAmount}€`);
  console.log(`   Nombre de paiements: ${payment3Data.invoice.payments.length}\n`);

  // 7. Récupérer la facture complète avec l'historique
  console.log("7️⃣ Récupération de l'historique complet...");
  const getInvoiceRes = await fetch(`${BASE}/v1/invoices/${invoice._id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!getInvoiceRes.ok) {
    console.error('❌ Erreur récupération facture:', await getInvoiceRes.text());
    process.exit(1);
  }

  const { invoice: fullInvoice } = await getInvoiceRes.json();
  console.log('✅ Historique des paiements:');
  fullInvoice.payments.forEach((payment: any, idx: number) => {
    console.log(`   ${idx + 1}. ${payment.amount}€ - ${payment.method || 'non spécifié'}`);
    console.log(
      `      Date: ${new Date(payment.paidAt).toLocaleDateString('fr-FR')} ${new Date(payment.paidAt).toLocaleTimeString('fr-FR')}`
    );
    if (payment.reference) console.log(`      Réf: ${payment.reference}`);
    if (payment.notes) console.log(`      Note: ${payment.notes}`);
    console.log(`      ID: ${payment._id}`);
  });
  console.log('');

  // 8. Vérifier le résumé du client
  console.log('8️⃣ Vérification du résumé client...');
  const summaryRes = await fetch(`${BASE}/v1/clients/${client._id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!summaryRes.ok) {
    console.error('❌ Erreur récupération client:', await summaryRes.text());
    process.exit(1);
  }

  const clientData = await summaryRes.json();
  console.log('✅ Résumé financier du client:');
  console.log(`   Montant total facturé: ${clientData.invoiceSummary.totalAmount}€`);
  console.log(`   Montant dû: ${clientData.invoiceSummary.dueAmount}€`);
  console.log(`   Nombre de factures: ${clientData.invoiceSummary.invoiceCount}\n`);

  // 9. Test de suppression d'un paiement
  console.log('9️⃣ Test de suppression du 2ème paiement...');
  const paymentToDelete = fullInvoice.payments[1]._id;
  const deletePaymentRes = await fetch(
    `${BASE}/v1/invoices/${invoice._id}/payments/${paymentToDelete}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!deletePaymentRes.ok) {
    console.error('❌ Erreur suppression paiement:', await deletePaymentRes.text());
    process.exit(1);
  }

  const deleteData = await deletePaymentRes.json();
  console.log('✅ Paiement supprimé');
  console.log(`   Avance totale recalculée: ${deleteData.invoice.advanceAmount}€`);
  console.log(`   Nouveau statut: ${deleteData.invoice.status}`);
  console.log(`   Nouveau restant: ${deleteData.invoice.remainingAmount}€`);
  console.log(`   Paiements restants: ${deleteData.invoice.payments.length}\n`);

  // 10. Cleanup
  console.log('🧹 Nettoyage...');
  await fetch(`${BASE}/v1/invoices/${invoice._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await fetch(`${BASE}/v1/clients/${client._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log('✅ Nettoyé\n');

  console.log('🎉 Test des paiements multiples: SUCCÈS');
}

main().catch((e) => {
  console.error('❌ Erreur:', e);
  process.exit(1);
});
