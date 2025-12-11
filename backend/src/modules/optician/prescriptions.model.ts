import mongoose, { Schema, type Model } from 'mongoose';

import {
  ContactType,
  DesignType,
  FrameMaterial,
  FrameType,
  LensIndex,
  LensType,
  MaterialFamily,
  PrismBase,
  ReplacementType,
  StabilisationType,
  Treatment,
  WearType,
} from './enums.js';

export interface PrismValue {
  value?: number | null;
  base?: PrismBase | null;
}

export interface EyeCorrection {
  sphere?: number | null;
  cylinder?: number | null;
  axis?: number | null; // 0-180
  add?: number | null;
  prism?: PrismValue | null;
}

export interface GlassesParams {
  lensType: LensType;
  index: LensIndex;
  treatments?: Array<Treatment>;
  pd?: number | { mono: { od: number; og: number }; near?: number };
  segmentHeight?: number;
  vertexDistance?: number;
  baseCurve?: number;
  frame?: {
    type: FrameType;
    eye: number;
    bridge: number;
    temple: number;
    material?: FrameMaterial;
  };
}

export interface ContactLensParams {
  type: ContactType;
  design: DesignType;
  add?: number;
  toric?: { cylinder: number; axis: number; stabilisation?: StabilisationType };
  material: { family: MaterialFamily; waterContent?: number; dk_t?: number };
  schedule: { wear: WearType; replacement: ReplacementType };
  geometry: { bc: number; dia: number };
  options?: Array<'tint' | 'uv'>;
  care?: { solutionBrand?: string };
}

export interface OpticalPrescriptionDoc {
  tenantId: string;
  clientId: string;
  kind: 'glasses' | 'contacts';
  correction: { od: EyeCorrection; og: EyeCorrection };
  glassesParams?: GlassesParams;
  contactLensParams?: ContactLensParams;
  issuedAt: Date;
  expiresAt?: Date | null;
  notes?: string | null;
  source?: 'manual' | 'ocr';
  createdAt: Date;
  updatedAt: Date;
}

const prismSchema = new Schema<PrismValue>(
  {
    value: { type: Number, required: false, default: null },
    base: { type: String, enum: Object.values(PrismBase), required: false, default: null },
  },
  { _id: false }
);

const eyeCorrectionSchema = new Schema<EyeCorrection>(
  {
    sphere: { type: Number, required: false, default: null, min: -20, max: 20 },
    cylinder: { type: Number, required: false, default: null, min: -20, max: 20 },
    axis: { type: Number, required: false, default: null, min: 0, max: 180 },
    add: { type: Number, required: false, default: null, min: -10, max: 10 },
    prism: { type: prismSchema, required: false, default: null },
  },
  { _id: false }
);

const glassesParamsSchema = new Schema<GlassesParams>(
  {
    lensType: { type: String, enum: Object.values(LensType), required: true },
    index: { type: String, enum: Object.values(LensIndex), required: true },
    treatments: {
      type: [String],
      enum: Object.values(Treatment),
      required: false,
      default: [],
    },
    pd: { type: Schema.Types.Mixed, required: false },
    segmentHeight: { type: Number, required: false },
    vertexDistance: { type: Number, required: false },
    baseCurve: { type: Number, required: false },
    frame: {
      type: new Schema(
        {
          type: { type: String, enum: Object.values(FrameType), required: true },
          eye: { type: Number, required: true },
          bridge: { type: Number, required: true },
          temple: { type: Number, required: true },
          material: { type: String, enum: Object.values(FrameMaterial), required: false },
        },
        { _id: false }
      ),
      required: false,
    },
  },
  { _id: false }
);

const contactLensParamsSchema = new Schema<ContactLensParams>(
  {
    type: { type: String, enum: Object.values(ContactType), required: true },
    design: { type: String, enum: Object.values(DesignType), required: true },
    add: { type: Number, required: false },
    toric: {
      type: new Schema(
        {
          cylinder: { type: Number, required: true },
          axis: { type: Number, required: true, min: 0, max: 180 },
          stabilisation: { type: String, enum: Object.values(StabilisationType), required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    material: {
      type: new Schema(
        {
          family: { type: String, enum: Object.values(MaterialFamily), required: true },
          waterContent: { type: Number, required: false },
          dk_t: { type: Number, required: false },
        },
        { _id: false }
      ),
      required: true,
    },
    schedule: {
      type: new Schema(
        {
          wear: { type: String, enum: Object.values(WearType), required: true },
          replacement: { type: String, enum: Object.values(ReplacementType), required: true },
        },
        { _id: false }
      ),
      required: true,
    },
    geometry: {
      type: new Schema(
        {
          bc: { type: Number, required: true },
          dia: { type: Number, required: true },
        },
        { _id: false }
      ),
      required: true,
    },
    options: { type: [String], enum: ['tint', 'uv'], required: false, default: [] },
    care: {
      type: new Schema({ solutionBrand: { type: String } }, { _id: false }),
      required: false,
    },
  },
  { _id: false }
);

const schema = new Schema<OpticalPrescriptionDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    kind: { type: String, enum: ['glasses', 'contacts'], required: true },
    correction: {
      type: new Schema(
        {
          od: { type: eyeCorrectionSchema, required: true },
          og: { type: eyeCorrectionSchema, required: true },
        },
        { _id: false }
      ),
      required: true,
    },
    glassesParams: { type: glassesParamsSchema, required: false },
    contactLensParams: { type: contactLensParamsSchema, required: false },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: false, default: null },
    notes: { type: String, required: false, default: null },
    source: { type: String, enum: ['manual', 'ocr'], required: false },
  },
  { timestamps: true }
);

export const OpticalPrescription: Model<OpticalPrescriptionDoc> =
  (mongoose.models.OpticalPrescription as Model<OpticalPrescriptionDoc>) ||
  mongoose.model<OpticalPrescriptionDoc>('OpticalPrescription', schema);
