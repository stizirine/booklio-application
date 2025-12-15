import cors from 'cors';
import 'dotenv/config.js';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import pino from 'pino';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { getSecrets } from './config/secrets.js';
import { register } from './metrics.js';
import { checkRequiredHeader } from './middlewares/checkHeader.js';
import { resolveTenant } from './middlewares/resolveTenant.js';
import { router as agentRouter } from './modules/agent/routes.js';
import { router as authRouter } from './modules/auth/routes.js';
import { router as appointmentsRouter } from './modules/crm/appointments/routes.js';
import { router as clientsRouter } from './modules/crm/clients/routes.js';
import { router as invoicesRouter } from './modules/crm/invoices/routes.js';
import { router as gcalRouter } from './modules/gcal/routes.js';
import { router as opticianRouter } from './modules/optician/routes.js';
import { tenantRegistry } from './modules/tenants/registry.js';
import { router as tenantsRouter } from './modules/tenants/routes.js';
import { User } from './modules/users/model.js';
import { openapiSpec } from './openapi.js';

import type { OpenAPIV3 } from 'openapi-types';

const app = express();
const logger = pino({ transport: { target: 'pino-pretty' } });

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Vérification du header requis (avant toutes les routes)
app.use(checkRequiredHeader());

// Prometheus metrics (using register from metrics module)

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Swagger (regroupement par tags par défaut)
function withDefaultTags(spec: OpenAPIV3.Document): OpenAPIV3.Document {
  // Cloner sans référence circulaire
  const cloned = JSON.parse(JSON.stringify(spec)) as OpenAPIV3.Document;
  const paths = cloned.paths || {};
  const addTagIfMissing = (op: OpenAPIV3.OperationObject | undefined, tag: string) => {
    if (!op) return;
    if (!op.tags || op.tags.length === 0) op.tags = [tag];
  };
  for (const [path, item] of Object.entries(paths)) {
    const pi = item as OpenAPIV3.PathItemObject;
    const prefix = path.startsWith('/v1/agent')
      ? 'agent'
      : path.startsWith('/v1/auth')
        ? 'auth'
        : path.startsWith('/v1/clients')
          ? 'clients'
          : path.startsWith('/v1/appointments')
            ? 'appointments'
            : path.startsWith('/v1/invoices')
              ? 'invoices'
              : path.startsWith('/v1/gcal')
                ? 'gcal'
                : undefined;
    if (!prefix) continue;
    addTagIfMissing(pi.get, prefix);
    addTagIfMissing(pi.post, prefix);
    addTagIfMissing(pi.put, prefix);
    addTagIfMissing(pi.patch, prefix);
    addTagIfMissing(pi.delete, prefix);
    addTagIfMissing(pi.options, prefix);
    addTagIfMissing(pi.head, prefix);
  }
  return cloned;
}

const openapiWithTags = withDefaultTags(openapiSpec);

// Configuration Swagger avec injection automatique du header x-api-key
const secrets = getSecrets();
const apiKeyValue = secrets.REQUIRED_HEADER_VALUE;
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    // Pre-remplir automatiquement l'API Key si définie
    ...(apiKeyValue && {
      onComplete: function() {
        // @ts-expect-error - Access to window.ui from Swagger UI
        window.ui.preauthorizeApiKey('apiKeyAuth', apiKeyValue);
      }
    })
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiWithTags, swaggerOptions));
app.get('/docs.json', (_req, res) => res.json(openapiWithTags));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/v1/auth', authRouter);
app.use('/v1/gcal', gcalRouter);
app.use('/v1/clients', clientsRouter);
app.use('/v1/appointments', appointmentsRouter);
app.use('/v1/invoices', invoicesRouter);
app.use('/v1/agent', agentRouter);
app.use('/v1/tenants', resolveTenant, tenantsRouter);
app.use('/v1/optician', opticianRouter);

// Internal cleanup route (test only)
app.delete('/__internal__/users/:id', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'delete_failed' });
  }
});

const { PORT: ENV_PORT, MONGO_URI } = getSecrets();
const PORT = ENV_PORT || process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    await tenantRegistry.load();
    app.listen(PORT, () => {
      logger.info(`API démarrée sur http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, 'Erreur au démarrage');
    process.exit(1);
  }
}

start();
