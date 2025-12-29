# Scripts Booklio

Ce dossier contient des scripts utilitaires pour la gestion de l'application Booklio.

## 🔧 Chargement des variables d'environnement

Tous les scripts utilisent le helper `load-env.ts` qui charge automatiquement les variables d'environnement depuis la **racine du projet** selon l'environnement.

### Fichiers d'environnement

Les fichiers `.env` se trouvent à la racine du projet :
- `.env.dev` - Environnement de développement (par défaut)
- `.env.prod` - Environnement de production
- `.env.rec` - Environnement de recette
- `.env` - Fallback général

### Spécifier l'environnement

Par défaut, les scripts chargent `.env.dev`. Pour utiliser un autre environnement :

```bash
# Développement (par défaut)
npm run script:create-account -- -t mon-tenant -e test@test.com -p password123

# Production
NODE_ENV=prod npm run script:create-account -- -t mon-tenant -e test@test.com -p password123

# Recette
NODE_ENV=rec npm run script:init-db
```

---

## create-account.ts

Script pour créer un compte utilisateur avec configuration complète du tenant **via l'API**.

> ⚠️ **Important**: Ce script utilise l'API de registration (`/v1/auth/register`). L'API doit être accessible et en cours d'exécution.
> 
> **Note**: En production, l'endpoint `/register` est désactivé. Utilisez `create-account-direct.ts` à la place.

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

- `--currency <currency>` : Devise par défaut du tenant (défaut: `EUR`)
  - Exemples: `EUR`, `USD`, `GBP`, `MAD`, `CAD`, `CHF`
  - Cette devise sera utilisée par défaut pour toutes les factures créées par ce tenant

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
  --tenant-id ichbilia-optique \
  --email ichbilia-optique@gmail.com \
  --password OptiqueIchbilia2025! \
  --client-type optician \
  --currency MAD \
  --first-name "Hassan" \
  --last-name "SGHOU" \
  --phone "+212661374807" \
  --phone-number "+212661374808" \
  --store-name "Ichbilia Optique" \
  --store-address "45 bis bloc -D- Hay Sahra, TanTan" \
  --patente "2418056" \
  --rc "5943" \
  --npe "035031590" \
  --ice "002933361000044" \
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

## create-account-direct.ts

Script pour créer un compte utilisateur **directement dans MongoDB** (bypass de l'API).

> ⚠️ **Usage en production**: Ce script est conçu pour être utilisé en production où l'endpoint `/v1/auth/register` est désactivé pour des raisons de sécurité.

### Prérequis

- Accès à MongoDB (via `MONGO_URI`)
- Aucune API n'est requise (le script écrit directement dans la base)

### Usage de base

```bash
# Compte optician basique
npm run script:create-account-direct -- \
  --tenant-id mon-opticien \
  --email contact@mon-opticien.fr \
  --password MonMotDePasse123

# En production avec MONGO_URI
NODE_ENV=prod MONGO_URI="mongodb://user:pass@localhost:27017/booklio?authSource=admin" \
  npm run script:create-account-direct -- \
  --tenant-id ichbilia-optique \
  --email contact@ichbilia-optique.ma \
  --password SecurePassword123! \
  --store-name "Ichbilia Optique" \
  --first-name "Hassan" \
  --last-name "SGHOU"
```

### Options disponibles

#### Options obligatoires
- `-t, --tenant-id <tenantId>` : Identifiant unique du tenant
- `-e, --email <email>` : Email de l'utilisateur
- `-p, --password <password>` : Mot de passe (sera hashé avec bcrypt)

#### Options de configuration
- `-c, --client-type <type>` : Type de client (optician, generic) [défaut: optician]

- `--currency <currency>` : Devise par défaut du tenant (défaut: `EUR`)
  - Exemples: `EUR`, `USD`, `GBP`, `MAD`, `CAD`, `CHF`
  - Cette devise sera utilisée par défaut pour toutes les factures créées par ce tenant

#### Options utilisateur
- `--first-name <firstName>` : Prénom
- `--last-name <lastName>` : Nom de famille
- `--phone <phone>` : Numéro de téléphone personnel
- `--store-name <storeName>` : Nom du magasin
- `--store-address <storeAddress>` : Adresse du magasin
- `--phone-number <phoneNumber>` : Numéro de téléphone fixe du magasin
- `--store-phone <storePhone>` : Autre téléphone du magasin
- `--patente <patenteNumber>` : Numéro de patente
- `--rc <rcNumber>` : Numéro RC
- `--npe <npeNumber>` : Numéro NPE
- `--ice <iceNumber>` : Numéro ICE

### Exemple complet (production)

```bash
NODE_ENV=prod npm run script:create-account-direct -- \
  --tenant-id ichbilia-optique \
  --email ichbilia-optique@gmail.com \
  --password OptiqueIchbilia2025! \
  --client-type optician \
  --currency MAD \
  --first-name "Hassan" \
  --last-name "SGHOU" \
  --phone "+212661374807" \
  --phone-number "+212661374808" \
  --store-name "Ichbilia Optique" \
  --store-address "45 bis bloc -D- Hay Sahra, TanTan" \
  --patente "2418056" \
  --rc "5943" \
  --npe "035031590" \
  --ice "002933361000044"
```

### Sortie exemple

```
🔌 Connexion à MongoDB...

✅ Connecté à MongoDB

📦 Création du tenant "ichbilia-optique"...
✅ Tenant créé: {
  tenantId: 'ichbilia-optique',
  clientType: 'optician',
  capabilities: [ 'dashboard', 'clients', 'appointments', 'invoices', 'optics' ]
}

🔐 Hashage du mot de passe...
👤 Création de l'utilisateur "ichbilia-optique@gmail.com"...

✅ Utilisateur créé avec succès!
   ID: 507f1f77bcf86cd799439011
   Email: ichbilia-optique@gmail.com
   Tenant: ichbilia-optique
   Type: optician
   Magasin: Ichbilia Optique

✅ Déconnexion de MongoDB
```

### Avantages

✅ **Fonctionne en production** - Bypass l'API désactivée
✅ **Création du tenant** - Crée automatiquement le tenant s'il n'existe pas
✅ **Hash sécurisé** - Utilise bcrypt avec salt de 10 rounds
✅ **Pas d'API requise** - Écrit directement dans MongoDB
✅ **Vérification des doublons** - Vérifie si l'email existe déjà

### Différences avec create-account.ts

| Caractéristique | create-account.ts | create-account-direct.ts |
|-----------------|-------------------|-------------------------|
| **Utilise l'API** | ✅ Oui | ❌ Non (direct MongoDB) |
| **Fonctionne en prod** | ❌ Non (endpoint désactivé) | ✅ Oui |
| **Nécessite API lancée** | ✅ Oui | ❌ Non |
| **Nécessite MONGO_URI** | ❌ Non | ✅ Oui |
| **Validation API** | ✅ Complète | ⚠️ Minimale |
| **Registre à jour** | ✅ Immédiat | ⚠️ Nécessite redémarrage API |

### Notes importantes

1. **Production uniquement** : Préférez `create-account.ts` en développement
2. **Redémarrage requis** : L'API doit être redémarrée pour charger le nouveau tenant depuis MongoDB
3. **Mot de passe** : Le script hashe le mot de passe avec bcrypt (10 rounds)
4. **Tenant automatique** : Crée le tenant avec les bonnes capabilities selon le `clientType`
5. **Rôle user** : Les utilisateurs créés ont le rôle `user` (pas `admin`)

### Configuration MongoDB en production

Sur le serveur de production, assurez-vous que `MONGO_URI` dans `/var/www/booklio/.env` pointe vers MongoDB accessible depuis l'extérieur de Docker :

```bash
# Si MongoDB tourne dans Docker sur le même serveur
MONGO_URI=mongodb://booklio:password@localhost:27017/booklio?authSource=admin

# Remplacez 'password' par le mot de passe réel encodé (%40 pour @)
```

## update-tenant-currency.ts

Script pour mettre à jour la devise d'un tenant existant dans la base de données.

> 💡 **Usage**: Utile pour changer la devise par défaut d'un tenant après sa création, par exemple pour passer de EUR à MAD pour un tenant marocain.

### Prérequis

- Accès à MongoDB (via `MONGO_URI`)
- Tenant existant dans la base de données

### Usage de base

```bash
# Mettre à jour la devise d'un tenant
npm run script:update-tenant-currency -- \
  --tenant-id ichbilia-optique \
  --currency MAD

# Avec rechargement automatique du registry via l'API
npm run script:update-tenant-currency -- \
  --tenant-id ichbilia-optique \
  --currency MAD \
  --api-url http://localhost:4000 \
  --api-key dev-key-12345
```

### Options disponibles

#### Options obligatoires
- `-t, --tenant-id <tenantId>` : Identifiant du tenant à mettre à jour (ex: `ichbilia-optique`, `t1`)
- `-c, --currency <currency>` : Nouvelle devise (ex: `MAD`, `EUR`, `USD`, `GBP`, `CAD`, `CHF`)

#### Options optionnelles
- `--api-url <url>` : URL de l'API pour recharger le registry après la mise à jour (défaut: `http://localhost:4000`)
- `--api-key <key>` : API Key pour l'authentification (utilise `REQUIRED_HEADER_VALUE` par défaut)

### Exemples d'utilisation

#### 1. Mise à jour simple (sans rechargement du registry)

```bash
npm run script:update-tenant-currency -- \
  --tenant-id ichbilia-optique \
  --currency MAD
```

#### 2. Mise à jour avec rechargement automatique du registry

```bash
npm run script:update-tenant-currency -- \
  --tenant-id ichbilia-optique \
  --currency MAD \
  --api-url http://localhost:4000 \
  --api-key dev-key-12345
```

#### 3. Utilisation en production

```bash
NODE_ENV=prod npm run script:update-tenant-currency -- \
  --tenant-id prod-tenant \
  --currency USD \
  --api-url https://api.mondomaine.com \
  --api-key prod-api-key-xyz
```

### Sortie exemple

```
🔌 Connexion à MongoDB...

✅ Connecté à MongoDB

🔍 Recherche du tenant "ichbilia-optique"...
✅ Tenant trouvé:
   Tenant ID: ichbilia-optique
   Devise actuelle: EUR
   Nouvelle devise: MAD

🔄 Mise à jour de la devise...
✅ Tenant ichbilia-optique mis à jour. Nouvelle devise: MAD

🔄 Tentative de rechargement du registry via l'API: http://localhost:4000/v1/tenants/reload
✅ Registry rechargé avec succès via l'API.

✅ Déconnexion de MongoDB
```

### Avantages

✅ **Mise à jour rapide** - Change la devise sans recréer le tenant
✅ **Rechargement automatique** - Option pour recharger le registry via l'API
✅ **Non destructif** - Ne modifie que le champ `currency` du tenant
✅ **Idempotent** - Peut être exécuté plusieurs fois sans risque

### Notes importantes

1. **Registry à jour** : Si vous utilisez `--api-url`, le registry sera automatiquement rechargé. Sinon, l'API devra être redémarrée pour prendre en compte la nouvelle devise.
2. **Factures existantes** : Les factures déjà créées conservent leur devise d'origine. Seules les nouvelles factures utiliseront la nouvelle devise du tenant.
3. **Validation** : Le script ne valide pas le code devise. Assurez-vous d'utiliser un code valide (EUR, USD, GBP, MAD, CAD, CHF, etc.).

### Ajout au package.json

Le script est déjà configuré dans `backend/package.json` :

```json
{
  "scripts": {
    "script:update-tenant-currency": "tsx scripts/update-tenant-currency.ts"
  }
}
```

## migrate-invoice-items.ts

Script de migration pour ajouter le champ `items` aux factures existantes dans la base de données.

### Usage

```bash
# Avec variable d'environnement
MONGO_URI="mongodb://..." npm run migrate:invoice-items

# Ou directement
tsx scripts/migrate-invoice-items.ts
```

### Description

Ce script :
- Trouve toutes les factures qui n'ont pas le champ `items`
- Ajoute le champ `items` avec un tableau vide `[]` par défaut
- Affiche un rapport de migration

### Exemple de sortie

```
🔌 Connexion à MongoDB...
✅ Connecté à MongoDB

🔍 Recherche des factures sans champ items...
📊 Trouvé 15 facture(s) sans champ items

🔄 Ajout du champ items aux factures...
✅ 15 facture(s) mise(s) à jour

✅ Migration terminée avec succès !
✅ Déconnexion de MongoDB
```

### Notes importantes

- **Idempotent** : Le script peut être exécuté plusieurs fois sans risque
- **Sécurisé** : Ne modifie que les factures qui n'ont pas déjà le champ `items`
- **Non destructif** : Les factures existantes avec des données ne sont pas affectées

## update-invoice-items.ts

Script pour mettre à jour les items d'une facture spécifique dans la base de données.

### Usage

```bash
# Avec mot de passe MongoDB
MONGO_PASSWORD="..." tsx scripts/update-invoice-items.ts <invoiceId>

# Ou avec URI complète
MONGO_URI="mongodb://..." tsx scripts/update-invoice-items.ts <invoiceId>
```

### Description

Ce script :
- Trouve une facture par son ID
- Met à jour le champ `items` avec les données fournies dans le script
- Affiche un rapport de mise à jour

### Notes importantes

- **Modification directe** : Modifie directement la base de données MongoDB
- **Personnalisable** : Les items sont définis dans le script (modifier le tableau `items`)
- **Encodage automatique** : Le mot de passe est automatiquement encodé pour l'URI MongoDB

## Autres scripts

- `seed-tenant-and-prescription.ts` : Seed de test avec tenant et prescription optique
- `seed-tenant-db.ts` : Seed complet de la base de données
- `update-test-user-tenant.ts` : Mise à jour du tenant d'un utilisateur de test
- `migrate-appointment-status.ts` : Migration du statut des rendez-vous
- `migrate-appointment-notes.ts` : Migration des notes des rendez-vous

---

## 📝 Créer un nouveau script

Pour créer un nouveau script qui charge automatiquement les bonnes variables d'environnement :

1. Créer le fichier dans `backend/scripts/`
2. Ajouter le shebang : `#!/usr/bin/env tsx`
3. Importer le helper d'environnement : `import './load-env.js';`
4. Le script chargera automatiquement les variables depuis la racine du projet

Exemple :
```typescript
#!/usr/bin/env tsx
import './load-env.js';
import mongoose from 'mongoose';

async function main() {
  // Les variables d'environnement sont déjà chargées
  console.log('MongoDB URI:', process.env.MONGO_URI?.substring(0, 30) + '...');
  
  await mongoose.connect(process.env.MONGO_URI!);
  // Votre code ici...
  
  await mongoose.disconnect();
}

main().catch(console.error);
```

