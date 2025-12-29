import { OpticsInvoiceCreatePayload, OpticsInvoiceUpdatePayload } from '../api/opticsInvoices.api';
import { Invoice } from '../types';

/**
 * Parse les notes de facture pour extraire les données de correction optique
 */
function parseCorrectionFromNotes(notes?: string): {
  rightEye?: { sphere?: number; cylinder?: number; axis?: number; add?: number };
  leftEye?: { sphere?: number; cylinder?: number; axis?: number; add?: number };
  ep?: number | { mono: { od: number; og: number }; near?: number };
} | null {
  if (!notes) return null;

  // Format attendu: "Correction: OD sphere cylinder axis / OG sphere cylinder axis - PD: value"
  // ou "Correction: OD sphere cylinder axis / OG sphere cylinder axis - PD: mono: od/og + near"
  const odMatch = notes.match(/OD\s+([-\d.]+(?:\s+[-\d.]+)?(?:\s+\d+)?)/i);
  const ogMatch = notes.match(/OG\s+([-\d.]+(?:\s+[-\d.]+)?(?:\s+\d+)?)/i);
  const epMatch = notes.match(/EP:\s*(.+?)(?:\s|$)/i);

  const parseEye = (match: RegExpMatchArray | null): { sphere?: number; cylinder?: number; axis?: number; add?: number } | undefined => {
    if (!match) return undefined;
    const parts = match[1].trim().split(/\s+/);
    return {
      sphere: parts[0] ? parseFloat(parts[0]) : undefined,
      cylinder: parts[1] ? parseFloat(parts[1]) : undefined,
      axis: parts[2] ? parseFloat(parts[2]) : undefined,
      add: parts[3] ? parseFloat(parts[3]) : undefined,
    };
  };

  const parseEp = (epStr?: string): number | { mono: { od: number; og: number }; near?: number } | undefined => {
    if (!epStr) return undefined;
    const trimmed = epStr.trim();
    
    // Format "mono: od/og + near" ou "mono: od/og"
    const monoMatch = trimmed.match(/mono:\s*([\d.]+)\/([\d.]+)(?:\s+\+\s*([\d.]+))?/i);
    if (monoMatch) {
      return {
        mono: {
          od: parseFloat(monoMatch[1]),
          og: parseFloat(monoMatch[2]),
        },
        near: monoMatch[3] ? parseFloat(monoMatch[3]) : undefined,
      };
    }
    
    // Format numérique simple
    const num = parseFloat(trimmed);
    if (!isNaN(num)) return num;
    
    return undefined;
  };

  const rightEye = parseEye(odMatch);
  const leftEye = parseEye(ogMatch);
  const ep = parseEp(epMatch?.[1]);

  if (!rightEye && !leftEye && !ep) return null;

  return { rightEye, leftEye, ep };
}

/**
 * Transforme les données d'une facture en payload pour la création d'une facture optique
 * @throws {Error} Si aucun clientId valide n'est fourni
 */
export function transformToCreatePayload(invoiceData: Partial<Invoice>, clientId: string): OpticsInvoiceCreatePayload {
  // Valider que nous avons un clientId valide
  const finalClientId = invoiceData.client?.id || clientId;
  if (!finalClientId || finalClientId === 'temp') {
    throw new Error('Un client valide doit être sélectionné pour créer une facture');
  }

  const correctionData = parseCorrectionFromNotes(invoiceData.notes);
  
  // Créer le prescriptionSnapshot si des données de correction sont disponibles
  const prescriptionSnapshot = correctionData ? {
    kind: 'glasses' as const,
    correction: {
      od: {
        sphere: correctionData.rightEye?.sphere ?? null,
        cylinder: correctionData.rightEye?.cylinder ?? null,
        axis: correctionData.rightEye?.axis ?? null,
        add: correctionData.rightEye?.add ?? null,
        prism: null,
      },
      og: {
        sphere: correctionData.leftEye?.sphere ?? null,
        cylinder: correctionData.leftEye?.cylinder ?? null,
        axis: correctionData.leftEye?.axis ?? null,
        add: correctionData.leftEye?.add ?? null,
        prism: null,
      },
    },
    glassesParams: {
      // Données basiques - peuvent être enrichies depuis les items si nécessaire
      lensType: 'single_vision', // Par défaut
      index: '1.60', // Par défaut
      treatments: ['anti_reflect'], // Par défaut
      ep: correctionData.ep,
    },
    issuedAt: invoiceData.issuedAt ? new Date(invoiceData.issuedAt).toISOString() : undefined,
  } : undefined;

  return {
    clientId: finalClientId,
    type: 'InvoiceClient' as const,
    totalAmount: invoiceData.total || 0,
    currency: invoiceData.currency || 'EUR',
    notes: {
      reason: 'Facture optique',
      comment: invoiceData.notes || '',
    },
    items: (invoiceData.items || []).map(item => ({
      id: item.id || Date.now().toString(),
      name: item.name || item.description || '',
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      category: (item.description?.includes('Monture') || item.name?.includes('Monture') ? 'frame' : 'lens') as 'frame' | 'lens',
    })),
    prescriptionSnapshot,
    // Rétrocompatibilité avec l'ancien format
    prescriptionData: correctionData ? {
      rightEye: {
        sphere: correctionData.rightEye?.sphere ?? 0,
        cylinder: correctionData.rightEye?.cylinder ?? 0,
        axis: correctionData.rightEye?.axis ?? 0,
        add: correctionData.rightEye?.add ?? 0,
      },
      leftEye: {
        sphere: correctionData.leftEye?.sphere ?? 0,
        cylinder: correctionData.leftEye?.cylinder ?? 0,
        axis: correctionData.leftEye?.axis ?? 0,
        add: correctionData.leftEye?.add ?? 0,
      },
      ep: correctionData.ep ?? 0,
    } : undefined,
  };
}

/**
 * Transforme les données d'une facture en payload pour la mise à jour d'une facture optique
 */
export function transformToUpdatePayload(
  invoiceData: Partial<Invoice>,
  currentInvoice: Invoice
): OpticsInvoiceUpdatePayload {
  // Valider que nous avons un clientId valide
  const finalClientId = invoiceData.client?.id || currentInvoice.client?.id;
  if (!finalClientId || finalClientId === 'temp') {
    throw new Error('Un client valide doit être sélectionné pour mettre à jour une facture');
  }

  return {
    clientId: finalClientId,
    type: 'InvoiceClient' as const, // Préserver le type InvoiceClient lors de la mise à jour
    totalAmount: invoiceData.total || currentInvoice.total || 0,
    currency: invoiceData.currency || currentInvoice.currency || 'EUR',
    notes: {
      reason: 'Facture optique',
      comment: invoiceData.notes || currentInvoice.notes || '',
    },
    items: (invoiceData.items || currentInvoice.items || []).map(item => ({
      id: item.id || Date.now().toString(),
      name: item.name || item.description || '',
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      category: (item.description?.includes('Monture') || item.name?.includes('Monture') ? 'frame' : 'lens') as 'frame' | 'lens',
    })),
  };
}

/**
 * Enrichit une facture créée avec les données du formulaire
 */
export function enrichInvoiceWithFormData(
  newInvoice: Invoice,
  invoiceData: Partial<Invoice>
): Invoice {
  return {
    ...newInvoice,
    items: invoiceData.items || newInvoice.items || [],
    number: invoiceData.number || newInvoice.number,
    issuedAt: invoiceData.issuedAt || newInvoice.issuedAt,
    notes: invoiceData.notes || newInvoice.notes,
    // Conserver le client depuis invoiceData si disponible
    client: invoiceData.client || newInvoice.client,
  };
}

