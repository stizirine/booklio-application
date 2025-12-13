# Scripts Booklio

Ce dossier contient des scripts utilitaires pour la gestion de l'application Booklio.

## create-account.ts

Script pour créer un compte utilisateur avec configuration complète du tenant **via l'API**.

> ⚠️ **Important**: Ce script utilise l'API de registration (`/v1/auth/register`). L'API doit être accessible et en cours d'exécution.

### Prérequis

- API Booklio accessible (par défaut: `http://localhost:4000`)
- API Key configurée si nécessaire (en production)

### Usage de base

```bash
# Compte optician basique
npm run script:create-account -- \
  --tenant-id mon-opticien \
  --email contact@mon-opticien.fr \
  --password MonMotDePasse123

# Compte avec informations complètes
npm run script:create-account -- \
  --tenant-id opticien-paris \
  --email contact@opticien-paris.fr \
  --password SecurePass456 \
  --first-name "Jean" \
  --last-name "Dupont" \
  --store-name "Opticien Paris Centre" \
  --store-address "123 Rue de Rivoli, Paris"
```

### Options disponibles

#### Options obligatoires
- `-t, --tenant-id <tenantId>` : Identifiant unique du tenant (ex: `t1`, `acme`, `mon-opticien`)
- `-e, --email <email>` : Email de l'utilisateur
- `-p, --password <password>` : Mot de passe

#### Options de configuration
- `-c, --client-type <type>` : Type de client
  - `optician` (défaut) : Opticien avec capacités optiques
  - `generic` : Client générique

- `--api-url <url>` : URL de l'API (défaut: `http://localhost:4000`)
- `--api-key <key>` : API Key pour l'authentification (utilise `REQUIRED_HEADER_VALUE` par défaut)

#### Options utilisateur
- `--first-name <firstName>` : Prénom
- `--last-name <lastName>` : Nom de famille
- `--phone <phone>` : Numéro de téléphone
- `--store-name <storeName>` : Nom du magasin
- `--store-address <storeAddress>` : Adresse du magasin
- `--phone-number <phoneNumber>` : Numéro de téléphone du magasin
- `--patente <patenteNumber>` : Numéro de patente
- `--rc <rcNumber>` : Numéro RC
- `--npe <npeNumber>` : Numéro NPE
- `--ice <iceNumber>` : Numéro ICE

### Exemples d'utilisation

#### 1. Opticien complet avec toutes les informations

```bash
npm run script:create-account -- \
  --tenant-id optique-vision \
  --email contact@optique-vision.ma \
  --password OptiqueVision2024! \
  --client-type optician \
  --first-name "Ahmed" \
  --last-name "Bennani" \
  --phone "+212600000000" \
  --store-name "Optique Vision" \
  --store-address "Bd Mohammed V, Casablanca" \
  --patente "12345678" \
  --rc "987654" \
  --ice "001234567890123" \
  --api-key dev-key-12345
```

#### 2. Compte générique simple

```bash
npm run script:create-account -- \
  --tenant-id cabinet-dentiste \
  --email contact@dentiste.fr \
  --password DentistePass123 \
  --client-type generic
```

#### 3. Utilisation avec une API distante

```bash
npm run script:create-account -- \
  --tenant-id prod-tenant \
  --email admin@prod.com \
  --password ProdPass456! \
  --api-url https://api.mondomaine.com \
  --api-key prod-api-key-xyz
```

#### 4. Utilisation avec Docker (API locale)

```bash
# S'assurer que l'API est lancée
docker ps | grep booklio-api

# Créer le compte
npm run script:create-account -- \
  --tenant-id docker-test \
  --email test@docker.local \
  --password DockerTest123 \
  --api-key dev-key-12345
```

### Sortie du script

Le script affiche un résumé complet après la création :

```
🚀 Création du compte via l'API...

📡 Appel à http://localhost:4000/v1/auth/register...
✅ Compte créé avec succès!

📡 Récupération des informations du tenant...

📋 Résumé de la création:
──────────────────────────────────────────────────
Tenant ID:        optique-vision
Client Type:      optician
Capabilities:     dashboard, clients, appointments, invoices, optics
Feature Flags:    optics_measurements, optics_prescriptions, optics_print
──────────────────────────────────────────────────
Email:            contact@optique-vision.ma
User ID:          507f1f77bcf86cd799439011
Roles:            admin
Nom:              Ahmed Bennani
Magasin:          Optique Vision
Adresse:          Bd Mohammed V, Casablanca
──────────────────────────────────────────────────

✨ Le tenant est maintenant disponible dans l'API!
💡 Vous pouvez vous connecter avec ces identifiants.
```

### Avantages de cette approche

✅ **Pas besoin d'accès direct à MongoDB** - Utilise l'API REST
✅ **Tenant disponible immédiatement** - Le registry est mis à jour automatiquement
✅ **Validation complète** - Toutes les règles métier de l'API sont appliquées
✅ **Sécurisé** - Utilise les mêmes endpoints que l'application frontend
✅ **Compatible production** - Peut être utilisé avec une API distante

### Gestion des erreurs

Le script vérifie :
- ✅ L'accessibilité de l'API
- ✅ La validité de l'API Key
- ✅ L'existence d'un utilisateur avec le même email
- ✅ La validité du clientType et des champs

En cas d'erreur, un message explicite est affiché avec les détails de l'erreur API.

### Notes importantes

1. **API doit être lancée** : Le script nécessite que l'API soit accessible
2. **Tenant créé automatiquement** : Le tenant est créé avec les bonnes capabilities selon le `clientType`
3. **ClientType Optician** : Ajoute automatiquement la capability `optics` et les feature flags optiques
4. **Mot de passe** : Validé et hashé par l'API
5. **Rôle admin** : Tous les utilisateurs créés ont le rôle `admin` par défaut
6. **Registry à jour** : Le tenant est immédiatement disponible dans l'API (pas besoin de redémarrer)

### Configuration de l'environnement

Le script utilise la variable d'environnement `REQUIRED_HEADER_VALUE` pour l'API key si `--api-key` n'est pas spécifié.

Pour définir cette variable :

```bash
# Dans .env.dev
REQUIRED_HEADER_VALUE=dev-key-12345

# Dans .env.prod
REQUIRED_HEADER_VALUE=prod-secure-key-xyz
```

### Ajout au package.json

Le script est déjà configuré dans `backend/package.json` :

```json
{
  "scripts": {
    "script:create-account": "tsx scripts/create-account.ts"
  }
}
```

## Autres scripts

- `seed-tenant-and-prescription.ts` : Seed de test avec tenant et prescription optique
- `seed-tenant-db.ts` : Seed complet de la base de données
- `update-test-user-tenant.ts` : Mise à jour du tenant d'un utilisateur de test

