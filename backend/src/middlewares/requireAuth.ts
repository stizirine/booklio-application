import jwt from 'jsonwebtoken';

import type { NextFunction, Request, Response } from 'express';

export interface AuthUserPayload {
  id: string;
  tenantId: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Non authentifié' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as {
      sub: string;
      tid: string;
      roles?: string[];
    };
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      tenantId: payload.tid,
      roles: payload.roles || [],
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
