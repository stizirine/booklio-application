# Guide de test du middleware de vérification de header

Ce guide explique comment tester le middleware de vérification de header depuis le frontend ou avec des outils de test.

## Configuration

Le middleware utilise les variables d'environnement suivantes :

```env
# Nom du header à vérifier (défaut: x-api-key)
REQUIRED_HEADER_NAME=x-api-key

# Option 1: Valeur globale pour tous les environnements (priorité la plus haute)
REQUIRED_HEADER_VALUE=ma-cle-secrete

# Option 2: Valeurs spécifiques par environnement (utilisé si REQUIRED_HEADER_VALUE n'est pas défini)
REQUIRED_HEADER_VALUE_DEV=dev-key-12345
REQUIRED_HEADER_VALUE_STAGING=staging-key-67890
REQUIRED_HEADER_VALUE_PROD=prod-key-secret
```

**Priorité de sélection de la valeur :**

1. `REQUIRED_HEADER_VALUE` (si défini, utilisé pour tous les environnements)
2. `REQUIRED_HEADER_VALUE_{ENV}` selon `NODE_ENV` (development, staging, production)
3. Si aucune valeur n'est définie, seule la présence du header est vérifiée

## Routes exclues

Les routes suivantes ne nécessitent **PAS** le header :

- `/health` - Route de santé
- `/metrics` - Métriques Prometheus
- `/docs` - Documentation Swagger
- `/docs.json` - Spécification OpenAPI
- `/v1/auth/login` - Connexion
- `/v1/auth/register` - Inscription
- `/v1/auth/refresh` - Rafraîchissement du token

## Méthodes de test

### 1. Script de test automatique

Utilisez le script de test fourni :

```bash
# Test avec vérification de présence uniquement
npm run test:header

# Test avec valeur spécifique
REQUIRED_HEADER_VALUE=ma-cle-secrete npm run test:header

# Test avec header personnalisé
REQUIRED_HEADER_NAME=x-custom-header REQUIRED_HEADER_VALUE=secret npm run test:header
```

### 2. Test avec cURL

#### Test 1: Requête sans header (devrait échouer)

```bash
# Sans header - devrait retourner 400
curl -X GET http://localhost:4000/v1/auth/me \
  -H "Authorization: Bearer fake-token" \
  -H "Content-Type: application/json"
```

**Résultat attendu :** `400 Bad Request` avec message d'erreur

#### Test 2: Requête avec header (devrait passer le middleware)

```bash
# Avec header - devrait passer le middleware (même si l'auth échoue)
curl -X GET http://localhost:4000/v1/auth/me \
  -H "Authorization: Bearer fake-token" \
  -H "x-api-key: ma-cle-secrete" \
  -H "Content-Type: application/json"
```

**Résultat attendu :** Le middleware passe, mais l'auth échoue (401)

#### Test 3: Route exclue - /health (devrait réussir)

```bash
# Route système - devrait réussir sans header
curl -X GET http://localhost:4000/health
```

**Résultat attendu :** `200 OK` avec `{"status":"ok"}`

#### Test 4: Route d'authentification - /login (devrait réussir)

```bash
# Route auth publique - devrait réussir sans header
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

**Résultat attendu :** Le middleware passe (même si le login échoue)

### 3. Test avec JavaScript/TypeScript (fetch)

#### Exemple 1: Requête sans header

```typescript
// ❌ Devrait échouer
const response = await fetch('http://localhost:4000/v1/auth/me', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer fake-token',
    'Content-Type': 'application/json',
  },
});

console.log(response.status); // 400
const error = await response.json();
console.log(error); // { error: "Header 'x-api-key' requis", ... }
```

#### Exemple 2: Requête avec header

```typescript
// ✅ Devrait passer le middleware
const response = await fetch('http://localhost:4000/v1/auth/me', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer fake-token',
    'x-api-key': 'ma-cle-secrete', // Header requis
    'Content-Type': 'application/json',
  },
});

console.log(response.status); // 401 (auth échoue, mais middleware passe)
```

#### Exemple 3: Route exclue

```typescript
// ✅ Devrait réussir sans header
const response = await fetch('http://localhost:4000/health');
console.log(response.status); // 200
const data = await response.json();
console.log(data); // { status: 'ok' }
```

#### Exemple 4: Route d'authentification

```typescript
// ✅ Devrait réussir sans header
const response = await fetch('http://localhost:4000/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123456',
  }),
});

console.log(response.status); // 401 (login échoue, mais middleware passe)
```

### 4. Test avec Postman/Insomnia

#### Configuration d'un header global

1. Créez une variable d'environnement `api_key` avec la valeur `ma-cle-secrete`
2. Ajoutez un header dans votre collection :
   - **Name:** `x-api-key`
   - **Value:** `{{api_key}}`

#### Tests à effectuer

1. **Test sans header** : Supprimez le header `x-api-key` et testez une route protégée → Devrait retourner 400
2. **Test avec header** : Ajoutez le header `x-api-key` et testez une route protégée → Devrait passer le middleware
3. **Test route /health** : Testez `/health` sans header → Devrait retourner 200
4. **Test route /login** : Testez `/v1/auth/login` sans header → Devrait passer le middleware

### 5. Test depuis le frontend (React/Vue/etc.)

#### Configuration d'un intercepteur Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// Ajouter le header requis à toutes les requêtes
api.interceptors.request.use((config) => {
  // Ne pas ajouter le header pour les routes exclues
  const excludedPaths = [
    '/health',
    '/metrics',
    '/docs',
    '/v1/auth/login',
    '/v1/auth/register',
    '/v1/auth/refresh',
  ];
  const isExcluded = excludedPaths.some((path) => config.url?.startsWith(path));

  if (!isExcluded) {
    config.headers['x-api-key'] = process.env.REACT_APP_API_KEY || 'ma-cle-secrete';
  }

  return config;
});

export default api;
```

#### Exemple d'utilisation

```typescript
// ✅ Avec intercepteur - header ajouté automatiquement
const response = await api.get('/v1/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ✅ Route exclue - pas de header nécessaire
const health = await api.get('/health');

// ✅ Route auth - pas de header nécessaire
const login = await api.post('/v1/auth/login', {
  email: 'test@example.com',
  password: 'test123456',
});
```

## Scénarios de test complets

### Scénario 1: Vérification de présence uniquement

```env
REQUIRED_HEADER_NAME=x-api-key
# REQUIRED_HEADER_VALUE non défini
```

**Comportement attendu :**

- ✅ Requête avec `x-api-key: any-value` → Passe
- ❌ Requête sans `x-api-key` → Échoue (400)

### Scénario 2: Vérification avec valeur spécifique

```env
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=ma-cle-secrete
```

**Comportement attendu :**

- ✅ Requête avec `x-api-key: ma-cle-secrete` → Passe
- ❌ Requête avec `x-api-key: autre-valeur` → Échoue (403)
- ❌ Requête sans `x-api-key` → Échoue (400)

## Dépannage

### Le middleware bloque toutes les requêtes

Vérifiez que :

1. Les routes exclues sont bien configurées
2. Le header est bien nommé (case-insensitive)
3. La valeur du header correspond si `REQUIRED_HEADER_VALUE` est défini

### Le middleware ne bloque rien

Vérifiez que :

1. Le middleware est bien ajouté dans `server.ts`
2. Les variables d'environnement sont bien chargées
3. Le serveur a été redémarré après les modifications

### Erreur 403 au lieu de 400

Cela signifie que le header est présent mais avec une mauvaise valeur. Vérifiez `REQUIRED_HEADER_VALUE`.

## Notes importantes

- Le middleware est **case-insensitive** pour le nom du header
- Les routes exclues sont vérifiées par **chemin exact** pour les routes auth et par **préfixe** pour les routes système
- Le middleware s'exécute **avant** tous les autres middlewares (sauf cors, helmet, express.json, pinoHttp)
