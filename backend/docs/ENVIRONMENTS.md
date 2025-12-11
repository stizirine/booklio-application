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
- `REQUIRED_HEADER_VALUE` (optionnel) : Valeur globale du header (priorité la plus haute)
- `REQUIRED_HEADER_VALUE_DEV` (optionnel) : Valeur pour l'environnement de développement
- `REQUIRED_HEADER_VALUE_STAGING` (optionnel) : Valeur pour l'environnement de staging
- `REQUIRED_HEADER_VALUE_PROD` (optionnel) : Valeur pour l'environnement de production

**Priorité de sélection :**

1. `REQUIRED_HEADER_VALUE` (si défini, utilisé pour tous les environnements)
2. `REQUIRED_HEADER_VALUE_{ENV}` (selon `NODE_ENV`)
3. Si aucune valeur n'est définie, seule la présence du header est vérifiée

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
# Option 1: Valeur globale pour tous les environnements
# REQUIRED_HEADER_VALUE=ma-cle-globale

# Option 2: Valeurs spécifiques par environnement (priorité si REQUIRED_HEADER_VALUE n'est pas défini)
REQUIRED_HEADER_VALUE_DEV=dev-key-12345
# REQUIRED_HEADER_VALUE_STAGING=staging-key-67890
# REQUIRED_HEADER_VALUE_PROD=prod-key-secret

# WhatsApp Providers (optionnels pour mock)
WHATSAPP_META_TOKEN=
WHATSAPP_TWILIO_SID=
WHATSAPP_TWILIO_TOKEN=

# Node env
NODE_ENV=development
```
