# Booklio – Backend (MVP Auth + Mongo)

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![Lint](https://github.com/OWNER/REPO/actions/workflows/lint.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/lint.yml)

## Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Docker Desktop (recommandé) ou MongoDB local

## Démarrage rapide avec Docker 🐳

**La méthode la plus simple !** Docker va gérer MongoDB et l'application pour vous.

### 1. Lancer l'application avec Docker Desktop

```bash
# Lancer tous les conteneurs (MongoDB + API)
npm run docker:up

# L'API sera disponible sur http://localhost:4000
# MongoDB sera disponible sur localhost:27017
```

Vous pouvez maintenant ouvrir Docker Desktop et voir vos conteneurs `booklio-app` et `booklio-mongo` en cours d'exécution ! 🎉

### Commandes Docker utiles

```bash
# Arrêter tous les conteneurs
npm run docker:down

# Voir les logs en temps réel
npm run docker:logs

# Reconstruire et redémarrer (après modifications du code)
npm run docker:rebuild
```

### Ou via Docker Desktop

1. Ouvrez Docker Desktop
2. Dans l'onglet "Containers", vous verrez `booklio-app` et `booklio-mongo`
3. Utilisez les boutons Start/Stop pour contrôler vos conteneurs

---

## Alternative : Installation locale (sans Docker)

Si vous préférez ne pas utiliser Docker, vous pouvez installer MongoDB localement.

### Installation MongoDB (macOS)

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

Par défaut, mongod écoute sur 127.0.0.1:27017.

## Configuration du projet

1. Ouvrir le dossier `booklio`
2. Copier le fichier `.env.example` vers `.env`:

```bash
cp .env.example .env
```

3. Vérifier/éditer `.env` selon vos besoins:

```env
# MongoDB (Docker)
MONGO_URI=mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin

# JWT
JWT_ACCESS_SECRET=dev_access_secret_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Serveur
PORT=4000
NODE_ENV=development
```

> ⚠️ **Important** : En production, changez les secrets JWT !

## Installation dépendances

```bash
npm install
```

## Démarrage

- Dev (tsx):

```bash
npm run dev
```

- Build + run (dist):

```bash
npm run build
npm start
```

## Endpoints (MVP)

GET `/health`
POST `/v1/auth/register`
POST `/v1/auth/login`
POST `/v1/auth/refresh` (Authorization: Bearer <refreshToken>)
GET `/v1/auth/me` (Authorization: Bearer <accessToken>)
POST `/v1/auth/logout` (Authorization: Bearer <accessToken>)

## Swagger

## Agent IA – WhatsApp (rappels 48h)

### Seed des templates

```bash
TENANT_ID=t1 npm run agent:seed:templates
```

Cela crée un template `reminder_48h_fr` avec placeholders `{firstName,date,time,bookingLink}`.

### Endpoint de test

Envoyer un message test (provider mock) à un client du tenant courant:

```bash
curl -X POST http://localhost:4000/v1/agent/test-message \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<CLIENT_ID>",
    "templateName": "reminder_48h_fr",
    "locale": "fr",
    "variables": {
      "date": "2025-10-15",
      "time": "10:00",
      "bookingLink": "https://booklio.app/r/abc"
    }
  }'
```

Réponse:

```json
{
  "ok": true,
  "providerMessageId": "mock_...",
  "text": "Bonjour Samir, rappel de votre rendez-vous dans 48h le 15 oct. 2025 à 10:00. Si besoin de reprogrammer, utilisez ce lien: https://booklio.app/r/abc."
}
```

- UI: http://localhost:4000/docs/
- JSON: http://localhost:4000/docs.json

## Smoke tests

```bash
npm run smoke:auth      # login -> me -> refresh
npm run smoke:register  # register -> login -> me -> cleanup DB
```

## Scripts de gestion de la base de données

### Peupler la base de données (données de test)

Pour créer des données de test (utilisateurs, clients, rendez-vous, factures) :

```bash
npm run seed
```

Ce script crée :

- **1 utilisateur** : `test@booklio.com` / `password123`
- **5 clients** avec coordonnées complètes
- **7 rendez-vous** (passés et à venir)
- **5 factures** (payées, partielles, en attente)

Le script est **idempotent** : vous pouvez le relancer sans créer de doublons.

### Vider la base de données

```bash
npm run clear:db
```

Supprime tous les clients, rendez-vous et factures. Conserve les utilisateurs et tokens Google.

### Supprimer un client

```bash
# Suppression logique (soft delete)
npm run delete:client <clientId> [tenantId]

# Suppression physique (hard delete) - supprime aussi les rendez-vous et factures
npm run delete:client <clientId> [tenantId] --hard
```

**Exemples :**

```bash
# Supprimer un client (soft delete, tenantId par défaut: t1)
npm run delete:client 507f1f77bcf86cd799439011

# Supprimer un client définitivement
npm run delete:client 507f1f77bcf86cd799439011 t1 --hard
```

### Supprimer un rendez-vous

```bash
# Suppression logique (soft delete)
npm run delete:appointment <appointmentId> [tenantId]

# Suppression physique (hard delete)
npm run delete:appointment <appointmentId> [tenantId] --hard
```

**Exemples :**

```bash
# Supprimer un rendez-vous (soft delete, tenantId par défaut: t1)
npm run delete:appointment 507f1f77bcf86cd799439011

# Supprimer un rendez-vous définitivement
npm run delete:appointment 507f1f77bcf86cd799439011 t1 --hard
```

### Mettre à jour le statut d'un rendez-vous

```bash
# Via endpoint API
curl -X PATCH http://localhost:4000/v1/appointments/<appointmentId>/status \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Via script CLI
npm run appt:status <appointmentId> <status> [tenantId]
# Exemple
npm run appt:status 507f1f77bcf86cd799439011 done t1
```

### Mettre à jour le statut en lot

```bash
# Par IDs (liste séparée par virgule)
npm run appt:status:bulk -- --status-to done --ids 507f1f77bcf86cd799439011,507f1f77bcf86cd799439012 --tenantId t1

# Par période et statut actuel
npm run appt:status:bulk -- --status-to canceled --from 2025-09-01T00:00:00Z --to 2025-09-30T23:59:59Z --status-from scheduled --tenantId t1

# Aide
npm run appt:status:bulk -- --help
```

### Mettre à jour le statut des factures en lot

```bash
# Par IDs
npm run invoice:status:bulk -- --status-to paid --ids 507f1f77bcf86cd799439011,507f1f77bcf86cd799439012 --tenantId t1

# Par client et statut actuel
npm run invoice:status:bulk -- --status-to partial --clientId 507f1f77bcf86cd799439099 --status-from draft --tenantId t1

# Aide
npm run invoice:status:bulk -- --help
```

### Recalculer le statut des factures (en fonction des montants)

```bash
# Dry run (affiche sans modifier)
npm run invoice:recalc -- --tenantId t1 --dry-run

# Appliquer pour tout le tenant
npm run invoice:recalc -- --tenantId t1

# Limiter à un client
npm run invoice:recalc -- --tenantId t1 --clientId 507f1f77bcf86cd799439099
```

## Notes

ESM activé (`type: module`) et imports internes `.js` après build
TypeScript strict; importer les types avec `import type { ... }`
Secrets JWT à remplacer pour la prod; Mongo à sécuriser
