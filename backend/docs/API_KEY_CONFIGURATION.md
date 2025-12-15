# Configuration de la clé API par environnement

Ce document explique comment configurer différentes valeurs de clé API selon l'environnement.

## Variables d'environnement disponibles

### Nom du header

```env
REQUIRED_HEADER_NAME=x-api-key  # Défaut: x-api-key
```

### Valeurs du header

Vous pouvez définir la valeur de la clé API de deux façons :

#### Option 1: Valeur globale (tous les environnements)

```env
REQUIRED_HEADER_VALUE=ma-cle-globale-secrete
```

Cette valeur sera utilisée pour **tous** les environnements, quelle que soit la valeur de `NODE_ENV`.

#### Option 2: Valeurs spécifiques par environnement

```env
# Développement
REQUIRED_HEADER_VALUE_DEV=dev-key-12345

# Staging
REQUIRED_HEADER_VALUE_STAGING=staging-key-67890

# Production
REQUIRED_HEADER_VALUE_PROD=prod-key-secret-super-securise
```

Ces valeurs seront utilisées selon la valeur de `NODE_ENV` (development, staging, production).

## Priorité de sélection

Le middleware sélectionne la valeur selon cette priorité :

1. **`REQUIRED_HEADER_VALUE`** (si défini) → Utilisé pour tous les environnements
2. **`REQUIRED_HEADER_VALUE_{ENV}`** → Selon `NODE_ENV` :
   - `development` → `REQUIRED_HEADER_VALUE_DEV`
   - `staging` → `REQUIRED_HEADER_VALUE_STAGING`
   - `production` → `REQUIRED_HEADER_VALUE_PROD`
3. **Aucune valeur** → Seule la présence du header est vérifiée (pas de vérification de valeur)

## Exemples de configuration

### Exemple 1: Configuration simple (une seule valeur)

```env
# .env
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=ma-cle-secrete
NODE_ENV=development
```

**Comportement :** Toutes les requêtes doivent inclure `x-api-key: ma-cle-secrete`

### Exemple 2: Configuration par environnement

```env
# .env.development
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE_DEV=dev-key-12345
NODE_ENV=development
```

```env
# .env.staging
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE_STAGING=staging-key-67890
NODE_ENV=staging
```

```env
# .env.production
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE_PROD=prod-key-secret-super-securise
NODE_ENV=production
```

**Comportement :**

- En développement : `x-api-key: dev-key-12345`
- En staging : `x-api-key: staging-key-67890`
- En production : `x-api-key: prod-key-secret-super-securise`

### Exemple 3: Vérification de présence uniquement

```env
# .env
REQUIRED_HEADER_NAME=x-api-key
# Aucune valeur définie
NODE_ENV=development
```

**Comportement :** Le header `x-api-key` doit être présent, mais sa valeur n'est pas vérifiée.

### Exemple 4: Valeur globale avec override par environnement

```env
# .env
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=default-key  # Utilisé si aucune valeur spécifique n'est définie
REQUIRED_HEADER_VALUE_PROD=prod-key-secret  # Override pour la production
NODE_ENV=production
```

**Comportement :**

- En développement/staging : `x-api-key: default-key` (car `REQUIRED_HEADER_VALUE` est défini)
- En production : `x-api-key: default-key` (car `REQUIRED_HEADER_VALUE` a la priorité)

> ⚠️ **Note :** Si `REQUIRED_HEADER_VALUE` est défini, il a toujours la priorité. Pour utiliser des valeurs différentes par environnement, ne définissez **pas** `REQUIRED_HEADER_VALUE`.

## Configuration recommandée

### Pour le développement local

```env
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE_DEV=dev-local-key-12345
NODE_ENV=development
```

### Pour le staging

```env
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE_STAGING=staging-key-67890
NODE_ENV=staging
```

### Pour la production

```env
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE_PROD=prod-key-secret-super-securise-avec-64-caracteres-minimum
NODE_ENV=production
```

## Utilisation côté frontend

### Configuration selon l'environnement

```typescript
// config/api.ts
const API_KEYS = {
  development: 'dev-key-12345',
  staging: 'staging-key-67890',
  production: 'prod-key-secret-super-securise',
};

const env = process.env.NODE_ENV || 'development';
export const API_KEY = API_KEYS[env as keyof typeof API_KEYS];
```

### Intercepteur Axios

```typescript
import axios from 'axios';
import { API_KEY } from './config/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const excludedPaths = ['/health', '/metrics', '/docs', '/v1/auth/login', '/v1/auth/register', 'v1/optician/config'];
  const isExcluded = excludedPaths.some((path) => config.url?.startsWith(path));

  if (!isExcluded) {
    config.headers['x-api-key'] = API_KEY;
  }

  return config;
});
```

## Sécurité

### Bonnes pratiques

1. **Ne jamais commiter les clés** dans le code source
2. **Utiliser des secrets** dans les variables d'environnement
3. **Générer des clés fortes** (minimum 32 caractères, aléatoires)
4. **Utiliser des clés différentes** pour chaque environnement
5. **Roter les clés régulièrement** en production

### Génération de clés sécurisées

```bash
# Générer une clé aléatoire de 64 caractères
openssl rand -hex 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Dépannage

### Le middleware utilise toujours la même valeur

Vérifiez que :

1. `REQUIRED_HEADER_VALUE` n'est pas défini (il a la priorité)
2. `NODE_ENV` est correctement défini
3. La variable d'environnement spécifique est bien nommée (`REQUIRED_HEADER_VALUE_DEV`, `REQUIRED_HEADER_VALUE_STAGING`, `REQUIRED_HEADER_VALUE_PROD`)

### Le middleware ne vérifie pas la valeur

Vérifiez que :

1. Au moins une valeur est définie (`REQUIRED_HEADER_VALUE` ou `REQUIRED_HEADER_VALUE_{ENV}`)
2. Le serveur a été redémarré après modification des variables d'environnement

### Erreur 403 avec la bonne valeur

Vérifiez que :

1. Le header est bien nommé (case-insensitive, mais vérifiez les espaces)
2. La valeur correspond exactement (pas d'espaces en début/fin)
3. La bonne variable d'environnement est utilisée selon `NODE_ENV`
