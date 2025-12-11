import { PdValue } from '../types';

/**
 * Convertit une valeur PD en string pour l'affichage
 * @param pd - La valeur PD (string, number, ou object)
 * @returns La représentation string de PD
 */
export const formatPd = (pd: PdValue | undefined): string => {
  if (!pd) return '';
  if (typeof pd === 'string') return pd;
  if (typeof pd === 'number') return pd.toString();
  if (typeof pd === 'object' && pd !== null && 'mono' in pd) {
    return `${pd.mono.od}/${pd.mono.og}${pd.near ? ` + ${pd.near}` : ''}`;
  }
  return '';
};

/**
 * Parse une valeur PD string en objet si nécessaire
 * @param pdString - La valeur PD en string
 * @returns La valeur PD parsée
 */
export const parsePd = (pdString: string): string | number | { mono: { od: number; og: number }; near?: number } | undefined => {
  if (!pdString || pdString.trim() === '') return undefined;
  
  // Si c'est un nombre simple
  const numericMatch = pdString.match(/^\d+$/);
  if (numericMatch) {
    return Number(pdString);
  }
  
  // Si c'est un format objet : "32/30" ou "32/30 +2"
  if (pdString.includes('/')) {
    const parts = pdString.split('+');
    const mono = parts[0].trim();
    const [od, og] = mono.split('/').map(Number);
    const near = parts[1] ? Number(parts[1].trim()) : undefined;
    
    if (!isNaN(od) && !isNaN(og)) {
      return { mono: { od, og }, near };
    }
  }
  
  // Sinon, retourner comme string
  return pdString;
};

/**
 * Convertit une valeur PD en string pour le formulaire
 * Utile pour l'affichage dans les inputs
 */
export const convertPdToString = (pd: PdValue | undefined): string => {
  return formatPd(pd);
};
