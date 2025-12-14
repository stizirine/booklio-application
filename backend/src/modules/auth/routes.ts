import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { requireAuth, type AuthenticatedRequest } from '@middlewares/requireAuth.js';

import { ClientType, TenantModel } from '../tenants/model.js';
import { tenantRegistry } from '../tenants/registry.js';
import { Capability, FeatureFlag } from '../tenants/types.js';
import { User } from '../users/model.js';

import {
  handleAuthDuplicateError,
  handleAuthInvalidCredentialsError,
  handleAuthTokenInvalidError,
  handleNotFoundError,
  handleValidationError,
} from './errors.js';

import type { Request, Response } from 'express';

export const router = Router();

const registerSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  clientType: z.enum(['generic', 'optician']).optional().default('generic'),
  // Informations personnelles (optionnelles)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  // Informations du magasin/entreprise (optionnelles)
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  patenteNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  npeNumber: z.string().optional(),
  iceNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const updateProfileSchema = z.object({
  // Informations personnelles (optionnelles)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  // Informations du magasin/entreprise (optionnelles)
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  patenteNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  npeNumber: z.string().optional(),
  iceNumber: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
});

function parseDurationToSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value) return fallbackSeconds;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackSeconds;
  const amount: number = Number(match[1]!);
  const unit: string = (match[2]! as string).toLowerCase();
  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  if (unit === 'd') return amount * 24 * 60 * 60;
  return fallbackSeconds;
}

function signTokens(userId: string, tenantId: string) {
  const accessSecret = process.env.JWT_ACCESS_SECRET ?? '';
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? '';
  const now = Math.floor(Date.now() / 1000);
  const accessSeconds = parseDurationToSeconds(process.env.JWT_ACCESS_EXPIRES, 15 * 60);
  const refreshSeconds = parseDurationToSeconds(process.env.JWT_REFRESH_EXPIRES, 7 * 24 * 60 * 60);

  const accessToken = jwt.sign(
    {
      sub: userId,
      tid: tenantId,
      type: 'access',
      iat: now,
      exp: now + accessSeconds,
    },
    accessSecret
  );
  const refreshToken = jwt.sign(
    {
      sub: userId,
      tid: tenantId,
      type: 'refresh',
      iat: now,
      exp: now + refreshSeconds,
    },
    refreshSecret
  );
  return { accessToken, refreshToken };
}

router.post('/register', async (req: Request, res: Response) => {
  // Désactiver la création de compte en production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Registration is disabled in production',
      message: 'La création de compte est désactivée en production'
    });
  }

  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(handleValidationError(parse.error));
  const {
    tenantId,
    email,
    password,
    clientType,
    firstName,
    lastName,
    phone,
    storeName,
    storeAddress,
    phoneNumber,
    patenteNumber,
    rcNumber,
    npeNumber,
    iceNumber,
  } = parse.data;

  // Debug: afficher les données reçues
  console.log("Données d'inscription reçues:", {
    tenantId,
    email,
    clientType,
    firstName,
    lastName,
    phone,
    storeName,
    storeAddress,
    phoneNumber,
    patenteNumber,
    rcNumber,
    npeNumber,
    iceNumber,
  });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json(handleAuthDuplicateError());

  // Créer ou mettre à jour le tenant avec les bonnes capabilities
  const existingTenant = await TenantModel.findOne({ tenantId });
  
  if (!existingTenant) {
    // Déterminer les capabilities en fonction du clientType
    const capabilities: Capability[] = clientType === 'optician' 
      ? [Capability.Dashboard, Capability.Clients, Capability.Appointments, Capability.Invoices, Capability.Optics]
      : [Capability.Dashboard, Capability.Clients, Capability.Appointments, Capability.Invoices];
    
    const featureFlags: Partial<Record<FeatureFlag, boolean>> = clientType === 'optician'
      ? {
          [FeatureFlag.OpticsMeasurements]: true,
          [FeatureFlag.OpticsPrescriptions]: true,
          [FeatureFlag.OpticsPrint]: true,
        }
      : {};

    await TenantModel.create({
      tenantId,
      clientType: clientType as ClientType,
      capabilities,
      featureFlags,
    });

    // Recharger le registry pour inclure le nouveau tenant
    await tenantRegistry.load();

    console.log('Tenant créé:', { tenantId, clientType, capabilities, featureFlags });
  }

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));

  // Construire l'objet utilisateur avec seulement les champs définis
  const userData: {
    tenantId: string;
    email: string;
    passwordHash: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
    phone?: string;
    storeName?: string;
    storeAddress?: string;
    phoneNumber?: string;
    patenteNumber?: string;
    rcNumber?: string;
    npeNumber?: string;
    iceNumber?: string;
  } = {
    tenantId,
    email,
    passwordHash,
    roles: ['admin'],
  };

  // Ajouter les informations personnelles seulement si elles sont définies
  if (firstName) userData.firstName = firstName;
  if (lastName) userData.lastName = lastName;
  if (phone) userData.phone = phone;
  // Ajouter les informations du magasin seulement si elles sont définies
  if (storeName) userData.storeName = storeName;
  if (storeAddress) userData.storeAddress = storeAddress;
  if (phoneNumber) userData.phoneNumber = phoneNumber;
  if (patenteNumber) userData.patenteNumber = patenteNumber;
  if (rcNumber) userData.rcNumber = rcNumber;
  if (npeNumber) userData.npeNumber = npeNumber;
  if (iceNumber) userData.iceNumber = iceNumber;

  // Debug: afficher les données qui seront sauvegardées
  console.log('Données utilisateur à sauvegarder:', userData);

  const user = await User.create(userData);

  // Debug: afficher l'utilisateur créé
  console.log('Utilisateur créé:', {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    storeName: user.storeName,
    storeAddress: user.storeAddress,
    phoneNumber: user.phoneNumber,
    patenteNumber: user.patenteNumber,
    rcNumber: user.rcNumber,
    npeNumber: user.npeNumber,
    iceNumber: user.iceNumber,
  });
  const { accessToken, refreshToken } = signTokens(user.id, tenantId);
  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      // Retourner les informations personnelles dans la réponse
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      // Retourner les informations du magasin dans la réponse
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      phoneNumber: user.phoneNumber,
      patenteNumber: user.patenteNumber,
      rcNumber: user.rcNumber,
      npeNumber: user.npeNumber,
      iceNumber: user.iceNumber,
    },
    tokens: { accessToken, refreshToken },
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(handleValidationError(parse.error));
  const { email, password } = parse.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json(handleAuthInvalidCredentialsError());
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json(handleAuthInvalidCredentialsError());
  const { accessToken, refreshToken } = signTokens(user.id, user.tenantId);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
    },
    tokens: { accessToken, refreshToken },
  });
});

interface RefreshPayload {
  sub: string;
  tid: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

router.post('/refresh', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json(handleAuthTokenInvalidError());
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as RefreshPayload;
    if (payload.type !== 'refresh') return res.status(401).json(handleAuthTokenInvalidError());
    const { accessToken, refreshToken } = signTokens(payload.sub, payload.tid);
    return res.json({ tokens: { accessToken, refreshToken } });
  } catch {
    return res.status(401).json(handleAuthTokenInvalidError());
  }
});

// Route protégée: retourne l'utilisateur courant
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { id: string; tenantId: string };
  const user = await User.findById(current.id).select(
    'email tenantId roles firstName lastName phone storeName storeAddress phoneNumber patenteNumber rcNumber npeNumber iceNumber'
  );
  if (!user) return res.status(404).json(handleNotFoundError('user'));
  const cfg = tenantRegistry.get(user.tenantId);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      // Inclure les informations personnelles dans la réponse
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      // Inclure les informations du magasin dans la réponse
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      phoneNumber: user.phoneNumber,
      patenteNumber: user.patenteNumber,
      rcNumber: user.rcNumber,
      npeNumber: user.npeNumber,
      iceNumber: user.iceNumber,
    },
    tenant: {
      tenantId: user.tenantId,
      clientType: cfg?.clientType ?? 'generic',
      capabilities: cfg?.capabilities ?? [],
      featureFlags: cfg?.featureFlags ?? {},
    },
  });
});

// Route protégée: met à jour les informations du profil utilisateur
router.put('/update-profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const parse = updateProfileSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(handleValidationError(parse.error));

  const {
    firstName,
    lastName,
    phone,
    storeName,
    storeAddress,
    phoneNumber,
    patenteNumber,
    rcNumber,
    npeNumber,
    iceNumber,
  } = parse.data;

  const current = req.user as { id: string; tenantId: string };

  // Construire l'objet de mise à jour avec seulement les champs définis
  const updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    storeName?: string;
    storeAddress?: string;
    phoneNumber?: string;
    patenteNumber?: string;
    rcNumber?: string;
    npeNumber?: string;
    iceNumber?: string;
  } = {};

  // Ajouter les champs seulement s'ils sont définis
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (storeName !== undefined) updateData.storeName = storeName;
  if (storeAddress !== undefined) updateData.storeAddress = storeAddress;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (patenteNumber !== undefined) updateData.patenteNumber = patenteNumber;
  if (rcNumber !== undefined) updateData.rcNumber = rcNumber;
  if (npeNumber !== undefined) updateData.npeNumber = npeNumber;
  if (iceNumber !== undefined) updateData.iceNumber = iceNumber;

  // Debug: afficher les données de mise à jour
  console.log('Mise à jour du profil:', {
    userId: current.id,
    updateData,
  });

  const updatedUser = await User.findByIdAndUpdate(
    current.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) return res.status(404).json(handleNotFoundError('user'));

  // Debug: afficher l'utilisateur mis à jour
  console.log('Utilisateur mis à jour:', {
    id: updatedUser.id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phone: updatedUser.phone,
    storeName: updatedUser.storeName,
    storeAddress: updatedUser.storeAddress,
    phoneNumber: updatedUser.phoneNumber,
    patenteNumber: updatedUser.patenteNumber,
    rcNumber: updatedUser.rcNumber,
    npeNumber: updatedUser.npeNumber,
    iceNumber: updatedUser.iceNumber,
  });

  return res.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      tenantId: updatedUser.tenantId,
      roles: updatedUser.roles,
      // Retourner les informations personnelles mises à jour
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      // Retourner les informations du magasin mises à jour
      storeName: updatedUser.storeName,
      storeAddress: updatedUser.storeAddress,
      phoneNumber: updatedUser.phoneNumber,
      patenteNumber: updatedUser.patenteNumber,
      rcNumber: updatedUser.rcNumber,
      npeNumber: updatedUser.npeNumber,
      iceNumber: updatedUser.iceNumber,
    },
  });
});

// Route protégée: change le mot de passe de l'utilisateur
router.put('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const parse = changePasswordSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(handleValidationError(parse.error));

  const { currentPassword, newPassword } = parse.data;

  const current = req.user as { id: string; tenantId: string };

  // Récupérer l'utilisateur avec le mot de passe hashé
  const user = await User.findById(current.id).select('passwordHash');
  if (!user) return res.status(404).json(handleNotFoundError('user'));

  // Vérifier le mot de passe actuel
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    return res.status(401).json(handleAuthInvalidCredentialsError());
  }

  // Vérifier que le nouveau mot de passe est différent de l'ancien
  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
  if (isSamePassword) {
    return res.status(400).json({
      error: "Le nouveau mot de passe doit être différent de l'actuel",
      code: 'SAME_PASSWORD',
    });
  }

  // Hasher le nouveau mot de passe
  const newPasswordHash = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12)
  );

  // Mettre à jour le mot de passe
  await User.findByIdAndUpdate(current.id, { passwordHash: newPasswordHash });

  return res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
});

// Logout stateless: côté serveur, on peut juste informer le client de supprimer ses tokens
router.post('/logout', requireAuth, async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true });
});

export default router;
