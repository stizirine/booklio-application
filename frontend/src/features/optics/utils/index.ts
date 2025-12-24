import { EpValue } from '../types';

/**
 * Convertit une valeur EP en string pour l'affichage
 * @param ep - La valeur EP (string, number, ou object)
 * @returns La représentation string de EP
 */
export const formatEp = (ep: EpValue | undefined): string => {
  if (!ep) return '';
  if (typeof ep === 'string') return ep;
  if (typeof ep === 'number') return ep.toString();
  if (typeof ep === 'object' && ep !== null && 'mono' in ep) {
    return `${ep.mono.od}/${ep.mono.og}${ep.near ? ` + ${ep.near}` : ''}`;
  }
  return '';
};

/**
 * Parse une valeur EP string en objet si nécessaire
 * @param epString - La valeur EP en string
 * @returns La valeur EP parsée
 */
export const parseEp = (epString: string): string | number | { mono: { od: number; og: number }; near?: number } | undefined => {
  if (!epString || epString.trim() === '') return undefined;
  
  // Si c'est un nombre simple
  const numericMatch = epString.match(/^\d+$/);
  if (numericMatch) {
    return Number(epString);
  }
  
  // Si c'est un format objet : "32/30" ou "32/30 +2"
  if (epString.includes('/')) {
    const parts = epString.split('+');
    const mono = parts[0].trim();
    const [od, og] = mono.split('/').map(Number);
    const near = parts[1] ? Number(parts[1].trim()) : undefined;
    
    if (!isNaN(od) && !isNaN(og)) {
      return { mono: { od, og }, near };
    }
  }
  
  // Sinon, retourner comme string
  return epString;
};

/**
 * Convertit une valeur EP en string pour le formulaire
 * Utile pour l'affichage dans les inputs
 */
export const convertEpToString = (ep: EpValue | undefined): string => {
  return formatEp(ep);
};
