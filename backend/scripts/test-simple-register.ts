const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function testSimpleRegister() {
  console.log("🧪 Test simple d'inscription...");

  const registerData = {
    tenantId: 't1',
    email: 'simple_test@example.com',
    password: 'password123',
    storeName: 'Simple Test Store',
    storeAddress: '123 Simple Street',
    patenteNumber: '111111111',
    rcNumber: 'RC111111',
    npeNumber: 'NPE111111',
    iceNumber: 'ICE111111111',
  };

  console.log('📤 Données envoyées:', registerData);

  try {
    const response = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    console.log('📊 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Réponse reçue:');
    console.log(JSON.stringify(data, null, 2));

    // Vérifier si les champs du magasin sont présents
    const user = data.user;
    const storeFields = [
      'storeName',
      'storeAddress',
      'patenteNumber',
      'rcNumber',
      'npeNumber',
      'iceNumber',
    ];

    console.log('\n🔍 Vérification des champs du magasin:');
    storeFields.forEach((field) => {
      console.log(`${field}: ${user[field] || 'undefined'}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testSimpleRegister();
