const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function testPhoneNumber() {
  console.log("🧪 Test d'inscription avec numéro de téléphone...");

  const rnd = Math.random().toString(36).substring(7);
  const registerData = {
    tenantId: 't1',
    email: `test_phone_${rnd}@example.com`,
    password: 'password123',
    storeName: 'Optique Test Phone',
    storeAddress: '123 Rue du Téléphone, 75001 Paris',
    phoneNumber: '+33 1 23 45 67 89',
    patenteNumber: '111222333',
    rcNumber: 'RC111222',
    npeNumber: 'NPE333444',
    iceNumber: 'ICE111222333',
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
    console.log('User:', JSON.stringify(data.user, null, 2));

    // Vérifier si le numéro de téléphone est présent
    const phoneNumber = data.user.phoneNumber;
    console.log('\n🔍 Vérification du numéro de téléphone:');
    console.log(`phoneNumber: ${phoneNumber || 'undefined'}`);

    if (phoneNumber === '+33 1 23 45 67 89') {
      console.log('✅ Numéro de téléphone correctement sauvegardé et retourné!');
    } else {
      console.log('❌ Problème avec le numéro de téléphone');
    }

    // Vérifier tous les champs du magasin
    const storeFields = [
      'storeName',
      'storeAddress',
      'phoneNumber',
      'patenteNumber',
      'rcNumber',
      'npeNumber',
      'iceNumber',
    ];
    console.log('\n🔍 Tous les champs du magasin:');
    storeFields.forEach((field) => {
      console.log(`${field}: ${data.user[field] || 'undefined'}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testPhoneNumber();
