// Types unifiés pour le module Optique

export type OpticsRecord = {
  id: string;
  clientId?: string;
  createdAt: string;
  updatedAt?: string;
  sphereRight?: string;
  sphereLeft?: string;
  cylinderRight?: string;
  cylinderLeft?: string;
  axisRight?: string;
  axisLeft?: string;
  ep?: string | number | EpValue;
  add?: string;
  // Paramètres lunettes
  lensType?: string;
  index?: string;
  treatments?: string[];
  segmentHeight?: string | number;
  vertexDistance?: string | number;
  baseCurve?: string | number;
  frameType?: string;
  frameEye?: string | number;
  frameBridge?: string | number;
  frameTemple?: string | number;
  frameMaterial?: string;
  // Paramètres lentilles
  kind?: 'glasses' | 'contact_lens';
};

// Type pour la valeur EP (peut être simple ou structurée)
export type EpValue = string | number | { mono: { od: number; og: number }; near?: number };

// Types pour les formulaires
export interface OpticsFormData extends Omit<OpticsRecord, 'id' | 'clientId' | 'createdAt' | 'updatedAt'> {
  ep?: string | EpValue;
}

// Enums pour les traitements de verres
export enum GlassesTreatment {
  AntiReflect = 'anti_reflect',
  AntiScratch = 'anti_scratch',
  UVProtect = 'uv_protect',
  BlueLight = 'blue_light',
  HardCoat = 'hard_coat',
}

export const GLASSES_TREATMENTS: GlassesTreatment[] = [
  GlassesTreatment.AntiReflect,
  GlassesTreatment.AntiScratch,
  GlassesTreatment.UVProtect,
  GlassesTreatment.BlueLight,
  GlassesTreatment.HardCoat,
];

// Enums pour config / payloads
export enum LensType {
  SingleVision = 'single_vision',
  Bifocal = 'bifocal',
  Progressive = 'progressive',
}

export enum FrameType {
  FullRim = 'full_rim',
  SemiRim = 'semi_rim',
  Rimless = 'rimless',
}

export enum FrameMaterial {
  Acetate = 'acetate',
  Metal = 'metal',
  Titanium = 'titanium',
  TR90 = 'tr90',
  Carbon = 'carbon',
  Wood = 'wood',
}

export enum PrismBase {
  Up = 'up',
  Down = 'down',
  In = 'in',
  Out = 'out',
}

export enum ContactLensType {
  Soft = 'soft',
  Rigid = 'rigid',
}

export enum ContactLensDesign {
  Spherical = 'spherical',
  Toric = 'toric',
  Multifocal = 'multifocal',
}

export enum WearSchedule {
  Daily = 'daily',
  Extended = 'extended',
}

export enum ReplacementSchedule {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

export default OpticsRecord;
