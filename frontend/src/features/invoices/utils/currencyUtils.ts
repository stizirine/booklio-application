// Utilitaires pour la gestion des devises selon le pays

import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';

/**
 * Obtient le symbole d'une devise
 * @param currencyCode - Code devise (ex: EUR, USD, MAD)
 * @returns Le symbole de la devise ou le code si non trouvé
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.value === currencyCode);
  return currency?.symbol || currencyCode;
}

/**
 * Mapping des pays vers leurs devises par défaut
 * Format: code ISO du pays (2 lettres) -> code devise (3 lettres)
 */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Europe
  FR: 'EUR', // France
  BE: 'EUR', // Belgique
  DE: 'EUR', // Allemagne
  ES: 'EUR', // Espagne
  IT: 'EUR', // Italie
  NL: 'EUR', // Pays-Bas
  PT: 'EUR', // Portugal
  AT: 'EUR', // Autriche
  GR: 'EUR', // Grèce
  IE: 'EUR', // Irlande
  LU: 'EUR', // Luxembourg
  FI: 'EUR', // Finlande
  
  // Royaume-Uni
  GB: 'GBP', // Royaume-Uni
  UK: 'GBP', // Alias
  
  // Amérique du Nord
  US: 'USD', // États-Unis
  CA: 'CAD', // Canada
  
  // Suisse
  CH: 'CHF', // Suisse
  
  // Maroc
  MA: 'MAD', // Maroc
  
  // Autres pays (par défaut EUR)
};

/**
 * Extrait le code pays d'une adresse (recherche de codes pays à 2 lettres)
 * @param address - L'adresse complète
 * @returns Le code pays en majuscules ou null si non trouvé
 */
export function extractCountryCodeFromAddress(address?: string): string | null {
  if (!address) return null;
  
  // Recherche de codes pays à 2 lettres en majuscules
  const countryCodePattern = /\b([A-Z]{2})\b/g;
  const matches = address.match(countryCodePattern);
  
  if (matches) {
    // Prendre le dernier match (généralement le pays est à la fin de l'adresse)
    const lastMatch = matches[matches.length - 1];
    if (COUNTRY_TO_CURRENCY[lastMatch]) {
      return lastMatch;
    }
  }
  
  // Recherche de noms de pays courants dans l'adresse
  const countryNames: Record<string, string> = {
    'france': 'FR',
    'french': 'FR',
    'belgique': 'BE',
    'belgium': 'BE',
    'allemagne': 'DE',
    'germany': 'DE',
    'espagne': 'ES',
    'spain': 'ES',
    'italie': 'IT',
    'italy': 'IT',
    'royaume-uni': 'GB',
    'united kingdom': 'GB',
    'uk': 'GB',
    'etats-unis': 'US',
    'united states': 'US',
    'usa': 'US',
    'canada': 'CA',
    'suisse': 'CH',
    'switzerland': 'CH',
    'maroc': 'MA',
    'morocco': 'MA',
  };
  
  const lowerAddress = address.toLowerCase();
  for (const [name, code] of Object.entries(countryNames)) {
    if (lowerAddress.includes(name)) {
      return code;
    }
  }
  
  return null;
}

/**
 * Détermine la devise selon le pays du client
 * @param countryCode - Code pays (2 lettres) ou null
 * @param address - Adresse du client (utilisée si countryCode n'est pas fourni)
 * @returns Le code devise (3 lettres)
 */
export function getCurrencyByCountry(
  countryCode?: string | null,
  address?: string | null
): string {
  // Si un code pays est fourni directement
  if (countryCode) {
    const upperCode = countryCode.toUpperCase();
    if (COUNTRY_TO_CURRENCY[upperCode]) {
      return COUNTRY_TO_CURRENCY[upperCode];
    }
  }
  
  // Sinon, essayer d'extraire le pays de l'adresse
  if (address) {
    const extractedCode = extractCountryCodeFromAddress(address);
    if (extractedCode && COUNTRY_TO_CURRENCY[extractedCode]) {
      return COUNTRY_TO_CURRENCY[extractedCode];
    }
  }
  
  // Par défaut, retourner la devise par défaut
  return DEFAULT_CURRENCY;
}

/**
 * Obtient la devise pour un client
 * @param client - Objet client avec address
 * @returns Le code devise (3 lettres)
 */
export function getCurrencyForClient(client?: {
  address?: string | null;
} | null): string {
  if (!client) return DEFAULT_CURRENCY;
  
  // Extraire le pays depuis l'adresse si disponible
  return getCurrencyByCountry(null, client.address);
}

