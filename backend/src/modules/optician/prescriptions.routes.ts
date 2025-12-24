import { Router, type Response } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthenticatedRequest } from '../../middlewares/requireAuth.js';
import { requireModule } from '../../middlewares/resolveTenant.js';
import { Capability } from '../tenants/types.js';

import {
  ContactType,
  DesignType,
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
import {
  createErrorResponse,
  handleDatabaseError,
  handleValidationError,
  OpticianErrors,
} from './errors.js';
import { OpticalPrescription } from './prescriptions.model.js';

export const prescriptionsRouter = Router();

const PrismBaseSchema = z.enum(Object.values(PrismBase) as [string, ...string[]]);
const PrismSchema = z.object({
  value: z.number().nullable().optional(),
  base: PrismBaseSchema.nullable().optional(),
});

const EyeCorrectionSchema = z.object({
  sphere: z.number().min(-20).max(20).nullable().optional(),
  cylinder: z.number().min(-20).max(20).nullable().optional(),
  axis: z.number().min(0).max(180).nullable().optional(),
  add: z.number().min(-10).max(10).nullable().optional(),
  prism: PrismSchema.nullable().optional(),
});

const LensTypeSchema = z.enum(Object.values(LensType) as [string, ...string[]]);
const LensIndexSchema = z.enum(Object.values(LensIndex) as [string, ...string[]]);
const TreatmentSchema = z.enum(Object.values(Treatment) as [string, ...string[]]);
const FrameTypeSchema = z.enum(Object.values(FrameType) as [string, ...string[]]);
const FrameSchema = z.object({
  type: FrameTypeSchema,
  eye: z.number(),
  bridge: z.number(),
  temple: z.number(),
  material: z.string().optional(),
});

const GlassesParamsSchema = z.object({
  lensType: LensTypeSchema,
  index: LensIndexSchema,
  treatments: z.array(TreatmentSchema).optional().default([]),
  ep: z
    .union([
      z.number(),
      z.object({ mono: z.object({ od: z.number(), og: z.number() }), near: z.number().optional() }),
    ])
    .optional(),
  segmentHeight: z.number().optional(),
  vertexDistance: z.number().optional(),
  baseCurve: z.number().optional(),
  frame: FrameSchema.optional(),
});

const ContactTypeSchema = z.enum(Object.values(ContactType) as [string, ...string[]]);
const DesignTypeSchema = z.enum(Object.values(DesignType) as [string, ...string[]]);
const StabilisationTypeSchema = z.enum(Object.values(StabilisationType) as [string, ...string[]]);
const WearTypeSchema = z.enum(Object.values(WearType) as [string, ...string[]]);
const ReplacementTypeSchema = z.enum(Object.values(ReplacementType) as [string, ...string[]]);
const MaterialFamilySchema = z.enum(Object.values(MaterialFamily) as [string, ...string[]]);
const ContactLensParamsSchema = z
  .object({
    type: ContactTypeSchema,
    design: DesignTypeSchema,
    add: z.number().optional(),
    toric: z
      .object({
        cylinder: z.number(),
        axis: z.number().min(0).max(180),
        stabilisation: StabilisationTypeSchema.optional(),
      })
      .optional(),
    material: z
      .object({
        family: MaterialFamilySchema,
        waterContent: z.number().optional(),
        dk_t: z.number().optional(),
      })
      .optional(),
    schedule: z
      .object({
        wear: WearTypeSchema,
        replacement: ReplacementTypeSchema,
      })
      .optional(),
    geometry: z.object({ bc: z.number(), dia: z.number() }).optional(),
    options: z
      .array(z.enum(['tint', 'uv']))
      .optional()
      .default([]),
    care: z.object({ solutionBrand: z.string().optional() }).optional(),
  })
  .partial();

const CreateSchema = z.object({
  clientId: z.string().min(1),
  kind: z.enum(['glasses', 'contacts']),
  correction: z.object({ od: EyeCorrectionSchema, og: EyeCorrectionSchema }),
  glassesParams: GlassesParamsSchema.optional(),
  contactLensParams: ContactLensParamsSchema.optional(),
  issuedAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
  expiresAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  add: z.string().nullable().optional(),
  source: z.enum(['manual', 'ocr']).optional(),
});

// Update: autoriser des modifications partielles profondes (nested partial)
const EyeCorrectionUpdateSchema = EyeCorrectionSchema.partial();
const CorrectionUpdateSchema = z
  .object({
    od: EyeCorrectionUpdateSchema.optional(),
    og: EyeCorrectionUpdateSchema.optional(),
  })
  .partial();
const GlassesParamsUpdateSchema = GlassesParamsSchema.extend({
  frame: FrameSchema.partial().optional(),
}).partial();
const ContactLensParamsUpdateSchema = ContactLensParamsSchema.partial();

const UpdateSchema = z.object({
  clientId: z.string().min(1).optional(),
  kind: z.enum(['glasses', 'contacts']).optional(),
  correction: CorrectionUpdateSchema.optional(),
  glassesParams: GlassesParamsUpdateSchema.optional(),
  contactLensParams: ContactLensParamsUpdateSchema.optional(),
  issuedAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .optional(),
  expiresAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  add: z.string().nullable().optional(),
  source: z.enum(['manual', 'ocr']).optional(),
});

function flattenForSet(obj: unknown, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === undefined) continue; // ignore undefined to avoid resets
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, flattenForSet(v, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

prescriptionsRouter.post(
  '/',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const parsed = CreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
      const doc = await OpticalPrescription.create({ tenantId: current.tenantId, ...parsed.data });
      return res.status(201).json({ prescription: doc });
    } catch (error) {
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

prescriptionsRouter.get(
  '/',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const clientId = (req.query.clientId as string | undefined) || undefined;
      const filter: Record<string, unknown> = { tenantId: current.tenantId };
      if (clientId) filter.clientId = clientId;
      const items = await OpticalPrescription.find(filter).sort('-issuedAt');
      return res.json({ items });
    } catch (error) {
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

prescriptionsRouter.get(
  '/:id',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const item = await OpticalPrescription.findOne({
        _id: req.params.id,
        tenantId: current.tenantId,
      });
      if (!item)
        return res.status(404).json(createErrorResponse(OpticianErrors.PRESCRIPTION_NOT_FOUND));
      return res.json({ prescription: item });
    } catch (error) {
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

prescriptionsRouter.patch(
  '/:id',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const parsed = UpdateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(handleValidationError(parsed.error));
      const $set = flattenForSet(parsed.data);
      const updated = await OpticalPrescription.findOneAndUpdate(
        { _id: req.params.id, tenantId: current.tenantId },
        { $set },
        { new: true, runValidators: true }
      );
      if (!updated)
        return res.status(404).json(createErrorResponse(OpticianErrors.PRESCRIPTION_NOT_FOUND));
      return res.json({ prescription: updated });
    } catch (error) {
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

prescriptionsRouter.delete(
  '/:id',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const deleted = await OpticalPrescription.findOneAndDelete({
        _id: req.params.id,
        tenantId: current.tenantId,
      });
      if (!deleted)
        return res.status(404).json(createErrorResponse(OpticianErrors.PRESCRIPTION_NOT_FOUND));
      return res.json({ ok: true });
    } catch (error) {
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);
