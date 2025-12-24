import api from '../../../services/api';
import {
  ContactLensDesign,
  ContactLensType,
  FrameMaterial,
  FrameType,
  LensType,
  PrismBase,
} from '../types';

// Configuration Optique
export type OpticsConfig = {
  lensTypes?: LensType[] | string[];
  indices?: string[];
  treatments?: string[]; // ex: anti_reflect, uv_protect, blue_light, hard_coat
  frameTypes?: FrameType[] | string[];
  prismBases?: PrismBase[] | string[];
  frameMaterials?: FrameMaterial[] | string[];
};

export async function getOpticsConfig(): Promise<OpticsConfig> {
  const { data } = await api.get('/v1/optician/config');
  return data;
}

// API Optique – intégration prescriptions backend
export type OpticsRecordPayload = {
  clientId: string;
  // valeurs simples saisies dans l'UI actuelle
  sphereRight?: string | number;
  sphereLeft?: string | number;
  cylinderRight?: string | number;
  cylinderLeft?: string | number;
  axisRight?: string | number;
  axisLeft?: string | number;
  addRight?: string | number;
  addLeft?: string | number;
  prismRightValue?: string | number;
  prismRightBase?: PrismBase | string;
  prismLeftValue?: string | number;
  prismLeftBase?: PrismBase | string;
  ep?: string | number;
  add?: string;
  // paramètres lunettes (UI à venir – valeurs par défaut si non saisis)
  lensType?: LensType | string;
  index?: string;
  treatments?: string[];
  segmentHeight?: number;
  vertexDistance?: number;
  baseCurve?: number;
  frameType?: FrameType | string;
  frameEye?: number;
  frameBridge?: number;
  frameTemple?: number;
  frameMaterial?: string;
  // méta
  issuedAt?: string;
  expiresAt?: string;
  kind?: 'glasses' | 'contact_lens' | string;
  source?: 'manual' | 'import' | string;
  // contact lens (optionnel via UI)
  clType?: ContactLensType | string;
  clDesign?: ContactLensDesign | string;
  clAdd?: number | string;
  clToricCylinder?: number | string;
  clToricAxis?: number | string;
  clToricStabilisation?: 'prism' | 'dynamic' | string;
  clMaterialFamily?: 'hydrogel' | 'silicone_hydrogel' | string;
  clWaterContent?: number | string;
  clDkT?: number | string;
  clWear?: 'daily' | 'extended' | string;
  clReplacement?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | string;
  clBc?: number | string;
  clDia?: number | string;
  clOptions?: string[];
  clSolutionBrand?: string;
};

// Adaptateur conforme au contrat Swagger partagé par l'utilisateur
const toBackendPrescriptionPayload = (p: OpticsRecordPayload) => {
  const now = new Date();
  const oneYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const n = (v: any): number | undefined => {
    if (v === undefined || v === null || v === '') return undefined;
    const str = typeof v === 'string' ? v.replace(',', '.').trim() : v;
    const num = Number(str);
    return isNaN(num) ? undefined : num;
  };

  return {
    clientId: p.clientId,
    kind: (p.kind as any) || 'glasses',
    correction: {
      od: {
        sphere: n(p.sphereRight),
        cylinder: n(p.cylinderRight),
        axis: n(p.axisRight) ?? 0,
        add: n(p.addRight),
        prism: p.prismRightValue !== undefined || p.prismRightBase !== undefined
          ? { value: n(p.prismRightValue) ?? 0, base: (p.prismRightBase as any) || 'up' }
          : undefined,
      },
      og: {
        sphere: n(p.sphereLeft),
        cylinder: n(p.cylinderLeft),
        axis: n(p.axisLeft) ?? 0,
        add: n(p.addLeft),
        prism: p.prismLeftValue !== undefined || p.prismLeftBase !== undefined
          ? { value: n(p.prismLeftValue) ?? 0, base: (p.prismLeftBase as any) || 'up' }
          : undefined,
      }
    },
    glassesParams: {
      lensType: (p.lensType as LensType) || LensType.SingleVision,
      index: p.index || '1.50',
      treatments: p.treatments || [],
      ep: n(p.ep) ?? 0,
      segmentHeight: n(p.segmentHeight) ?? 0,
      vertexDistance: n(p.vertexDistance) ?? 0,
      baseCurve: n(p.baseCurve) ?? 0,
      frame: {
        type: (p.frameType as FrameType) || FrameType.FullRim,
        eye: n(p.frameEye) ?? 0,
        bridge: n(p.frameBridge) ?? 0,
        temple: n(p.frameTemple) ?? 0,
        material: p.frameMaterial || FrameMaterial.Acetate,
      }
    },
    // contactLensParams optionnel – inclus si des champs ont été saisis
    ...(p.clType || p.clDesign || p.clToricCylinder || p.clBc || p.clDia
      ? {
          contactLensParams: {
            type: (p.clType as ContactLensType) || ContactLensType.Soft,
            design: (p.clDesign as ContactLensDesign) || ContactLensDesign.Spherical,
            add: n(p.clAdd) ?? 0,
            toric: (p.clToricCylinder || p.clToricAxis || p.clToricStabilisation)
              ? {
                  cylinder: n(p.clToricCylinder) ?? 0,
                  axis: n(p.clToricAxis) ?? 180,
                  stabilisation: (p.clToricStabilisation as any) || 'prism',
                }
              : undefined,
            material: (p.clMaterialFamily || p.clWaterContent || p.clDkT)
              ? {
                  family: (p.clMaterialFamily as any) || 'hydrogel',
                  waterContent: n(p.clWaterContent) ?? 0,
                  dk_t: n(p.clDkT) ?? 0,
                }
              : undefined,
            schedule: (p.clWear || p.clReplacement)
              ? {
                  wear: (p.clWear as any) || 'daily',
                  replacement: (p.clReplacement as any) || 'daily',
                }
              : undefined,
            geometry: (p.clBc || p.clDia)
              ? {
                  bc: n(p.clBc) ?? 0,
                  dia: n(p.clDia) ?? 0,
                }
              : undefined,
            options: p.clOptions || [],
            care: p.clSolutionBrand ? { solutionBrand: p.clSolutionBrand } : undefined,
          },
        }
      : {}),
    issuedAt: p.issuedAt || now.toISOString(),
    expiresAt: p.expiresAt || oneYear.toISOString(),
    add: p.add || '',
    source: p.source || 'manual',
  };
};

// Construit un payload PATCH partiel en ne comprenant que les champs réellement présents
const toBackendPrescriptionPatch = (p: Partial<OpticsRecordPayload>) => {
  const body: any = {};

  const n = (v: any): number | undefined => {
    if (v === undefined || v === null || v === '') return undefined;
    const str = typeof v === 'string' ? v.replace(',', '.').trim() : v;
    const num = Number(str);
    return isNaN(num) ? undefined : num;
  };

  if (p.kind !== undefined) body.kind = p.kind;
  if (p.add !== undefined) body.add = p.add;
  if (p.issuedAt !== undefined) body.issuedAt = p.issuedAt;
  if (p.expiresAt !== undefined) body.expiresAt = p.expiresAt;
  if (p.source !== undefined) body.source = p.source;

  // correction
  const od: any = {};
  const og: any = {};
  {
    const v = n(p.sphereRight); if (p.sphereRight !== undefined && v !== undefined) od.sphere = v;
  }
  {
    const v = n(p.cylinderRight); if (p.cylinderRight !== undefined && v !== undefined) od.cylinder = v;
  }
  {
    const v = n(p.axisRight); if (p.axisRight !== undefined && v !== undefined) od.axis = v;
  }
  {
    const v = n(p.addRight); if (p.addRight !== undefined && v !== undefined) od.add = v;
  }
  if (p.prismRightValue !== undefined || p.prismRightBase !== undefined) {
    od.prism = { value: n(p.prismRightValue), base: p.prismRightBase || 'up' };
  }
  {
    const v = n(p.sphereLeft); if (p.sphereLeft !== undefined && v !== undefined) og.sphere = v;
  }
  {
    const v = n(p.cylinderLeft); if (p.cylinderLeft !== undefined && v !== undefined) og.cylinder = v;
  }
  {
    const v = n(p.axisLeft); if (p.axisLeft !== undefined && v !== undefined) og.axis = v;
  }
  {
    const v = n(p.addLeft); if (p.addLeft !== undefined && v !== undefined) og.add = v;
  }
  if (p.prismLeftValue !== undefined || p.prismLeftBase !== undefined) {
    og.prism = { value: n(p.prismLeftValue), base: p.prismLeftBase || 'up' };
  }
  if (Object.keys(od).length || Object.keys(og).length) {
    body.correction = {} as any;
    if (Object.keys(od).length) (body.correction as any).od = od;
    if (Object.keys(og).length) (body.correction as any).og = og;
  }

  // glassesParams
  const gp: any = {};
  if (p.lensType !== undefined) gp.lensType = p.lensType;
  if (p.index !== undefined) gp.index = p.index;
  if (p.treatments !== undefined) gp.treatments = p.treatments;
  { const v = n(p.ep); if (p.ep !== undefined && v !== undefined) gp.ep = v; }
  { const v = n(p.segmentHeight); if (p.segmentHeight !== undefined && v !== undefined) gp.segmentHeight = v; }
  { const v = n(p.vertexDistance); if (p.vertexDistance !== undefined && v !== undefined) gp.vertexDistance = v; }
  { const v = n(p.baseCurve); if (p.baseCurve !== undefined && v !== undefined) gp.baseCurve = v; }
  const frame: any = {};
  if (p.frameType !== undefined) frame.type = p.frameType;
  { const v = n(p.frameEye); if (p.frameEye !== undefined && v !== undefined) frame.eye = v; }
  { const v = n(p.frameBridge); if (p.frameBridge !== undefined && v !== undefined) frame.bridge = v; }
  { const v = n(p.frameTemple); if (p.frameTemple !== undefined && v !== undefined) frame.temple = v; }
  if (p.frameMaterial !== undefined) frame.material = p.frameMaterial;
  if (Object.keys(frame).length) gp.frame = frame;
  if (Object.keys(gp).length) body.glassesParams = gp;

  // contactLensParams (optionnel)
  const cl: any = {};
  if (p.clType !== undefined) cl.type = p.clType;
  if (p.clDesign !== undefined) cl.design = p.clDesign;
  if (p.clAdd !== undefined) cl.add = n(p.clAdd);
  if (p.clToricCylinder !== undefined || p.clToricAxis !== undefined || p.clToricStabilisation !== undefined) {
    cl.toric = {
      ...(p.clToricCylinder !== undefined ? { cylinder: n(p.clToricCylinder) } : {}),
      ...(p.clToricAxis !== undefined ? { axis: n(p.clToricAxis) } : {}),
      ...(p.clToricStabilisation !== undefined ? { stabilisation: p.clToricStabilisation } : {}),
    };
  }
  if (p.clMaterialFamily !== undefined || p.clWaterContent !== undefined || p.clDkT !== undefined) {
    cl.material = {
      ...(p.clMaterialFamily !== undefined ? { family: p.clMaterialFamily } : {}),
      ...(p.clWaterContent !== undefined ? { waterContent: n(p.clWaterContent) } : {}),
      ...(p.clDkT !== undefined ? { dk_t: n(p.clDkT) } : {}),
    };
  }
  if (p.clWear !== undefined || p.clReplacement !== undefined) {
    cl.schedule = {
      ...(p.clWear !== undefined ? { wear: p.clWear } : {}),
      ...(p.clReplacement !== undefined ? { replacement: p.clReplacement } : {}),
    };
  }
  if (p.clBc !== undefined || p.clDia !== undefined) {
    cl.geometry = {
      ...(p.clBc !== undefined ? { bc: n(p.clBc) } : {}),
      ...(p.clDia !== undefined ? { dia: n(p.clDia) } : {}),
    };
  }
  if (p.clOptions !== undefined) cl.options = p.clOptions;
  if (p.clSolutionBrand !== undefined) cl.care = { solutionBrand: p.clSolutionBrand };
  if (Object.keys(cl).length) body.contactLensParams = cl;

  return body;
};

export async function listOpticsRecords(clientId?: string) {
  const { data } = await api.get('/v1/optician/prescriptions', {
    params: clientId ? { clientId } : undefined,
  });
  return data;
}

export async function createOpticsRecord(payload: OpticsRecordPayload) {
  const backendPayload = toBackendPrescriptionPayload(payload);
  const { data } = await api.post('/v1/optician/prescriptions', backendPayload);
  return data; // { id, ... }
}

export async function updateOpticsRecord(id: string, payload: Partial<OpticsRecordPayload>) {
  // PATCH partiel: n'envoyer que les champs modifiés
  const backendPayload = toBackendPrescriptionPatch(payload);
  const { data } = await api.patch(`/v1/optician/prescriptions/${id}`, backendPayload);
  return data;
}

export async function getOpticsRecord(id: string) {
  const { data } = await api.get(`/v1/optician/prescriptions/${id}`);
  return data;
}

export async function deleteOpticsRecord(id: string) {
  const { data } = await api.delete(`/v1/optician/prescriptions/${id}`);
  return data;
}

