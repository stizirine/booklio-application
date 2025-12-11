import { z } from 'zod';

// Reproduire le schéma de validation
const registerSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  // Informations du magasin/entreprise (optionnelles)
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  patenteNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  npeNumber: z.string().optional(),
  iceNumber: z.string().optional(),
});

async function testValidation() {
  console.log('🧪 Test de validation du schéma...');

  const testData = {
    tenantId: 't1',
    email: 'validation_test@example.com',
    password: 'password123',
    storeName: 'Validation Test Store',
    storeAddress: '789 Validation Street',
    patenteNumber: '999888777',
    rcNumber: 'RC999888',
    npeNumber: 'NPE777666',
    iceNumber: 'ICE999888777',
  };

  console.log('📤 Données de test:', testData);

  const parse = registerSchema.safeParse(testData);

  if (!parse.success) {
    console.error('❌ Validation échouée:', parse.error);
    return;
  }

  console.log('✅ Validation réussie!');
  console.log('📊 Données parsées:', parse.data);

  // Simuler la logique de création d'utilisateur
  const {
    tenantId,
    email,
    storeName,
    storeAddress,
    patenteNumber,
    rcNumber,
    npeNumber,
    iceNumber,
  } = parse.data;

  console.log('\n🔍 Extraction des champs:');
  console.log('tenantId:', tenantId);
  console.log('email:', email);
  console.log('storeName:', storeName);
  console.log('storeAddress:', storeAddress);
  console.log('patenteNumber:', patenteNumber);
  console.log('rcNumber:', rcNumber);
  console.log('npeNumber:', npeNumber);
  console.log('iceNumber:', iceNumber);

  // Construire l'objet utilisateur avec seulement les champs définis
  const userData: any = {
    tenantId,
    email,
    passwordHash: 'test_hash',
    roles: ['admin'],
  };

  // Ajouter les informations du magasin seulement si elles sont définies
  if (storeName) userData.storeName = storeName;
  if (storeAddress) userData.storeAddress = storeAddress;
  if (patenteNumber) userData.patenteNumber = patenteNumber;
  if (rcNumber) userData.rcNumber = rcNumber;
  if (npeNumber) userData.npeNumber = npeNumber;
  if (iceNumber) userData.iceNumber = iceNumber;

  console.log('\n📦 Objet utilisateur final:');
  console.log(JSON.stringify(userData, null, 2));
}

testValidation();
