# Configuration des Environnements

Ce document décrit la configuration des environnements de déploiement pour Booklio.

## Environnements

### Staging (develop)

- **Branche** : `develop`
- **URL** : https://staging.booklio.com
- **Protection** : 1 reviewer requis
- **Wait timer** : 0 minutes
- **Déploiement** : Automatique sur push

### Production (main)

- **Branche** : `main`
- **URL** : https://booklio.com
- **Protection** : 2 reviewers requis
- **Wait timer** : 5 minutes
- **Déploiement** : Automatique sur push

## Configuration GitHub

Les environnements sont configurés dans :

- GitHub Repository Settings > Environments
- Chaque environnement peut avoir des secrets spécifiques
- Les règles de protection sont définies par environnement

## Secrets Requis

### Communs

- `SSH_HOST` : Adresse du serveur de déploiement
- `SSH_USER` : Utilisateur SSH
- `SSH_KEY` : Clé privée SSH
- `DEPLOY_DIR` : Répertoire de déploiement

### Application

- `MONGO_URI` (requis) : URI de connexion MongoDB (ex: `mongodb://localhost:27017/booklio`)
- `PORT` (optionnel) : Port HTTP de l'API (défaut: `4000`)
- `REDIS_URL` (optionnel) : URL Redis pour BullMQ (défaut: `redis://localhost:6379`)
- `JWT_SECRET` (recommandé) : Secret pour signer les tokens JWT
- `GCAL_CLIENT_ID` : ID client Google Calendar
- `GCAL_CLIENT_SECRET` : Secret client Google Calendar
- `GCAL_REDIRECT_URI` : URI de redirection Google Calendar

### API Key Header (sécurité)

- `REQUIRED_HEADER_NAME` (optionnel) : Nom du header à vérifier (défaut: `x-api-key`)
- `REQUIRED_HEADER_VALUE` (optionnel) : Valeur du header (globale, utilisée pour tous les envs)

**Priorité de sélection :**

1. `REQUIRED_HEADER_VALUE` (si défini, utilisé pour tous les environnements)
2. Si aucune valeur n'est définie, seule la présence du header est vérifiée

### Notifications (optionnel)

- `SLACK_WEBHOOK_URL` : Webhook Slack pour les notifications

### Providers WhatsApp (optionnel pour le mock)

- `WHATSAPP_META_TOKEN` : Token d'accès API Meta WhatsApp Business
- `WHATSAPP_TWILIO_SID` : Twilio Account SID
- `WHATSAPP_TWILIO_TOKEN` : Twilio Auth Token

## Validation des secrets

Au démarrage, l'application valide les variables via un schéma `zod` (`src/config/secrets.ts`).

- Requis: `MONGO_URI`
- Valeurs par défaut: `REDIS_URL`, `PORT`
- En cas de variables manquantes/invalides, le démarrage échoue avec un message explicite.

## Exemple de fichier .env

Copiez-collez cet exemple dans un fichier `.env` à la racine du projet (en adaptant les valeurs):

```env
# Server
PORT=4000

# Database
MONGO_URI=mongodb://localhost:27017/booklio

# Redis / BullMQ
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=change-me-in-prod

# API Key Header (sécurité)
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=dev-key-12345

# WhatsApp Providers (optionnels pour mock)
WHATSAPP_META_TOKEN=
WHATSAPP_TWILIO_SID=
WHATSAPP_TWILIO_TOKEN=

# Node env
NODE_ENV=development
```

## Exemples par environnement (Docker Compose)

Ces blocs peuvent être copiés dans des fichiers séparés (ex: `.env.dev`, `.env.rec`, `.env.prod`).  
Lancez ensuite `docker compose --env-file .env.dev up -d` (ou `ENV_FILE=.env.dev docker compose up -d` pour renseigner `env_file`).

### Développement (`.env.dev`)
```
NODE_ENV=development
PORT=4000

# Mongo local
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_USER=booklio
MONGO_PASSWORD=dev_password_change_me
MONGO_DB=booklio
MONGO_AUTH_SOURCE=admin
# Alternative: MONGO_URI=mongodb://booklio:dev_password_change_me@mongo:27017/booklio?authSource=admin

REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=dev_access_secret_change_me
JWT_REFRESH_SECRET=dev_refresh_secret_change_me
BCRYPT_SALT_ROUNDS=12

REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=dev-key-12345

# Frontend build
REACT_APP_API_BASE_URL=/api
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=dev-key-12345
```

### Recette / Staging (`.env.rec`)
> Utiliser `NODE_ENV=staging` (alias `rec`/`recette` accepté par l'API).
```
NODE_ENV=staging
PORT=4000

# Mongo recette (adapter host/credentials)
MONGO_HOST=rec-mongo.internal
MONGO_PORT=27017
MONGO_USER=booklio
MONGO_PASSWORD=rec_password_change_me
MONGO_DB=booklio
MONGO_AUTH_SOURCE=admin
# Alternative: MONGO_URI=mongodb://booklio:rec_password_change_me@rec-mongo.internal:27017/booklio?authSource=admin

REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=rec_access_secret_change_me
JWT_REFRESH_SECRET=rec_refresh_secret_change_me
BCRYPT_SALT_ROUNDS=12

REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=rec-key-67890

# Frontend build
REACT_APP_API_BASE_URL=/api
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=rec-key-67890
```

### Production (`.env.prod`)
```
NODE_ENV=production
PORT=4000

# Mongo production (hébergé/cluster)
MONGO_HOST=prod-mongo.internal
MONGO_PORT=27017
MONGO_USER=booklio
MONGO_PASSWORD=prod_password_change_me
MONGO_DB=booklio
MONGO_AUTH_SOURCE=admin
# Alternative: MONGO_URI=mongodb+srv://booklio:prod_password_change_me@cluster.example.com/booklio?authSource=admin

REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=prod_access_secret_change_me
JWT_REFRESH_SECRET=prod_refresh_secret_change_me
BCRYPT_SALT_ROUNDS=12

REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=prod-key-secret

# Frontend build
REACT_APP_API_BASE_URL=/api
REQUIRED_HEADER_NAME=x-api-key
REQUIRED_HEADER_VALUE=prod-key-secret
```
