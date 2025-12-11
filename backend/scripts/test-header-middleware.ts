/**
 * Script de test pour vérifier le middleware de vérification de header
 *
 * Usage:
 *   REQUIRED_HEADER_NAME=x-api-key REQUIRED_HEADER_VALUE=ma-cle-secrete tsx scripts/test-header-middleware.ts
 *
 * Ou sans valeur spécifique (juste vérifier la présence):
 *   REQUIRED_HEADER_NAME=x-api-key tsx scripts/test-header-middleware.ts
 */

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const HEADER_NAME = process.env.REQUIRED_HEADER_NAME || 'x-api-key';
const HEADER_VALUE = process.env.REQUIRED_HEADER_VALUE;

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  message?: string;
}

const results: TestResult[] = [];

async function testRequest(
  name: string,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    shouldSucceed: boolean;
  }
) {
  const { method = 'GET', headers = {}, body, shouldSucceed } = options;

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    } as any);

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    const passed = shouldSucceed ? res.ok : !res.ok;
    const message = json.error || json.details || res.statusText || `Status: ${res.status}`;

    results.push({
      name,
      passed,
      status: res.status,
      message,
    });

    const icon = passed ? '✅' : '❌';
    console.log(
      `${icon} ${name}: ${res.status} - ${message}${!passed ? ` (attendu: ${shouldSucceed ? 'succès' : 'échec'})` : ''}`
    );
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: (error as Error).message,
    });
    console.log(`❌ ${name}: Erreur - ${(error as Error).message}`);
  }
}

async function main() {
  console.log('🧪 Test du middleware de vérification de header\n');
  console.log(`Configuration:`);
  console.log(`  - Header requis: ${HEADER_NAME}`);
  console.log(
    `  - Valeur attendue: ${HEADER_VALUE || '(non spécifiée - vérification de présence uniquement)'}`
  );
  console.log(`  - Base URL: ${BASE}\n`);

  // Test 1: Requête sans header vers une route protégée (devrait échouer)
  await testRequest('1. Route protégée sans header', '/v1/auth/me', {
    headers: { Authorization: 'Bearer fake-token' },
    shouldSucceed: false,
  });

  // Test 2: Requête avec header vers une route protégée (devrait réussir si header présent)
  await testRequest('2. Route protégée avec header', '/v1/auth/me', {
    headers: {
      Authorization: 'Bearer fake-token',
      [HEADER_NAME]: HEADER_VALUE || 'test-value',
    },
    shouldSucceed: true, // Le header est présent, même si l'auth échoue
  });

  // Test 3: Requête avec mauvaise valeur de header (si REQUIRED_HEADER_VALUE est défini)
  if (HEADER_VALUE) {
    await testRequest('3. Route protégée avec mauvaise valeur de header', '/v1/auth/me', {
      headers: {
        Authorization: 'Bearer fake-token',
        [HEADER_NAME]: 'mauvaise-valeur',
      },
      shouldSucceed: false,
    });
  }

  // Test 4: Route système /health (devrait réussir sans header)
  await testRequest('4. Route système /health sans header', '/health', {
    shouldSucceed: true,
  });

  // Test 5: Route d'authentification /login (devrait réussir sans header)
  await testRequest('5. Route auth /login sans header', '/v1/auth/login', {
    method: 'POST',
    body: { email: 'test@example.com', password: 'test123456' },
    shouldSucceed: true, // Devrait passer le middleware même si le login échoue
  });

  // Test 6: Route d'authentification /register (devrait réussir sans header)
  await testRequest('6. Route auth /register sans header', '/v1/auth/register', {
    method: 'POST',
    body: { tenantId: 't1', email: 'test@example.com', password: 'test123456' },
    shouldSucceed: true, // Devrait passer le middleware même si l'inscription échoue
  });

  // Test 7: Route protégée avec header correct (si REQUIRED_HEADER_VALUE est défini)
  if (HEADER_VALUE) {
    await testRequest('7. Route protégée avec header correct', '/v1/auth/me', {
      headers: {
        Authorization: 'Bearer fake-token',
        [HEADER_NAME]: HEADER_VALUE,
      },
      shouldSucceed: true,
    });
  }

  // Résumé
  console.log('\n📊 Résumé des tests:');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`  ${passed}/${total} tests réussis\n`);

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} ${result.name}`);
    if (!result.passed && result.message) {
      console.log(`     → ${result.message}`);
    }
  });

  if (passed === total) {
    console.log('\n🎉 Tous les tests sont passés !');
    process.exit(0);
  } else {
    console.log('\n⚠️  Certains tests ont échoué');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});
