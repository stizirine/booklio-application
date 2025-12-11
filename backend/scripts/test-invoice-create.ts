import 'dotenv/config';

const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function main() {
  console.log('🧪 Test de création de facture avec différents payloads\n');

  // 1. Login
  console.log('1️⃣ Connexion...');
  const loginRes = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@booklio.com',
      password: 'password123',
    }),
  });

  if (!loginRes.ok) {
    console.error('❌ Erreur de connexion:', await loginRes.text());
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const accessToken = loginData.tokens.accessToken;
  console.log('✅ Connecté\n');

  // 2. Créer un client
  console.log("2️⃣ Création d'un client...");
  const clientRes = await fetch(`${BASE}/v1/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'InvoiceCreate',
      email: `test.${Date.now()}@test.com`,
    }),
  });

  if (!clientRes.ok) {
    console.error('❌ Erreur création client:', await clientRes.text());
    process.exit(1);
  }

  const { client } = await clientRes.json();
  console.log(`✅ Client créé: ${client._id}\n`);

  // TEST 1: Facture sans paiement
  console.log('3️⃣ TEST 1: Facture sans paiement (1000€)');
  const invoice1 = await fetch(`${BASE}/v1/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      clientId: client._id,
      totalAmount: 1000,
      currency: 'EUR',
    }),
  });

  if (!invoice1.ok) {
    console.error('❌ Erreur:', await invoice1.text());
    process.exit(1);
  }

  const inv1Data = await invoice1.json();
  console.log(`   advanceAmount: ${inv1Data.invoice.advanceAmount}`);
  console.log(`   status: ${inv1Data.invoice.status}`);
  console.log(`   payments.length: ${inv1Data.invoice.payments.length}`);
  console.log(
    `   ✅ OK - advanceAmount=${inv1Data.invoice.advanceAmount}, status=${inv1Data.invoice.status}\n`
  );

  // TEST 2: Facture avec advanceAmount (mode classique)
  console.log('4️⃣ TEST 2: Facture avec advanceAmount=300 (mode classique)');
  const invoice2 = await fetch(`${BASE}/v1/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      clientId: client._id,
      totalAmount: 1000,
      advanceAmount: 300,
      currency: 'EUR',
    }),
  });

  if (!invoice2.ok) {
    console.error('❌ Erreur:', await invoice2.text());
    process.exit(1);
  }

  const inv2Data = await invoice2.json();
  console.log(`   advanceAmount: ${inv2Data.invoice.advanceAmount}`);
  console.log(`   status: ${inv2Data.invoice.status}`);
  console.log(`   payments.length: ${inv2Data.invoice.payments.length}`);
  console.log(
    `   ✅ OK - advanceAmount=${inv2Data.invoice.advanceAmount}, status=${inv2Data.invoice.status}\n`
  );

  // TEST 3: Facture avec payment (nouveau système)
  console.log('5️⃣ TEST 3: Facture avec payment={amount:400, method:cash}');
  const invoice3 = await fetch(`${BASE}/v1/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      clientId: client._id,
      totalAmount: 1000,
      currency: 'EUR',
      payment: {
        amount: 400,
        method: 'cash',
        notes: 'Acompte en espèces',
      },
    }),
  });

  if (!invoice3.ok) {
    console.error('❌ Erreur:', await invoice3.text());
    process.exit(1);
  }

  const inv3Data = await invoice3.json();
  console.log(`   advanceAmount: ${inv3Data.invoice.advanceAmount}`);
  console.log(`   status: ${inv3Data.invoice.status}`);
  console.log(`   payments.length: ${inv3Data.invoice.payments.length}`);
  if (inv3Data.invoice.payments.length > 0) {
    console.log(`   payment[0].amount: ${inv3Data.invoice.payments[0].amount}`);
    console.log(`   payment[0].method: ${inv3Data.invoice.payments[0].method}`);
  }
  console.log(
    `   ✅ OK - advanceAmount=${inv3Data.invoice.advanceAmount}, payments.length=${inv3Data.invoice.payments.length}\n`
  );

  // TEST 4: Facture avec BOTH advanceAmount ET payment (payment doit avoir priorité)
  console.log(
    '6️⃣ TEST 4: Facture avec advanceAmount=100 ET payment={amount:500} (payment prioritaire)'
  );
  const invoice4 = await fetch(`${BASE}/v1/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      clientId: client._id,
      totalAmount: 1000,
      advanceAmount: 100, // Devrait être ignoré
      currency: 'EUR',
      payment: {
        amount: 500, // Celui-ci doit être utilisé
        method: 'card',
        reference: 'TEST-001',
      },
    }),
  });

  if (!invoice4.ok) {
    console.error('❌ Erreur:', await invoice4.text());
    process.exit(1);
  }

  const inv4Data = await invoice4.json();
  console.log(`   advanceAmount: ${inv4Data.invoice.advanceAmount}`);
  console.log(`   status: ${inv4Data.invoice.status}`);
  console.log(`   payments.length: ${inv4Data.invoice.payments.length}`);
  if (inv4Data.invoice.payments.length > 0) {
    console.log(`   payment[0].amount: ${inv4Data.invoice.payments[0].amount}`);
  }

  if (inv4Data.invoice.advanceAmount === 500) {
    console.log(`   ✅ OK - payment prioritaire (advanceAmount=500, ignoré advanceAmount=100)\n`);
  } else {
    console.log(
      `   ❌ ERREUR - advanceAmount devrait être 500, pas ${inv4Data.invoice.advanceAmount}\n`
    );
  }

  // Cleanup
  console.log('7️⃣ Nettoyage...');
  await fetch(`${BASE}/v1/invoices/${inv1Data.invoice._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await fetch(`${BASE}/v1/invoices/${inv2Data.invoice._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await fetch(`${BASE}/v1/invoices/${inv3Data.invoice._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await fetch(`${BASE}/v1/invoices/${inv4Data.invoice._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await fetch(`${BASE}/v1/clients/${client._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log('✅ Nettoyé\n');

  console.log('🎉 Tous les tests sont OK !');
}

main().catch((e) => {
  console.error('❌ Erreur:', e);
  process.exit(1);
});
