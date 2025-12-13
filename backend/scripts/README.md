# Scripts Booklio

Ce dossier contient des scripts utilitaires pour la gestion de l'application Booklio.

## create-account.ts

Script pour créer un compte utilisateur avec configuration complète du tenant.

### Prérequis

- MongoDB accessible
- Variables d'environnement configurées (`.env.dev`, `.env.prod`, etc.)

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

#### Options du tenant
- `-c, --client-type <type>` : Type de client
  - `optician` (défaut) : Opticien avec capacités optiques
  - `generic` : Client générique

- `--capabilities <capabilities...>` : Liste des capacités
  - Valeurs possibles : `dashboard`, `clients`, `appointments`, `invoices`, `optics`
  - Défaut pour optician : `dashboard clients appointments invoices optics`
  - Exemple : `--capabilities dashboard clients optics`

- `--feature-flags <flags...>` : Feature flags à activer
  - Valeurs possibles : `optics-measurements`, `optics-prescriptions`, `optics-print`
  - Pour optician, activés par défaut si non spécifiés
  - Exemple : `--feature-flags optics-measurements optics-prescriptions`

#### Options utilisateur
- `--first-name <firstName>` : Prénom
- `--last-name <lastName>` : Nom de famille
- `--phone <phone>` : Numéro de téléphone
- `--store-name <storeName>` : Nom du magasin
- `--store-address <storeAddress>` : Adresse du magasin
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
  --ice "001234567890123"
```

#### 2. Compte générique simple

```bash
npm run script:create-account -- \
  --tenant-id cabinet-dentiste \
  --email contact@dentiste.fr \
  --password DentistePass123 \
  --client-type generic \
  --capabilities dashboard clients appointments
```

#### 3. Opticien avec feature flags personnalisés

```bash
npm run script:create-account -- \
  --tenant-id optique-moderne \
  --email admin@optique-moderne.fr \
  --password Moderne2024! \
  --feature-flags optics-measurements optics-print
```

#### 4. Utilisation avec un fichier .env spécifique

```bash
# Avec .env.dev (développement)
cd backend
MONGO_URI="mongodb://booklio:P%40ssw0rd123@localhost:27017/booklio?authSource=admin" \
npx tsx scripts/create-account.ts \
  --tenant-id test-dev \
  --email test@dev.local \
  --password TestDev123

# Avec .env.prod (production)
ENV_FILE=.env.prod npm run script:create-account -- \
  --tenant-id prod-tenant \
  --email admin@prod.com \
  --password ProdPass456!
```

### Sortie du script

Le script affiche un résumé complet après la création :

```
🔌 Connexion à MongoDB...
✅ Connecté à MongoDB

➕ Création du tenant optique-vision...
✅ Tenant créé

👤 Création de l'utilisateur contact@optique-vision.ma...
✅ Utilisateur créé

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
──────────────────────────────────────────────────

✨ Compte créé avec succès!

🔌 Déconnecté de MongoDB
```

### Gestion des erreurs

Le script vérifie :
- ✅ La connexion à MongoDB
- ✅ L'existence d'un utilisateur avec le même email/tenant
- ✅ La validité des capabilities et feature flags
- ✅ Les champs requis

En cas d'erreur, un message explicite est affiché.

### Notes importantes

1. **Tenant existant** : Si le tenant existe déjà, ses paramètres seront mis à jour
2. **Utilisateur existant** : Le script échoue si un utilisateur avec le même email existe pour ce tenant
3. **ClientType Optician** : Ajoute automatiquement la capability `optics` et les feature flags optiques
4. **Mot de passe** : Hashé avec bcrypt avant stockage
5. **Rôle admin** : Tous les utilisateurs créés ont le rôle `admin` par défaut

### Ajout au package.json

Ajoutez ce script dans `backend/package.json` :

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

