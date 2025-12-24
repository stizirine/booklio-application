import { Router, type Response } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthenticatedRequest } from '../../middlewares/requireAuth.js';
import { requireModule } from '../../middlewares/resolveTenant.js';
import { Capability } from '../tenants/types.js';

import { configRouter } from './config.routes.js';
import { handleDatabaseError, handleNotFoundError, handleValidationError } from './errors.js';
import { EyeMeasurementSet } from './model.js';
import { prescriptionsRouter } from './prescriptions.routes.js';

export const router = Router();
router.use('/prescriptions', prescriptionsRouter);
router.use('/config', configRouter);

const EyeValuesSchema = z.object({
  sphere: z.number().min(-20).max(20).nullable().optional(),
  cylinder: z.number().min(-20).max(20).nullable().optional(),
  axis: z.number().min(0).max(180).nullable().optional(),
  add: z.number().min(-10).max(10).nullable().optional(),
});

const createSchema = z.object({
  clientId: z.string().min(1),
  measuredAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
  receivedAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  source: z.enum(['manual', 'ocr']).optional(),
  nextRenewalAt: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  notes: z.string().nullable().optional(),
  observation: z.string().nullable().optional(),
  ep: z.number().min(40).max(80).nullable().optional(),
  od: EyeValuesSchema,
  og: EyeValuesSchema,
});

const updateSchema = createSchema.partial();

// Créer une mesure
router.post(
  '/measurements',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json(handleValidationError(parsed.error));
      }

      const created = await EyeMeasurementSet.create({
        tenantId: current.tenantId,
        ...parsed.data,
      });
      return res.status(201).json({ measurement: created });
    } catch (error) {
      console.error('Error creating eye measurement:', error);
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

// Lister les mesures
router.get(
  '/measurements',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const {
        clientId,
        limit = '20',
        page = '1',
        sort = '-createdAt',
      } = req.query as Record<string, string | undefined>;

      const filter: Record<string, unknown> = { tenantId: current.tenantId };
      if (clientId) filter.clientId = clientId;

      const lim = Math.max(1, Math.min(100, Number(limit)));
      const pg = Math.max(1, Number(page));

      const q = EyeMeasurementSet.find(filter)
        .sort(sort as string)
        .skip((pg - 1) * lim)
        .limit(lim);
      const [items, total] = await Promise.all([q, EyeMeasurementSet.countDocuments(filter)]);
      return res.json({ items, total, page: pg, pages: Math.ceil(total / lim) });
    } catch (error) {
      console.error('Error listing eye measurements:', error);
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

// Obtenir une mesure
router.get(
  '/measurements/:id',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const item = await EyeMeasurementSet.findOne({
        _id: req.params.id,
        tenantId: current.tenantId,
      });
      if (!item) {
        return res.status(404).json(handleNotFoundError('measurement'));
      }
      return res.json({ measurement: item });
    } catch (error) {
      console.error('Error getting eye measurement:', error);
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

// Mettre à jour une mesure
router.patch(
  '/measurements/:id',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json(handleValidationError(parsed.error));
      }

      const updated = await EyeMeasurementSet.findOneAndUpdate(
        { _id: req.params.id, tenantId: current.tenantId },
        parsed.data,
        { new: true }
      );
      if (!updated) {
        return res.status(404).json(handleNotFoundError('measurement'));
      }
      return res.json({ measurement: updated });
    } catch (error) {
      console.error('Error updating eye measurement:', error);
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);

// Supprimer une mesure
router.delete(
  '/measurements/:id',
  requireAuth,
  requireModule(Capability.Optics),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const current = req.user!;
      const deleted = await EyeMeasurementSet.findOneAndDelete({
        _id: req.params.id,
        tenantId: current.tenantId,
      });
      if (!deleted) {
        return res.status(404).json(handleNotFoundError('measurement'));
      }
      return res.json({ ok: true });
    } catch (error) {
      console.error('Error deleting eye measurement:', error);
      return res.status(500).json(handleDatabaseError(error));
    }
  }
);
