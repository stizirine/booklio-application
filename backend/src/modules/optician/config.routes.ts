import { Router, type Response } from 'express';

import { requireAuth, type AuthenticatedRequest } from '../../middlewares/requireAuth.js';
import { requireModule } from '../../middlewares/resolveTenant.js';
import { Capability } from '../tenants/types.js';

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

export const configRouter = Router();

configRouter.get(
  '/',
  requireAuth,
  requireModule(Capability.Optics),
  async (_req: AuthenticatedRequest, res: Response) => {
    return res.json({
      lenses: {
        types: Object.values(LensType),
        indices: Object.values(LensIndex),
        treatments: Object.values(Treatment),
        frameTypes: Object.values(FrameType),
        frameMaterials: Object.values(FrameMaterial),
      },
      contacts: {
        types: Object.values(ContactType),
        designs: Object.values(DesignType),
        stabilisations: Object.values(StabilisationType),
        materialFamilies: Object.values(MaterialFamily),
        wear: Object.values(WearType),
        replacement: Object.values(ReplacementType),
      },
      prismBases: Object.values(PrismBase),
    });
  }
);
