/**
 * Helper pour charger les variables d'environnement depuis la racine du projet
 * selon l'environnement (dev, prod, rec)
 * 
 * Usage dans les scripts:
 *   import './load-env.js';
 */
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

// Trouver la racine du projet (dossier parent de backend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Déterminer quel fichier .env charger
const env = process.env.NODE_ENV || process.env.ENV || 'dev';
let envFile = '.env';

if (env === 'production' || env === 'prod') {
  envFile = '.env';
} else if (env === 'recette' || env === 'rec') {
  envFile = '.env.rec';
} else if (env === 'development' || env === 'dev') {
  envFile = '.env.dev';
}

// Charger le fichier d'environnement depuis la racine
const envPath = path.join(projectRoot, envFile);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Fichier ${envFile} non trouvé à la racine, utilisation des variables d'environnement système`);
} else {
  console.log(`✓ Variables d'environnement chargées depuis ${envFile}`);
}

// Fallback: charger aussi .env si ce n'est pas déjà fait
if (envFile !== '.env') {
  dotenv.config({ path: path.join(projectRoot, '.env'), override: false });
}

// Charger .env.local en dernière priorité (surcharge les autres)
const envLocalPath = path.join(projectRoot, '.env.local');
const localResult = dotenv.config({ path: envLocalPath, override: true });
if (!localResult.error) {
  console.log(`✓ Variables locales chargées depuis .env.local`);
}

