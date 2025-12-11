import { getSecrets } from '../config/secrets.js';

import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware pour vérifier la présence d'un header requis
 * @param headerName - Nom du header à vérifier (ex: 'x-api-key')
 * @param required - Si true, le header est obligatoire (défaut: true)
 * @param errorMessage - Message d'erreur personnalisé
 */
export function checkHeader(headerName: string, required: boolean = true, errorMessage?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerValue = req.headers[headerName.toLowerCase()];

    if (required && !headerValue) {
      return res.status(400).json({
        error: errorMessage || `Header '${headerName}' requis`,
        details: `Le header '${headerName}' est manquant dans la requête`,
      });
    }

    return next();
  };
}

/**
 * Middleware pour vérifier un header avec une valeur spécifique
 * @param headerName - Nom du header à vérifier
 * @param expectedValue - Valeur attendue du header
 * @param errorMessage - Message d'erreur personnalisé
 */
export function checkHeaderValue(headerName: string, expectedValue: string, errorMessage?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerValue = req.headers[headerName.toLowerCase()];

    if (!headerValue) {
      return res.status(400).json({
        error: errorMessage || `Header '${headerName}' requis`,
        details: `Le header '${headerName}' est manquant dans la requête`,
      });
    }

    if (headerValue !== expectedValue) {
      return res.status(403).json({
        error: errorMessage || `Valeur du header '${headerName}' invalide`,
        details: `La valeur du header '${headerName}' ne correspond pas à la valeur attendue`,
      });
    }

    return next();
  };
}

/**
 * Récupère la valeur attendue du header selon l'environnement
 * Priorité:
 * 1. REQUIRED_HEADER_VALUE (valeur globale)
 * 2. REQUIRED_HEADER_VALUE_{ENV} (valeur spécifique à l'environnement)
 * 3. undefined (vérification de présence uniquement)
 */
function getExpectedHeaderValue(): string | undefined {
  const secrets = getSecrets();
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Valeur globale (priorité la plus haute)
  if (secrets.REQUIRED_HEADER_VALUE) {
    return secrets.REQUIRED_HEADER_VALUE;
  }

  // Valeur spécifique à l'environnement
  if (nodeEnv === 'production' && secrets.REQUIRED_HEADER_VALUE_PROD) {
    return secrets.REQUIRED_HEADER_VALUE_PROD;
  }

  if (nodeEnv === 'staging' && secrets.REQUIRED_HEADER_VALUE_STAGING) {
    return secrets.REQUIRED_HEADER_VALUE_STAGING;
  }

  if (nodeEnv === 'development' && secrets.REQUIRED_HEADER_VALUE_DEV) {
    return secrets.REQUIRED_HEADER_VALUE_DEV;
  }

  // Pas de valeur spécifique - vérification de présence uniquement
  return undefined;
}

/**
 * Middleware pour vérifier un header depuis une variable d'environnement
 * Utilise REQUIRED_HEADER_NAME et REQUIRED_HEADER_VALUE depuis .env
 * Supporte des valeurs différentes par environnement (dev, staging, prod)
 * Exclut automatiquement les routes système et les routes d'authentification publiques
 */
export function checkRequiredHeader() {
  const secrets = getSecrets();
  const headerName = secrets.REQUIRED_HEADER_NAME || 'x-api-key';
  const expectedValue = getExpectedHeaderValue();

  // Routes système à exclure de la vérification
  const excludedSystemPaths = ['/health', '/metrics', '/docs', '/docs.json'];

  // Routes d'authentification publiques à exclure
  const excludedAuthPaths = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/refresh'];

  return (req: Request, res: Response, next: NextFunction) => {
    // Ignorer la vérification pour les routes système
    if (excludedSystemPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Ignorer la vérification pour les routes d'authentification publiques
    if (excludedAuthPaths.some((path) => req.path === path)) {
      return next();
    }

    // Appliquer la vérification du header
    if (expectedValue) {
      return checkHeaderValue(headerName, expectedValue)(req, res, next);
    }

    return checkHeader(headerName, true)(req, res, next);
  };
}
