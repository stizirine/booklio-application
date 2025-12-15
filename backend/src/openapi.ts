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
} from './modules/optician/enums.js';
import { ClientType } from './modules/tenants/model.js';
import { Capability } from './modules/tenants/types.js';

import type { OpenAPIV3 } from 'openapi-types';

export const openapiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Booklio API',
    version: '1.0.0',
    description: 'Documentation des endpoints du MVP (health, auth)',
  },
  tags: [
    { name: 'auth', description: 'Authentification' },
    { name: 'clients', description: 'CRM — Clients' },
    { name: 'appointments', description: 'CRM — Rendez-vous' },
    { name: 'invoices', description: 'CRM — Factures' },
    { name: 'gcal', description: 'Google Calendar' },
    { name: 'agent', description: 'Agent IA / WhatsApp' },
    { name: 'tenants', description: 'Configuration par tenant (clientType, capabilities)' },
    { name: 'optician', description: 'Opticien — Mesures de vision' },
  ],
  servers: [{ url: 'http://localhost:4000', description: 'local' }],
  paths: {
    '/v1/optician/measurements': {
      get: {
        summary: 'Lister les mesures de vision',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'clientId', schema: { type: 'string' } },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EyeMeasurementSet' },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                  },
                  required: ['items', 'total', 'page', 'pages'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Module forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  moduleForbidden: {
                    summary: 'Module forbidden',
                    value: {
                      error: {
                        errorId: 'MODULE_FORBIDDEN',
                        message: 'Module forbidden',
                        description: 'This module is not available for your tenant',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Créer une mesure de vision',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EyeMeasurementSetCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { measurement: { $ref: '#/components/schemas/EyeMeasurementSet' } },
                  required: ['measurement'],
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                        details: {
                          validation: {
                            fieldErrors: {
                              measuredAt: ['Invalid date format'],
                              od: ['Sphere value must be between -20 and 20'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Module forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  moduleForbidden: {
                    summary: 'Module forbidden',
                    value: {
                      error: {
                        errorId: 'MODULE_FORBIDDEN',
                        message: 'Module forbidden',
                        description: 'This module is not available for your tenant',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/optician/config': {
      get: {
        summary: 'Lister les valeurs de configuration optique (enums)',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    lenses: {
                      type: 'object',
                      properties: {
                        types: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(LensType) },
                        },
                        indices: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(LensIndex) },
                        },
                        treatments: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(Treatment) },
                        },
                        frameTypes: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(FrameType) },
                        },
                      },
                    },
                    contacts: {
                      type: 'object',
                      properties: {
                        types: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(ContactType) },
                        },
                        designs: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(DesignType) },
                        },
                        stabilisations: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(StabilisationType) },
                        },
                        materialFamilies: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(MaterialFamily) },
                        },
                        wear: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(WearType) },
                        },
                        replacement: {
                          type: 'array',
                          items: { type: 'string', enum: Object.values(ReplacementType) },
                        },
                      },
                    },
                    prismBases: {
                      type: 'array',
                      items: { type: 'string', enum: Object.values(PrismBase) },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/optician/measurements/{id}': {
      get: {
        summary: 'Obtenir une mesure',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { measurement: { $ref: '#/components/schemas/EyeMeasurementSet' } },
                  required: ['measurement'],
                },
              },
            },
          },
          '404': {
            description: 'Eye measurement not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Measurement not found',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_MEASUREMENT_NOT_FOUND',
                        message: 'Eye measurement not found',
                        description:
                          'The requested eye measurement does not exist or has been deleted',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Module forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  moduleForbidden: {
                    summary: 'Module forbidden',
                    value: {
                      error: {
                        errorId: 'MODULE_FORBIDDEN',
                        message: 'Module forbidden',
                        description: 'This module is not available for your tenant',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Mettre à jour une mesure',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EyeMeasurementSetUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { measurement: { $ref: '#/components/schemas/EyeMeasurementSet' } },
                  required: ['measurement'],
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Eye measurement not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Measurement not found',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_MEASUREMENT_NOT_FOUND',
                        message: 'Eye measurement not found',
                        description:
                          'The requested eye measurement does not exist or has been deleted',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Module forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  moduleForbidden: {
                    summary: 'Module forbidden',
                    value: {
                      error: {
                        errorId: 'MODULE_FORBIDDEN',
                        message: 'Module forbidden',
                        description: 'This module is not available for your tenant',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Supprimer une mesure',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'OK' },
          '404': {
            description: 'Eye measurement not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Measurement not found',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_MEASUREMENT_NOT_FOUND',
                        message: 'Eye measurement not found',
                        description:
                          'The requested eye measurement does not exist or has been deleted',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Module forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  moduleForbidden: {
                    summary: 'Module forbidden',
                    value: {
                      error: {
                        errorId: 'MODULE_FORBIDDEN',
                        message: 'Module forbidden',
                        description: 'This module is not available for your tenant',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/tenants/me': {
      get: {
        summary: 'Infos du tenant courant (clientType, capabilities, featureFlags)',
        tags: ['tenants'],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TenantInfo' },
              },
            },
          },
          '404': {
            description: 'Tenant not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  tenantNotFound: {
                    summary: 'Tenant not found',
                    value: {
                      error: {
                        errorId: 'TENANT_NOT_FOUND',
                        message: 'Tenant not found',
                        description: 'The requested tenant does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/tenants/{id}/capabilities': {
      get: {
        summary: 'Capabilities pour un tenant donné',
        tags: ['tenants'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tenantId: { type: 'string' },
                    capabilities: {
                      type: 'array',
                      items: { type: 'string', enum: Object.values(Capability) },
                    },
                  },
                  required: ['tenantId', 'capabilities'],
                },
              },
            },
          },
          '404': {
            description: 'Tenant not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  tenantNotFound: {
                    summary: 'Tenant not found',
                    value: {
                      error: {
                        errorId: 'TENANT_NOT_FOUND',
                        message: 'Tenant not found',
                        description: 'The requested tenant does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/metrics': {
      get: {
        summary: 'Exposer les métriques Prometheus',
        tags: ['agent'],
        responses: {
          '200': {
            description: 'Texte des métriques au format Prometheus',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
    '/v1/agent/test-message': {
      post: {
        summary: 'Envoyer un message test via WhatsApp (provider mock)',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['clientId', 'templateName'],
                properties: {
                  clientId: { type: 'string' },
                  templateName: { type: 'string', example: 'reminder_48h_fr' },
                  locale: { type: 'string', example: 'fr' },
                  variables: { type: 'object', additionalProperties: true },
                },
              },
              examples: {
                default: {
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    templateName: 'reminder_48h_fr',
                    locale: 'fr',
                    variables: {
                      date: '2025-10-15',
                      time: '10:00',
                      bookingLink: 'https://booklio.app/r/abc',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Message envoyé (mock)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    providerMessageId: { type: 'string' },
                    text: { type: 'string' },
                  },
                  required: ['ok', 'text'],
                },
              },
            },
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingParams: {
                    summary: 'Missing parameters',
                    value: {
                      error: {
                        errorId: 'INVALID_REQUEST',
                        message: 'Invalid request',
                        description: 'The request format or parameters are invalid',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Client or template not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Client or template not found',
                    value: {
                      error: {
                        errorId: 'AGENT_TEMPLATE_NOT_FOUND',
                        message: 'Template not found',
                        description: 'The requested message template does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/preview': {
      post: {
        summary: 'Prévisualiser un template avec variables (sans envoi)',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['templateName'],
                properties: {
                  templateName: { type: 'string', example: 'reminder_48h_fr' },
                  locale: { type: 'string', example: 'fr' },
                  variables: { type: 'object', additionalProperties: true },
                },
              },
              examples: {
                default: {
                  value: {
                    templateName: 'reminder_48h_fr',
                    locale: 'fr',
                    variables: {
                      firstName: 'Alice',
                      date: '2025-10-15',
                      time: '10:00',
                      bookingLink: 'https://booklio.app/r/abc',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Prévisualisation du message',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    missingPlaceholders: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['text', 'missingPlaceholders'],
                },
              },
            },
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingParams: {
                    summary: 'Missing parameters',
                    value: {
                      error: {
                        errorId: 'INVALID_REQUEST',
                        message: 'Invalid request',
                        description: 'The request format or parameters are invalid',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Template not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  templateNotFound: {
                    summary: 'Template not found',
                    value: {
                      error: {
                        errorId: 'AGENT_TEMPLATE_NOT_FOUND',
                        message: 'Template not found',
                        description: 'The requested message template does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/send-now': {
      post: {
        summary: 'Envoyer immédiatement un rappel 48h pour un rendez-vous (mock)',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['appointmentId'],
                properties: {
                  appointmentId: { type: 'string' },
                  locale: { type: 'string', example: 'fr' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Message envoyé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    providerMessageId: { type: 'string' },
                    text: { type: 'string' },
                  },
                  required: ['ok', 'providerMessageId', 'text'],
                },
              },
            },
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingParams: {
                    summary: 'Missing parameters',
                    value: {
                      error: {
                        errorId: 'INVALID_REQUEST',
                        message: 'Invalid request',
                        description: 'The request format or parameters are invalid',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  resourceNotFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/reminders/run': {
      post: {
        summary: 'Déclencher un lot de rappels 48h (fenêtre courte)',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'windowMinutes',
            required: false,
            schema: { type: 'integer', minimum: 0 },
            description: 'Largeur de fenêtre en minutes après now+48h (défaut 15)',
          },
        ],
        responses: {
          '200': {
            description: 'Résultat du lot',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    processed: { type: 'integer', example: 3 },
                    error: { type: 'string', nullable: true },
                  },
                  required: ['processed'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/reengagement/run': {
      post: {
        summary: 'Lancer la campagne de réengagement',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'days',
            required: false,
            schema: { type: 'integer', minimum: 0, default: 30 },
            description: 'Nombre de jours sans RDV à partir duquel on réengage',
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 100 },
            description: 'Nombre maximum de clients à traiter pour cet appel',
          },
        ],
        responses: {
          '200': {
            description: 'Statistiques de mise en file',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    matched: { type: 'integer' },
                    enqueued: { type: 'integer' },
                  },
                  required: ['matched', 'enqueued'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/webhooks/whatsapp/status': {
      post: {
        summary: 'Webhook statut provider WhatsApp (mock)',
        tags: ['agent'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  providerMessageId: { type: 'string' },
                  event: {
                    type: 'string',
                    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
                  },
                  timestamp: { type: 'string', nullable: true },
                },
                required: ['providerMessageId', 'event'],
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/v1/agent/webhooks/whatsapp/inbound': {
      post: {
        summary: 'Webhook inbound messages WhatsApp (STOP etc., mock)',
        tags: ['agent'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tenantId: { type: 'string' },
                  clientId: { type: 'string', nullable: true },
                  fromPhone: { type: 'string', nullable: true },
                  text: { type: 'string' },
                },
                required: ['tenantId', 'text'],
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/v1/agent/webhooks/meta': {
      get: {
        summary: 'Meta webhook verification (hub.challenge)',
        tags: ['agent'],
        parameters: [
          {
            in: 'query',
            name: 'hub.mode',
            schema: { type: 'string' },
            required: false,
          },
          {
            in: 'query',
            name: 'hub.verify_token',
            schema: { type: 'string' },
            required: false,
          },
          {
            in: 'query',
            name: 'hub.challenge',
            schema: { type: 'string' },
            required: false,
          },
        ],
        responses: {
          '200': { description: 'Returns hub.challenge on success' },
          '403': { description: 'Verification failed' },
        },
      },
      post: {
        summary: 'Meta inbound webhook (messages)',
        tags: ['agent'],
        parameters: [
          {
            in: 'query',
            name: 'tenantId',
            required: true,
            schema: { type: 'string' },
            description: 'Tenant cible pour router le webhook',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Payload brut Meta (entry/changes/messages...)',
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  badRequest: {
                    summary: 'Bad request',
                    value: {
                      error: {
                        errorId: 'INVALID_REQUEST',
                        message: 'Invalid request',
                        description: 'The request format or parameters are invalid',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/settings': {
      get: {
        summary: "Récupérer les réglages de l'agent IA pour le tenant",
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Réglages',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { settings: { $ref: '#/components/schemas/AgentSettings' } },
                  required: ['settings'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: "Mettre à jour les réglages de l'agent IA pour le tenant",
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  quietHours: {
                    type: 'object',
                    properties: {
                      start: { type: 'string', example: '21:00' },
                      end: { type: 'string', example: '08:00' },
                    },
                  },
                  daysBeforeReminder: { type: 'integer', minimum: 0, example: 2 },
                  reengageAfterDays: { type: 'integer', minimum: 0, example: 30 },
                  locale: { type: 'string', example: 'fr' },
                  fallbackLocale: { type: 'string', example: 'fr' },
                  timezone: { type: 'string', example: 'Europe/Paris' },
                  model: { type: 'string', example: 'gpt-4o-mini' },
                  tone: { type: 'string', example: 'friendly' },
                  provider: { type: 'string', enum: ['mock', 'meta', 'twilio'], example: 'mock' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Réglages mis à jour',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { settings: { $ref: '#/components/schemas/AgentSettings' } },
                  required: ['settings'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/dlq/stats': {
      get: {
        summary: 'Récupérer les statistiques des Dead Letter Queues',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Statistiques DLQ récupérées',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dlq: {
                      type: 'object',
                      properties: {
                        reminders: {
                          type: 'object',
                          properties: {
                            waiting: { type: 'number' },
                            active: { type: 'number' },
                            completed: { type: 'number' },
                            failed: { type: 'number' },
                          },
                        },
                        reengagement: {
                          type: 'object',
                          properties: {
                            waiting: { type: 'number' },
                            active: { type: 'number' },
                            completed: { type: 'number' },
                            failed: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/dlq/retry/{queue}/{jobId}': {
      post: {
        summary: 'Relancer un job depuis la DLQ',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'queue',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['reminders', 'reengagement'] },
          },
          {
            name: 'jobId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Job relancé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/quotas/usage': {
      get: {
        summary: "Récupérer l'utilisation des quotas pour le tenant",
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Utilisation des quotas récupérée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    usage: {
                      type: 'object',
                      properties: {
                        daily: { type: 'number' },
                        hourly: { type: 'number' },
                        burst: { type: 'number' },
                        remaining: {
                          type: 'object',
                          properties: {
                            daily: { type: 'number' },
                            hourly: { type: 'number' },
                            burst: { type: 'number' },
                          },
                        },
                        resetAt: {
                          type: 'object',
                          properties: {
                            daily: { type: 'string', format: 'date-time' },
                            hourly: { type: 'string', format: 'date-time' },
                            burst: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                    quota: {
                      type: 'object',
                      properties: {
                        dailyLimit: { type: 'number' },
                        hourlyLimit: { type: 'number' },
                        burstLimit: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/agent/quotas/status': {
      get: {
        summary: 'Vérifier le statut des quotas (peut envoyer ou non)',
        tags: ['agent'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Statut des quotas récupéré',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    canSend: {
                      type: 'object',
                      properties: {
                        allowed: { type: 'boolean' },
                        reason: { type: 'string' },
                      },
                    },
                    usage: {
                      type: 'object',
                      properties: {
                        daily: { type: 'number' },
                        hourly: { type: 'number' },
                        burst: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Healthcheck',
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/v1/auth/register': {
      post: {
        summary: 'Inscription',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tenantId', 'email', 'password'],
                properties: {
                  tenantId: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  // Informations personnelles (optionnelles)
                  firstName: {
                    type: 'string',
                    description: 'Prénom',
                    example: 'Jean',
                  },
                  lastName: {
                    type: 'string',
                    description: 'Nom de famille',
                    example: 'Dupont',
                  },
                  phone: {
                    type: 'string',
                    description: 'Numéro de téléphone personnel',
                    example: '+33 6 12 34 56 78',
                  },
                  // Informations du magasin/entreprise (optionnelles)
                  storeName: {
                    type: 'string',
                    description: 'Nom du magasin ou raison sociale',
                    example: 'Optique du Centre',
                  },
                  storeAddress: {
                    type: 'string',
                    description: 'Adresse du magasin',
                    example: '123 Rue de la Paix, 75001 Paris',
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'Numéro de téléphone du magasin',
                    example: '+33 1 23 45 67 89',
                  },
                  storePhone: {
                    type: 'string',
                    description: 'Autre téléphone du magasin (WhatsApp, mobile, etc.)',
                    example: '+33 1 23 45 67 89',
                  },
                  patenteNumber: {
                    type: 'string',
                    description: 'Numéro de patente',
                    example: '123456789',
                  },
                  rcNumber: {
                    type: 'string',
                    description: 'Registre de commerce (RC)',
                    example: 'RC123456',
                  },
                  npeNumber: {
                    type: 'string',
                    description: 'NPE',
                    example: 'NPE987654',
                  },
                  iceNumber: {
                    type: 'string',
                    description: 'ICE',
                    example: 'ICE123456789',
                  },
                },
              },
              examples: {
                default: {
                  summary: 'Exemple basique',
                  value: {
                    tenantId: 't1',
                    email: 'test@booklio.com',
                    password: 'password123',
                  },
                },
                withPersonalInfo: {
                  summary: 'Exemple avec informations personnelles',
                  description: 'Inscription avec informations personnelles uniquement',
                  value: {
                    tenantId: 't1',
                    email: 'jean.dupont@example.com',
                    password: 'password123',
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    phone: '+33 6 12 34 56 78',
                  },
                },
                withStoreInfo: {
                  summary: 'Exemple avec informations du magasin',
                  description:
                    'Inscription complète avec toutes les informations du magasin/entreprise',
                  value: {
                    tenantId: 't1',
                    email: 'opticien@example.com',
                    password: 'password123',
                    firstName: 'Marie',
                    lastName: 'Martin',
                    phone: '+33 6 98 76 54 32',
                    storeName: 'Optique du Centre',
                    storeAddress: '123 Rue de la Paix, 75001 Paris',
                    phoneNumber: '+33 1 23 45 67 89',
                    patenteNumber: '123456789',
                    rcNumber: 'RC123456',
                    npeNumber: 'NPE987654',
                    iceNumber: 'ICE123456789',
                  },
                },
                minimalStoreInfo: {
                  summary: 'Exemple avec informations minimales',
                  description: "Inscription avec seulement le nom et l'adresse du magasin",
                  value: {
                    tenantId: 't1',
                    email: 'opticien.minimal@example.com',
                    password: 'password123',
                    storeName: 'Mon Optique',
                    storeAddress: '456 Avenue des Champs-Élysées, 75008 Paris',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Utilisateur créé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
                examples: {
                  success: {
                    value: {
                      user: {
                        id: '68ca6b15203bb6ac8918c52c',
                        email: 'test@booklio.com',
                        tenantId: 't1',
                        roles: ['admin'],
                        storeName: 'Optique du Centre',
                        storeAddress: '123 Rue de la Paix, 75001 Paris',
                        phoneNumber: '+33 1 23 45 67 89',
                        patenteNumber: '123456789',
                        rcNumber: 'RC123456',
                        npeNumber: 'NPE987654',
                        iceNumber: 'ICE123456789',
                      },
                      tokens: { accessToken: 'eyJ...', refreshToken: 'eyJ...' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Conflict - email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  duplicateEmail: {
                    summary: 'Email already exists',
                    value: {
                      error: {
                        errorId: 'AUTH_EMAIL_ALREADY_EXISTS',
                        message: 'Email already exists',
                        description: 'An account with this email already exists',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/auth/login': {
      post: {
        summary: 'Connexion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
              examples: {
                default: {
                  value: {
                    email: 'test@booklio.com',
                    password: 'password123',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentifié',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
                examples: {
                  success: {
                    value: {
                      user: {
                        id: '68ca6b15203bb6ac8918c52c',
                        email: 'test@booklio.com',
                        tenantId: 't1',
                        roles: ['admin'],
                      },
                      tokens: { accessToken: 'eyJ...', refreshToken: 'eyJ...' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidCredentials: {
                    summary: 'Invalid credentials',
                    value: {
                      error: {
                        errorId: 'AUTH_INVALID_CREDENTIALS',
                        message: 'Invalid credentials',
                        description: 'The provided email or password is incorrect',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/auth/refresh': {
      post: {
        summary: 'Renouveler les tokens',
        parameters: [
          {
            in: 'header',
            name: 'Authorization',
            schema: { type: 'string' },
            required: true,
            description: 'Bearer <refreshToken>',
          },
        ],
        responses: {
          '200': {
            description: 'Tokens renouvelés',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokensResponse' },
                examples: {
                  success: {
                    value: {
                      tokens: { accessToken: 'eyJ...', refreshToken: 'eyJ...' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidToken: {
                    summary: 'Invalid token',
                    value: {
                      error: {
                        errorId: 'AUTH_TOKEN_INVALID',
                        message: 'Invalid token',
                        description: 'The provided token is invalid or malformed',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/auth/me': {
      get: {
        summary: 'Utilisateur courant',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Utilisateur + infos tenant',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    tenant: { $ref: '#/components/schemas/TenantInfo' },
                  },
                  required: ['user'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/auth/update-profile': {
      put: {
        summary: 'Mettre à jour les informations du profil utilisateur',
        description: "Met à jour les informations du magasin/entreprise de l'utilisateur connecté",
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  // Informations personnelles (optionnelles)
                  firstName: {
                    type: 'string',
                    description: 'Prénom',
                    example: 'Jean',
                  },
                  lastName: {
                    type: 'string',
                    description: 'Nom de famille',
                    example: 'Dupont',
                  },
                  phone: {
                    type: 'string',
                    description: 'Numéro de téléphone personnel',
                    example: '+33 6 12 34 56 78',
                  },
                  // Informations du magasin/entreprise (optionnelles)
                  storeName: {
                    type: 'string',
                    description: 'Nom du magasin ou raison sociale',
                    example: 'Optique du Centre',
                  },
                  storeAddress: {
                    type: 'string',
                    description: 'Adresse du magasin',
                    example: '123 Rue de la Paix, 75001 Paris',
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'Numéro de téléphone du magasin',
                    example: '+33 1 23 45 67 89',
                  },
                  patenteNumber: {
                    type: 'string',
                    description: 'Numéro de patente',
                    example: '123456789',
                  },
                  rcNumber: {
                    type: 'string',
                    description: 'Registre de commerce (RC)',
                    example: 'RC123456',
                  },
                  npeNumber: {
                    type: 'string',
                    description: 'NPE',
                    example: 'NPE987654',
                  },
                  iceNumber: {
                    type: 'string',
                    description: 'ICE',
                    example: 'ICE123456789',
                  },
                },
                additionalProperties: false,
              },
              examples: {
                personalInfo: {
                  summary: 'Mise à jour informations personnelles',
                  value: {
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    phone: '+33 6 12 34 56 78',
                  },
                },
                complete: {
                  summary: 'Mise à jour complète',
                  value: {
                    firstName: 'Marie',
                    lastName: 'Martin',
                    phone: '+33 6 98 76 54 32',
                    storeName: 'Optique du Centre',
                    storeAddress: '123 Rue de la Paix, 75001 Paris',
                    phoneNumber: '+33 1 23 45 67 89',
                    patenteNumber: '123456789',
                    rcNumber: 'RC123456',
                    npeNumber: 'NPE987654',
                    iceNumber: 'ICE123456789',
                  },
                },
                partial: {
                  summary: 'Mise à jour partielle',
                  value: {
                    firstName: 'Nouveau prénom',
                    storeName: 'Nouveau nom du magasin',
                    phoneNumber: '+33 1 98 76 54 32',
                  },
                },
                clear: {
                  summary: 'Effacer un champ',
                  value: {
                    storeName: null,
                    storeAddress: null,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profil mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                  required: ['user'],
                },
                example: {
                  user: {
                    id: '68ca6b15203bb6ac8918c52c',
                    email: 'test@booklio.com',
                    tenantId: 't1',
                    roles: ['admin'],
                    storeName: 'Optique du Centre',
                    storeAddress: '123 Rue de la Paix, 75001 Paris',
                    phoneNumber: '+33 1 23 45 67 89',
                    patenteNumber: '123456789',
                    rcNumber: 'RC123456',
                    npeNumber: 'NPE987654',
                    iceNumber: 'ICE123456789',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Token invalide ou manquant',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Utilisateur non trouvé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/v1/auth/change-password': {
      put: {
        summary: 'Changer le mot de passe',
        description: "Permet à l'utilisateur connecté de changer son mot de passe",
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: {
                    type: 'string',
                    description: 'Mot de passe actuel',
                    example: 'ancienMotDePasse123',
                  },
                  newPassword: {
                    type: 'string',
                    description: 'Nouveau mot de passe (minimum 8 caractères)',
                    minLength: 8,
                    example: 'nouveauMotDePasse456',
                  },
                },
                additionalProperties: false,
              },
              examples: {
                default: {
                  summary: 'Changement de mot de passe',
                  value: {
                    currentPassword: 'ancienMotDePasse123',
                    newPassword: 'nouveauMotDePasse456',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Mot de passe changé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Mot de passe mis à jour avec succès' },
                  },
                  required: ['success', 'message'],
                },
                example: {
                  success: true,
                  message: 'Mot de passe mis à jour avec succès',
                },
              },
            },
          },
          '400': {
            description: "Données invalides ou nouveau mot de passe identique à l'ancien",
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Données invalides',
                    value: {
                      error: {
                        errorId: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: [
                          {
                            field: 'newPassword',
                            message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
                          },
                        ],
                      },
                    },
                  },
                  samePassword: {
                    summary: 'Même mot de passe',
                    value: {
                      error: "Le nouveau mot de passe doit être différent de l'actuel",
                      code: 'SAME_PASSWORD',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Token invalide ou mot de passe actuel incorrect',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidToken: {
                    summary: 'Token invalide',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                  wrongPassword: {
                    summary: 'Mot de passe actuel incorrect',
                    value: {
                      error: {
                        errorId: 'AUTH_INVALID_CREDENTIALS',
                        message: 'Invalid credentials',
                        description: 'The provided credentials are invalid',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Utilisateur non trouvé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/v1/auth/logout': {
      post: {
        summary: 'Déconnexion (stateless)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean', example: true } },
                },
                examples: { success: { value: { success: true } } },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // Google Calendar
    '/v1/gcal/auth-url': {
      get: {
        summary: 'Obtenir l’URL OAuth Google Calendar',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'URL générée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { url: { type: 'string' } },
                  required: ['url'],
                },
                examples: {
                  default: {
                    value: {
                      url: 'https://accounts.google.com/o/oauth2/v2/auth?...',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/gcal/oauth/callback': {
      get: {
        summary: 'Callback OAuth Google (échange code -> tokens)',
        parameters: [
          {
            in: 'query',
            name: 'code',
            schema: { type: 'string' },
            required: true,
          },
        ],
        responses: {
          '200': {
            description: 'Tokens reçus',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GoogleTokens' },
                examples: {
                  success: {
                    value: {
                      access_token: 'ya29...',
                      refresh_token: '1//0g...',
                      scope: 'https://www.googleapis.com/auth/calendar.readonly',
                      token_type: 'Bearer',
                      expiry_date: 1737032210000,
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Token exchange failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  tokenExchangeFailed: {
                    summary: 'Token exchange failed',
                    value: {
                      error: {
                        errorId: 'AUTH_TOKEN_EXCHANGE_FAILED',
                        message: 'Token exchange failed',
                        description: 'Failed to exchange authorization code for tokens',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/gcal/store-tokens': {
      post: {
        summary: 'Stocker les tokens Google pour l’utilisateur courant',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoogleTokens' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tokens stockés',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                  required: ['ok'],
                },
              },
            },
          },
          '400': {
            description: 'Missing tokens',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingTokens: {
                    summary: 'Missing tokens',
                    value: {
                      error: {
                        errorId: 'AUTH_TOKENS_MISSING',
                        message: 'Missing tokens',
                        description: 'Google Calendar tokens are required',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/gcal/calendars': {
      get: {
        summary: 'Lister les calendriers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Liste des calendriers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CalendarItem' },
                    },
                  },
                  required: ['items'],
                },
              },
            },
          },
          '401': {
            description: 'Google Calendar tokens missing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  tokensMissing: {
                    summary: 'Google Calendar tokens missing',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Google Calendar tokens are required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/gcal/events': {
      get: {
        summary: 'Lister les événements d’un calendrier',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'calendarId',
            schema: { type: 'string', default: 'primary' },
            required: false,
          },
          {
            in: 'query',
            name: 'timeMin',
            schema: { type: 'string', format: 'date-time' },
            required: false,
          },
          {
            in: 'query',
            name: 'timeMax',
            schema: { type: 'string', format: 'date-time' },
            required: false,
          },
        ],
        responses: {
          '200': {
            description: 'Liste des événements',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EventItem' },
                    },
                  },
                  required: ['items'],
                },
              },
            },
          },
          '401': {
            description: 'Google Calendar tokens missing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  tokensMissing: {
                    summary: 'Google Calendar tokens missing',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Google Calendar tokens are required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // CRM — Clients
    '/v1/clients': {
      get: {
        summary: 'Lister les clients',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'q',
            schema: { type: 'string' },
            required: false,
            description: 'Recherche texte',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', example: '-createdAt' },
          },
          {
            in: 'query',
            name: 'includeDeleted',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
          {
            in: 'query',
            name: 'onlyDeleted',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
          {
            in: 'query',
            name: 'format',
            schema: { type: 'string', enum: ['csv'] },
            required: false,
          },
          {
            in: 'query',
            name: 'includeAppointments',
            schema: { type: 'string', enum: ['false'] },
            required: false,
            description: 'Désactiver les rendez-vous (inclus par défaut)',
          },
          {
            in: 'query',
            name: 'appointmentsLimit',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            required: false,
            description: 'Nombre max de rendez-vous par client (défaut: 10)',
          },
        ],
        responses: {
          '200': {
            description: 'Liste des clients',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ClientListItem' },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                  },
                  required: ['items', 'total', 'page', 'pages'],
                },
              },
              'text/csv': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Créer un client',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ClientCreate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Client existant mis à jour',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { $ref: '#/components/schemas/Client' },
                    message: {
                      type: 'string',
                      example: 'Client existant mis à jour',
                    },
                    wasExisting: { type: 'boolean', example: true },
                  },
                  required: ['client', 'message', 'wasExisting'],
                },
              },
            },
          },
          '201': {
            description: 'Nouveau client créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { $ref: '#/components/schemas/Client' },
                    message: { type: 'string', example: 'Nouveau client créé' },
                    wasExisting: { type: 'boolean', example: false },
                  },
                  required: ['client', 'message', 'wasExisting'],
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Conflict - email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  duplicateEmail: {
                    summary: 'Email already exists',
                    value: {
                      error: {
                        errorId: 'AUTH_EMAIL_ALREADY_EXISTS',
                        message: 'Email already exists',
                        description: 'An account with this email already exists',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/clients/{id}': {
      get: {
        summary: 'Obtenir un client',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'includeInvoices',
            required: false,
            schema: { type: 'string', enum: ['true'] },
            description: 'Inclure une liste de factures récentes du client',
          },
          {
            in: 'query',
            name: 'invoicesLimit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
            description: 'Nombre max de factures à inclure si includeInvoices=true',
          },
          {
            in: 'query',
            name: 'includeAppointments',
            schema: { type: 'string', enum: ['false'] },
            required: false,
            description: 'Désactiver les rendez-vous (inclus par défaut)',
          },
          {
            in: 'query',
            name: 'appointmentsLimit',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            required: false,
            description: 'Nombre max de rendez-vous (défaut: 10)',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { $ref: '#/components/schemas/Client' },
                    invoiceSummary: { $ref: '#/components/schemas/InvoiceSummary' },
                    invoices: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/InvoiceWithOptionalClient' },
                    },
                    appointments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SimplifiedAppointment' },
                    },
                  },
                  required: ['client', 'invoiceSummary', 'appointments'],
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Conflict - email/phone already used in tenant',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  duplicateClient: {
                    summary: 'Client already exists',
                    value: {
                      error: {
                        errorId: 'CRM_CLIENT_ALREADY_EXISTS',
                        message: 'Client already exists',
                        description: 'A client with this email already exists in the tenant',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Mettre à jour un client',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ClientUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { $ref: '#/components/schemas/Client' },
                  },
                  required: ['client'],
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Supprimer un client',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'cascade',
            required: true,
            schema: { type: 'string', enum: ['true'] },
            description: 'Obligatoire pour confirmer la suppression en cascade',
          },
          {
            in: 'query',
            name: 'hard',
            required: false,
            schema: { type: 'string', enum: ['true'] },
            description: 'Supprimer physiquement le client (sinon soft delete avec deletedAt)',
          },
        ],
        responses: {
          '200': { description: 'OK' },
          '400': {
            description: 'Cascade parameter required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  cascadeRequired: {
                    summary: 'Cascade parameter required',
                    value: {
                      error: {
                        errorId: 'INVALID_REQUEST',
                        message: 'Invalid request',
                        description: 'The cascade parameter is required to confirm deletion',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/clients/{id}/restore': {
      post: {
        summary: 'Restaurer un client soft-deleted',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Client restauré',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { $ref: '#/components/schemas/Client' },
                  },
                  required: ['client'],
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist or is already active',
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Conflict - email/phone already used in tenant',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  duplicateClient: {
                    summary: 'Client already exists',
                    value: {
                      error: {
                        errorId: 'CRM_CLIENT_ALREADY_EXISTS',
                        message: 'Client already exists',
                        description: 'A client with this email already exists in the tenant',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // CRM — Rendez-vous
    '/v1/appointments': {
      get: {
        summary: 'Lister les rendez-vous',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'clientId',
            schema: { type: 'string' },
            required: false,
          },
          {
            in: 'query',
            name: 'from',
            schema: { type: 'string', format: 'date-time' },
            required: false,
          },
          {
            in: 'query',
            name: 'to',
            schema: { type: 'string', format: 'date-time' },
            required: false,
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['scheduled', 'in_progress', 'done', 'canceled', 'rescheduled'],
            },
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', example: 'startAt' },
          },
          {
            in: 'query',
            name: 'includeClient',
            schema: { type: 'string', enum: ['false'] },
            required: false,
            description: 'Désactiver les informations client (incluses par défaut)',
          },
          {
            in: 'query',
            name: 'includeInvoiceSummary',
            schema: { type: 'string', enum: ['false'] },
            required: false,
            description: 'Désactiver le résumé de facturation (inclus par défaut)',
          },
          {
            in: 'query',
            name: 'includeDeleted',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
          {
            in: 'query',
            name: 'onlyDeleted',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
          {
            in: 'query',
            name: 'format',
            schema: { type: 'string', enum: ['csv'] },
            required: false,
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AppointmentWithOptionalClient' },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                  },
                  required: ['items', 'total', 'page', 'pages'],
                },
              },
              'text/csv': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Créer un rendez-vous',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    appointment: { $ref: '#/components/schemas/Appointment' },
                  },
                  required: ['appointment'],
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/appointments/{id}': {
      get: {
        summary: 'Obtenir un rendez-vous',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'includeClient',
            schema: { type: 'string', enum: ['false'] },
            required: false,
            description: 'Désactiver les informations client (incluses par défaut)',
          },
          {
            in: 'query',
            name: 'includeInvoiceSummary',
            schema: { type: 'string', enum: ['false'] },
            required: false,
            description: 'Désactiver le résumé de facturation (inclus par défaut)',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    appointment: { $ref: '#/components/schemas/AppointmentWithOptionalClient' },
                  },
                  required: ['appointment'],
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Mettre à jour un rendez-vous',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentUpdate' },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Supprimer un rendez-vous',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'OK' },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/appointments/{id}/status': {
      patch: {
        summary: "Mettre à jour uniquement le statut d'un rendez-vous",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['scheduled', 'in_progress', 'done', 'canceled', 'rescheduled'],
                  },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // CRM — Factures
    '/v1/invoices': {
      get: {
        summary: 'Lister les factures',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'clientId',
            schema: { type: 'string' },
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', example: '-createdAt' },
          },
          {
            in: 'query',
            name: 'includeDeleted',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
          {
            in: 'query',
            name: 'onlyDeleted',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
          {
            in: 'query',
            name: 'format',
            schema: { type: 'string', enum: ['csv'] },
            required: false,
          },
          {
            in: 'query',
            name: 'includeClient',
            required: false,
            schema: { type: 'string', enum: ['false'] },
            description:
              "Inclure les infos client dans la réponse (par défaut true). Passer 'false' pour désactiver.",
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/InvoiceWithOptionalClient' },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                  },
                  required: ['items', 'total', 'page', 'pages'],
                },
              },
              'text/csv': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Créer une facture',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvoiceCreate' },
              examples: {
                sansPayement: {
                  summary: 'Facture sans paiement initial',
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    totalAmount: 1000,
                    currency: 'EUR',
                    notes: {
                      reason: 'Consultation',
                      comment: 'Paiement à faire ultérieurement',
                    },
                  },
                },
                avecAdvanceAmount: {
                  summary: 'Facture avec avance (méthode classique)',
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    totalAmount: 1000,
                    advanceAmount: 300,
                    currency: 'EUR',
                    notes: {
                      reason: 'Consultation',
                    },
                  },
                },
                avecPayement: {
                  summary: 'Facture avec paiement initial détaillé (recommandé)',
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    totalAmount: 1000,
                    currency: 'EUR',
                    notes: {
                      reason: 'Consultation initiale',
                    },
                    payment: {
                      amount: 300,
                      method: 'cash',
                      notes: 'Acompte reçu en espèces',
                    },
                  },
                },
                avecPayementCarte: {
                  summary: 'Facture avec paiement par carte',
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    totalAmount: 1500,
                    currency: 'EUR',
                    notes: {
                      reason: 'Traitement complet',
                    },
                    payment: {
                      amount: 500,
                      method: 'card',
                      reference: 'CARD-2025-001',
                      notes: 'Premier acompte par CB',
                    },
                  },
                },
                avecPaymentsTableau: {
                  summary: 'Facture avec tableau de paiements (format front)',
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    totalAmount: 350,
                    creditAmount: 0,
                    currency: 'EUR',
                    notes: {
                      comment: 'Une avance',
                    },
                    payments: [
                      {
                        amount: 50,
                        method: 'cash',
                        notes: 'Paiement initial (création facture)',
                      },
                    ],
                  },
                },
                factureOptique: {
                  summary: 'Facture optique avec prescription snapshot',
                  value: {
                    clientId: '68ca6b15203bb6ac8918c52c',
                    totalAmount: 1200,
                    currency: 'MAD',
                    notes: {
                      reason: 'Facture optique',
                      comment: 'Monture et verres correcteurs',
                    },
                    prescriptionSnapshot: {
                      kind: 'glasses',
                      correction: {
                        od: {
                          sphere: -2.5,
                          cylinder: -0.75,
                          axis: 180,
                          add: null,
                          prism: null,
                        },
                        og: {
                          sphere: -2.25,
                          cylinder: -0.5,
                          axis: 10,
                          add: null,
                          prism: null,
                        },
                      },
                      glassesParams: {
                        lensType: 'single_vision',
                        index: '1.60',
                        treatments: ['anti_reflect'],
                        pd: {
                          mono: {
                            od: 32,
                            og: 32,
                          },
                        },
                      },
                      issuedAt: '2025-01-15T10:00:00Z',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    invoice: { $ref: '#/components/schemas/Invoice' },
                    invoiceSummary: {
                      $ref: '#/components/schemas/InvoiceSummary',
                      description: 'Résumé mis à jour pour le client',
                    },
                  },
                  required: ['invoice', 'invoiceSummary'],
                },
              },
            },
          },
          '400': {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation error',
                    value: {
                      error: {
                        errorId: 'VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/invoices/{id}': {
      get: {
        summary: 'Obtenir une facture',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'includeClient',
            required: false,
            schema: { type: 'string', enum: ['false'] },
            description:
              "Inclure les infos client (par défaut true). Passer 'false' pour désactiver.",
          },
        ],
        responses: {
          '200': { description: 'OK' },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Mettre à jour une facture',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvoiceUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    invoice: { $ref: '#/components/schemas/Invoice' },
                    invoiceSummary: {
                      $ref: '#/components/schemas/InvoiceSummary',
                      description: 'Résumé mis à jour pour le client',
                    },
                  },
                  required: ['invoice', 'invoiceSummary'],
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Supprimer une facture',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'hard',
            required: false,
            schema: { type: 'string', enum: ['true'] },
            description: 'Suppression définitive (true) ou soft delete (défaut)',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    hardDeleted: { type: 'boolean', example: false },
                    invoiceSummary: {
                      $ref: '#/components/schemas/InvoiceSummary',
                      description: 'Résumé recalculé pour le client',
                    },
                    clientId: { type: 'string', description: 'ID du client' },
                  },
                  required: ['ok', 'hardDeleted', 'invoiceSummary', 'clientId'],
                },
              },
            },
          },
          '404': {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Resource not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested resource does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/invoices/{id}/payments': {
      post: {
        summary: 'Ajouter un paiement à une facture',
        description:
          'Ajoute un paiement à une facture. Le montant advanceAmount est automatiquement recalculé à partir de la somme des paiements.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID de la facture',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: {
                    type: 'number',
                    minimum: 0.01,
                    description: 'Montant du paiement',
                    example: 300,
                  },
                  method: {
                    type: 'string',
                    enum: ['cash', 'card', 'transfer', 'check', 'paypal', 'stripe', 'other'],
                    description: 'Méthode de paiement',
                    example: 'cash',
                  },
                  reference: {
                    type: 'string',
                    description: 'Référence de transaction (numéro de chèque, etc.)',
                    example: 'CHQ-2025-001',
                  },
                  paidAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date du paiement (par défaut: maintenant)',
                    example: '2025-09-30T10:00:00.000Z',
                  },
                  notes: {
                    type: 'string',
                    description: 'Notes additionnelles',
                    example: 'Premier acompte',
                  },
                },
              },
              examples: {
                especes: {
                  summary: 'Paiement en espèces',
                  value: {
                    amount: 300,
                    method: 'cash',
                    notes: 'Premier acompte',
                  },
                },
                carte: {
                  summary: 'Paiement par carte',
                  value: {
                    amount: 500,
                    method: 'card',
                    reference: 'CARD-2025-001',
                    notes: 'Paiement par carte bancaire',
                  },
                },
                virement: {
                  summary: 'Virement bancaire',
                  value: {
                    amount: 1000,
                    method: 'transfer',
                    reference: 'VIR-XYZ-123',
                    paidAt: '2025-09-30T14:30:00.000Z',
                    notes: 'Virement reçu',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Paiement ajouté avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    invoice: { $ref: '#/components/schemas/Invoice' },
                    invoiceSummary: { $ref: '#/components/schemas/InvoiceSummary' },
                  },
                  required: ['invoice', 'invoiceSummary'],
                },
              },
            },
          },
          '400': {
            description: 'Erreur de validation (montant dépassant le restant dû)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  paymentExceeds: {
                    summary: 'Payment exceeds remaining amount',
                    value: {
                      error: {
                        errorId: 'CRM_INVOICE_PAYMENT_EXCEEDS_AMOUNT',
                        message: 'Payment exceeds invoice amount',
                        description: 'Payment amount cannot exceed the remaining invoice amount',
                        details: {
                          remaining: 300,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Invoice not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invoiceNotFound: {
                    summary: 'Invoice not found',
                    value: {
                      error: {
                        errorId: 'INVOICE_NOT_FOUND',
                        message: 'Invoice not found',
                        description: 'The requested invoice does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/invoices/{id}/payments/{paymentId}': {
      delete: {
        summary: "Supprimer un paiement d'une facture",
        description:
          'Supprime un paiement spécifique. Utile pour corriger une erreur de saisie. Le montant advanceAmount est automatiquement recalculé.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID de la facture',
          },
          {
            in: 'path',
            name: 'paymentId',
            required: true,
            schema: { type: 'string' },
            description: 'ID du paiement à supprimer',
          },
        ],
        responses: {
          '200': {
            description: 'Paiement supprimé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    invoice: { $ref: '#/components/schemas/Invoice' },
                    invoiceSummary: { $ref: '#/components/schemas/InvoiceSummary' },
                  },
                  required: ['invoice', 'invoiceSummary'],
                },
              },
            },
          },
          '404': {
            description: 'Invoice or payment not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invoiceNotFound: {
                    summary: 'Invoice not found',
                    value: {
                      error: {
                        errorId: 'INVOICE_NOT_FOUND',
                        message: 'Invoice not found',
                        description: 'The requested invoice does not exist',
                      },
                    },
                  },
                  paymentNotFound: {
                    summary: 'Payment not found',
                    value: {
                      error: {
                        errorId: 'NOT_FOUND',
                        message: 'Resource not found',
                        description: 'The requested payment does not exist',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  unauthorized: {
                    summary: 'Unauthorized',
                    value: {
                      error: {
                        errorId: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        description: 'Authentication is required to access this resource',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/optician/prescriptions': {
      post: {
        summary: 'Créer une prescription optique (glasses/contacts)',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OpticalPrescriptionCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prescription: { $ref: '#/components/schemas/OpticalPrescription' },
                  },
                  required: ['prescription'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  validation: {
                    summary: 'Validation failed',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_VALIDATION_FAILED',
                        message: 'Validation failed',
                        description:
                          'The request data does not meet the required validation criteria',
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Database error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  db: {
                    summary: 'DB error',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_DATABASE_ERROR',
                        message: 'Database operation failed',
                        description: 'An error occurred while performing the database operation',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: 'Lister les prescriptions',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'clientId', schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/OpticalPrescription' },
                    },
                  },
                  required: ['items'],
                },
              },
            },
          },
          '500': {
            description: 'Database error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/v1/optician/prescriptions/{id}': {
      get: {
        summary: 'Obtenir une prescription',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prescription: { $ref: '#/components/schemas/OpticalPrescription' },
                  },
                  required: ['prescription'],
                },
              },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Prescription not found',
                    value: {
                      error: {
                        errorId: 'OPTICIAN_PRESCRIPTION_NOT_FOUND',
                        message: 'Prescription not found',
                        description:
                          'The requested optical prescription does not exist or has been deleted',
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Database error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      patch: {
        summary: 'Mettre à jour une prescription',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OpticalPrescriptionUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prescription: { $ref: '#/components/schemas/OpticalPrescription' },
                  },
                  required: ['prescription'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '500': {
            description: 'Database error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        summary: 'Supprimer une prescription',
        tags: ['optician'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean' } },
                  required: ['ok'],
                },
              },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '500': {
            description: 'Database error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API Key requis en production (optionnel en développement)',
      },
    },
    schemas: {
      Prism: {
        type: 'object',
        properties: {
          value: { type: 'number', nullable: true },
          base: { type: 'string', enum: Object.values(PrismBase), nullable: true },
        },
      },
      EyeCorrection: {
        type: 'object',
        properties: {
          sphere: { type: 'number', minimum: -20, maximum: 20, nullable: true },
          cylinder: { type: 'number', minimum: -20, maximum: 20, nullable: true },
          axis: { type: 'number', minimum: 0, maximum: 180, nullable: true },
          add: { type: 'number', minimum: -10, maximum: 10, nullable: true },
          prism: { $ref: '#/components/schemas/Prism' },
        },
      },
      GlassesParams: {
        type: 'object',
        properties: {
          lensType: { type: 'string', enum: Object.values(LensType) },
          index: { type: 'string', enum: Object.values(LensIndex) },
          treatments: { type: 'array', items: { type: 'string', enum: Object.values(Treatment) } },
          pd: {
            oneOf: [
              { type: 'number' },
              {
                type: 'object',
                properties: {
                  mono: {
                    type: 'object',
                    properties: { od: { type: 'number' }, og: { type: 'number' } },
                  },
                  near: { type: 'number' },
                },
              },
            ],
          },
          segmentHeight: { type: 'number' },
          vertexDistance: { type: 'number' },
          baseCurve: { type: 'number' },
          frame: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: Object.values(FrameType) },
              eye: { type: 'number' },
              bridge: { type: 'number' },
              temple: { type: 'number' },
              material: { type: 'string' },
            },
          },
        },
        required: ['lensType', 'index'],
      },
      ContactLensParams: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.values(ContactType) },
          design: { type: 'string', enum: Object.values(DesignType) },
          add: { type: 'number' },
          toric: {
            type: 'object',
            properties: {
              cylinder: { type: 'number' },
              axis: { type: 'number', minimum: 0, maximum: 180 },
              stabilisation: { type: 'string', enum: Object.values(StabilisationType) },
            },
          },
          material: {
            type: 'object',
            properties: {
              family: { type: 'string', enum: Object.values(MaterialFamily) },
              waterContent: { type: 'number' },
              dk_t: { type: 'number' },
            },
            // optional in POST
          },
          schedule: {
            type: 'object',
            properties: {
              wear: { type: 'string', enum: Object.values(WearType) },
              replacement: { type: 'string', enum: Object.values(ReplacementType) },
            },
            // optional in POST
          },
          geometry: {
            type: 'object',
            properties: { bc: { type: 'number' }, dia: { type: 'number' } },
            // optional in POST
          },
          options: { type: 'array', items: { type: 'string', enum: ['tint', 'uv'] } },
          care: { type: 'object', properties: { solutionBrand: { type: 'string' } } },
        },
        // all fields optional when contactLensParams provided on POST
      },
      OpticalPrescription: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          clientId: { type: 'string' },
          kind: { type: 'string', enum: ['glasses', 'contacts'] },
          correction: {
            type: 'object',
            properties: {
              od: { $ref: '#/components/schemas/EyeCorrection' },
              og: { $ref: '#/components/schemas/EyeCorrection' },
            },
            required: ['od', 'og'],
          },
          glassesParams: { $ref: '#/components/schemas/GlassesParams' },
          contactLensParams: { $ref: '#/components/schemas/ContactLensParams' },
          issuedAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          notes: { type: 'string', nullable: true },
          source: { type: 'string', enum: ['manual', 'ocr'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['tenantId', 'clientId', 'kind', 'correction', 'issuedAt'],
      },
      OpticalPrescriptionCreate: {
        allOf: [
          {
            type: 'object',
            properties: {
              clientId: { type: 'string' },
              kind: { type: 'string', enum: ['glasses', 'contacts'] },
              correction: {
                type: 'object',
                properties: {
                  od: { $ref: '#/components/schemas/EyeCorrection' },
                  og: { $ref: '#/components/schemas/EyeCorrection' },
                },
                required: ['od', 'og'],
              },
              glassesParams: { $ref: '#/components/schemas/GlassesParams' },
              contactLensParams: { $ref: '#/components/schemas/ContactLensParams' },
              issuedAt: { type: 'string', format: 'date-time' },
              expiresAt: { type: 'string', format: 'date-time', nullable: true },
              notes: { type: 'string', nullable: true },
              source: { type: 'string', enum: ['manual', 'ocr'] },
            },
            required: ['clientId', 'kind', 'correction', 'issuedAt'],
          },
        ],
      },
      OpticalPrescriptionUpdate: {
        allOf: [{ $ref: '#/components/schemas/OpticalPrescriptionCreate' }],
      },
      EyeValues: {
        type: 'object',
        properties: {
          sphere: { type: 'number', minimum: -20, maximum: 20, nullable: true },
          cylinder: { type: 'number', minimum: -20, maximum: 20, nullable: true },
          axis: { type: 'number', minimum: 0, maximum: 180, nullable: true },
          add: { type: 'number', minimum: -10, maximum: 10, nullable: true },
        },
      },
      EyeMeasurementSet: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          clientId: { type: 'string' },
          measuredAt: { type: 'string', format: 'date-time' },
          receivedAt: { type: 'string', format: 'date-time', nullable: true },
          source: { type: 'string', enum: ['manual', 'ocr'] },
          nextRenewalAt: { type: 'string', format: 'date-time', nullable: true },
          notes: { type: 'string', nullable: true },
          observation: { type: 'string', nullable: true },
          pd: { type: 'number', minimum: 40, maximum: 80, nullable: true },
          od: { $ref: '#/components/schemas/EyeValues' },
          og: { $ref: '#/components/schemas/EyeValues' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['_id', 'tenantId', 'clientId', 'measuredAt', 'od', 'og'],
      },
      EyeMeasurementSetCreate: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          measuredAt: { type: 'string', format: 'date-time' },
          receivedAt: { type: 'string', format: 'date-time', nullable: true },
          source: { type: 'string', enum: ['manual', 'ocr'] },
          nextRenewalAt: { type: 'string', format: 'date-time', nullable: true },
          notes: { type: 'string', nullable: true },
          observation: { type: 'string', nullable: true },
          pd: { type: 'number', minimum: 40, maximum: 80, nullable: true },
          od: { $ref: '#/components/schemas/EyeValues' },
          og: { $ref: '#/components/schemas/EyeValues' },
        },
        required: ['clientId', 'measuredAt', 'od', 'og'],
      },
      EyeMeasurementSetUpdate: {
        allOf: [{ $ref: '#/components/schemas/EyeMeasurementSetCreate' }],
      },
      TenantInfo: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          clientType: { type: 'string', enum: Object.values(ClientType) },
          capabilities: {
            type: 'array',
            items: { type: 'string', enum: Object.values(Capability) },
          },
          featureFlags: {
            type: 'object',
            additionalProperties: { type: 'boolean' },
          },
        },
        required: ['tenantId', 'clientType', 'capabilities'],
      },
      AgentSettings: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          enabled: { type: 'boolean', example: false },
          quietHours: {
            type: 'object',
            nullable: true,
            properties: {
              start: { type: 'string', example: '21:00' },
              end: { type: 'string', example: '08:00' },
            },
          },
          daysBeforeReminder: { type: 'integer', example: 2 },
          reengageAfterDays: { type: 'integer', example: 30 },
          locale: { type: 'string', example: 'fr' },
          fallbackLocale: { type: 'string', example: 'fr' },
          timezone: { type: 'string', example: 'Europe/Paris' },
          model: { type: 'string', example: 'gpt-4o-mini' },
          tone: { type: 'string', example: 'friendly' },
          provider: { type: 'string', enum: ['mock', 'meta', 'twilio'], example: 'mock' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'tenantId',
          'enabled',
          'daysBeforeReminder',
          'reengageAfterDays',
          'locale',
          'fallbackLocale',
        ],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '68ca6b15203bb6ac8918c52c' },
          email: {
            type: 'string',
            format: 'email',
            example: 'test@booklio.com',
          },
          tenantId: { type: 'string', example: 't1' },
          roles: {
            type: 'array',
            items: { type: 'string' },
            example: ['admin'],
          },
          // Informations personnelles (optionnelles)
          firstName: {
            type: 'string',
            description: 'Prénom',
            example: 'Jean',
          },
          lastName: {
            type: 'string',
            description: 'Nom de famille',
            example: 'Dupont',
          },
          phone: {
            type: 'string',
            description: 'Numéro de téléphone personnel',
            example: '+33 6 12 34 56 78',
          },
          // Informations du magasin/entreprise (optionnelles)
          storeName: {
            type: 'string',
            description: 'Nom du magasin ou raison sociale',
            example: 'Optique du Centre',
          },
          storeAddress: {
            type: 'string',
            description: 'Adresse du magasin',
            example: '123 Rue de la Paix, 75001 Paris',
          },
          phoneNumber: {
            type: 'string',
            description: 'Numéro de téléphone du magasin',
            example: '+33 1 23 45 67 89',
          },
          patenteNumber: {
            type: 'string',
            description: 'Numéro de patente',
            example: '123456789',
          },
          rcNumber: {
            type: 'string',
            description: 'Registre de commerce (RC)',
            example: 'RC123456',
          },
          npeNumber: {
            type: 'string',
            description: 'NPE',
            example: 'NPE987654',
          },
          iceNumber: {
            type: 'string',
            description: 'ICE',
            example: 'ICE123456789',
          },
        },
        required: ['id', 'email', 'tenantId', 'roles'],
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOi...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
        },
        required: ['accessToken', 'refreshToken'],
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          tokens: { $ref: '#/components/schemas/Tokens' },
        },
        required: ['user', 'tokens'],
      },
      TokensResponse: {
        type: 'object',
        properties: {
          tokens: { $ref: '#/components/schemas/Tokens' },
        },
        required: ['tokens'],
      },
      UserResponse: {
        type: 'object',
        properties: { user: { $ref: '#/components/schemas/User' } },
        required: ['user'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              errorId: {
                type: 'string',
                example: 'OPTICIAN_VALIDATION_FAILED',
                description: 'Unique error identifier for programmatic handling',
              },
              message: {
                type: 'string',
                example: 'Validation failed',
                description: 'Human-readable error message',
              },
              description: {
                type: 'string',
                example: 'The request data does not meet the required validation criteria',
                description: 'Detailed error description',
              },
              details: {
                type: 'object',
                description: 'Additional error context and details',
                additionalProperties: true,
              },
            },
            required: ['errorId', 'message', 'description'],
          },
        },
        required: ['error'],
      },
      // Google Calendar
      GoogleTokens: {
        type: 'object',
        properties: {
          access_token: { type: 'string', example: 'ya29....' },
          refresh_token: { type: 'string', example: '1//0g...' },
          scope: {
            type: 'string',
            example: 'https://www.googleapis.com/auth/calendar.readonly',
          },
          token_type: { type: 'string', example: 'Bearer' },
          expiry_date: {
            type: 'integer',
            example: 1737032210000,
            description: 'Epoch ms',
          },
        },
        required: ['access_token', 'refresh_token'],
      },
      CalendarItem: {
        type: 'object',
        additionalProperties: true,
        properties: {
          id: { type: 'string', example: 'primary' },
          summary: { type: 'string', example: 'Mon agenda' },
        },
      },
      EventItem: {
        type: 'object',
        additionalProperties: true,
        properties: {
          id: { type: 'string', example: 'evt_123' },
          status: { type: 'string', example: 'confirmed' },
          summary: { type: 'string', example: 'Rendez-vous' },
          start: { type: 'object', additionalProperties: true },
          end: { type: 'object', additionalProperties: true },
        },
      },
      // CRM
      Client: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['_id', 'tenantId', 'firstName', 'lastName'],
      },
      SimplifiedAppointment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          clientId: { type: 'string' },
          title: { type: 'string', nullable: true },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
          reminder48hSentAt: { type: 'string', format: 'date-time', nullable: true },
          notes: {
            type: 'object',
            nullable: true,
            properties: {
              reason: { type: 'string' },
              comment: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['_id', 'tenantId', 'clientId', 'startAt', 'endAt', 'status'],
      },
      ClientListItem: {
        allOf: [
          { $ref: '#/components/schemas/Client' },
          {
            type: 'object',
            properties: {
              invoiceSummary: { $ref: '#/components/schemas/InvoiceSummary' },
              appointments: {
                type: 'array',
                items: { $ref: '#/components/schemas/SimplifiedAppointment' },
              },
            },
          },
        ],
      },
      ClientCreate: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
        },
        required: ['firstName', 'lastName'],
      },
      ClientUpdate: { allOf: [{ $ref: '#/components/schemas/ClientCreate' }] },
      Appointment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          clientId: { type: 'string' },
          title: { type: 'string' },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          status: {
            type: 'string',
            enum: ['scheduled', 'in_progress', 'done', 'canceled', 'rescheduled'],
          },
          reminder48hSentAt: { type: 'string', format: 'date-time', nullable: true },
          notes: {
            type: 'object',
            properties: { reason: { type: 'string' }, comment: { type: 'string' } },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['_id', 'tenantId', 'clientId', 'startAt', 'endAt', 'status'],
      },
      AppointmentCreate: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          title: { type: 'string' },
          startAt: { type: 'string', format: 'date-time' },
          endAt: { type: 'string', format: 'date-time' },
          status: {
            type: 'string',
            enum: ['scheduled', 'in_progress', 'done', 'canceled', 'rescheduled'],
          },
          notes: {
            type: 'object',
            properties: { reason: { type: 'string' }, comment: { type: 'string' } },
          },
        },
        required: ['clientId', 'startAt', 'endAt'],
      },
      AppointmentUpdate: {
        allOf: [{ $ref: '#/components/schemas/AppointmentCreate' }],
      },
      AppointmentWithOptionalClient: {
        allOf: [
          { $ref: '#/components/schemas/Appointment' },
          {
            type: 'object',
            properties: {
              clientId: { type: 'string' },
              client: {
                type: 'object',
                nullable: true,
                properties: {
                  _id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  phone: { type: 'string', nullable: true },
                },
                required: ['_id', 'firstName', 'lastName'],
              },
              invoiceSummary: {
                type: 'object',
                nullable: true,
                properties: {
                  totalAmount: { type: 'number' },
                  dueAmount: { type: 'number' },
                  invoiceCount: { type: 'number' },
                  lastInvoiceAt: { type: 'string', format: 'date-time', nullable: true },
                },
                required: ['totalAmount', 'dueAmount', 'invoiceCount', 'lastInvoiceAt'],
              },
            },
          },
        ],
      },
      PaymentEntry: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'ID unique du paiement' },
          amount: { type: 'number', minimum: 0, description: 'Montant du paiement' },
          method: {
            type: 'string',
            description: 'Méthode de paiement',
            enum: ['cash', 'card', 'transfer', 'check', 'paypal', 'stripe', 'other'],
            nullable: true,
          },
          reference: {
            type: 'string',
            description: 'Référence de transaction (numéro de chèque, etc.)',
            nullable: true,
          },
          paidAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date du paiement',
          },
          notes: {
            type: 'string',
            description: 'Notes additionnelles',
            nullable: true,
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['_id', 'amount', 'paidAt'],
      },
      Invoice: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          tenantId: { type: 'string' },
          clientId: { type: 'string' },
          invoiceNumber: {
            type: 'integer',
            description: 'Numéro de facture auto-incrémenté par tenant (1, 2, 3, ...)',
            example: 1,
          },
          totalAmount: { type: 'number' },
          advanceAmount: {
            type: 'number',
            description: 'Calculé automatiquement à partir des paiements',
          },
          creditAmount: { type: 'number' },
          currency: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'partial', 'paid'] },
          notes: {
            type: 'object',
            properties: { reason: { type: 'string' }, comment: { type: 'string' } },
          },
          payments: {
            type: 'array',
            description: 'Historique des paiements',
            items: { $ref: '#/components/schemas/PaymentEntry' },
            default: [],
          },
          remainingAmount: {
            type: 'number',
            description: 'Calculé: total - (avance + avoir)',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['_id', 'tenantId', 'clientId', 'totalAmount'],
      },
      InvoiceClient: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
        },
        required: ['_id', 'firstName', 'lastName'],
      },
      InvoiceWithOptionalClient: {
        allOf: [
          { $ref: '#/components/schemas/Invoice' },
          {
            type: 'object',
            properties: {
              client: { $ref: '#/components/schemas/InvoiceClient' },
            },
          },
        ],
      },
      InvoiceSummary: {
        type: 'object',
        properties: {
          totalAmount: { type: 'number', example: 1200 },
          dueAmount: { type: 'number', example: 300 },
          invoiceCount: { type: 'integer', example: 4 },
          lastInvoiceAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['totalAmount', 'dueAmount', 'invoiceCount'],
      },
      InvoiceCreate: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          totalAmount: { type: 'number' },
          advanceAmount: {
            type: 'number',
            description:
              "Montant de l'avance (ignoré si 'payment' est fourni, car calculé automatiquement)",
          },
          creditAmount: { type: 'number' },
          currency: { type: 'string' },
          notes: {
            type: 'object',
            properties: { reason: { type: 'string' }, comment: { type: 'string' } },
          },
          payment: {
            type: 'object',
            description:
              "Paiement initial optionnel (objet unique). Si fourni, remplace 'advanceAmount' et ajoute l'historique.",
            properties: {
              amount: {
                type: 'number',
                minimum: 0.01,
                description: 'Montant du paiement',
              },
              method: {
                type: 'string',
                enum: ['cash', 'card', 'transfer', 'check', 'paypal', 'stripe', 'other'],
                description: 'Méthode de paiement',
              },
              reference: {
                type: 'string',
                description: 'Référence de transaction',
              },
              paidAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date du paiement (par défaut: maintenant)',
              },
              notes: {
                type: 'string',
                description: 'Notes sur le paiement',
              },
            },
            required: ['amount'],
          },
          payments: {
            type: 'array',
            description:
              "Tableau de paiements initiaux (prioritaire sur 'payment' et 'advanceAmount'). Permet de créer une facture avec plusieurs paiements d'emblée.",
            items: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  minimum: 0.01,
                  description: 'Montant du paiement',
                },
                method: {
                  type: 'string',
                  enum: ['cash', 'card', 'transfer', 'check', 'paypal', 'stripe', 'other'],
                  description: 'Méthode de paiement',
                },
                reference: {
                  type: 'string',
                  description: 'Référence de transaction',
                },
                paidAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date du paiement (par défaut: maintenant)',
                },
                notes: {
                  type: 'string',
                  description: 'Notes sur le paiement',
                },
              },
              required: ['amount'],
            },
          },
          prescriptionId: {
            type: 'string',
            description: 'ID de la prescription optique associée (optionnel)',
            example: '68ca6b15203bb6ac8918c52c',
          },
          prescriptionSnapshot: {
            type: 'object',
            description: 'Snapshot de la prescription optique au moment de la création de la facture (optionnel)',
            properties: {
              kind: {
                type: 'string',
                enum: ['glasses', 'contacts'],
                description: 'Type de prescription',
              },
              correction: {
                type: 'object',
                properties: {
                  od: {
                    type: 'object',
                    properties: {
                      sphere: { type: 'number', nullable: true },
                      cylinder: { type: 'number', nullable: true },
                      axis: { type: 'number', nullable: true },
                      add: { type: 'number', nullable: true },
                      prism: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          value: { type: 'number', nullable: true },
                          base: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                  og: {
                    type: 'object',
                    properties: {
                      sphere: { type: 'number', nullable: true },
                      cylinder: { type: 'number', nullable: true },
                      axis: { type: 'number', nullable: true },
                      add: { type: 'number', nullable: true },
                      prism: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          value: { type: 'number', nullable: true },
                          base: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                },
                required: ['od', 'og'],
              },
              glassesParams: {
                type: 'object',
                properties: {
                  lensType: { type: 'string' },
                  index: { type: 'string' },
                  treatments: { type: 'array', items: { type: 'string' } },
                  pd: {
                    oneOf: [
                      { type: 'number' },
                      {
                        type: 'object',
                        properties: {
                          mono: {
                            type: 'object',
                            properties: {
                              od: { type: 'number' },
                              og: { type: 'number' },
                            },
                            required: ['od', 'og'],
                          },
                          near: { type: 'number' },
                        },
                        required: ['mono'],
                      },
                    ],
                  },
                  segmentHeight: { type: 'number' },
                  vertexDistance: { type: 'number' },
                  baseCurve: { type: 'number' },
                  frame: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      eye: { type: 'number' },
                      bridge: { type: 'number' },
                      temple: { type: 'number' },
                      material: { type: 'string' },
                    },
                  },
                },
              },
              contactLensParams: {
                type: 'object',
                description: 'Paramètres pour lentilles de contact',
                additionalProperties: true,
              },
              issuedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date d\'émission de la prescription',
              },
            },
            required: ['kind', 'correction'],
          },
        },
        required: ['clientId', 'totalAmount'],
      },
      InvoiceUpdate: {
        allOf: [{ $ref: '#/components/schemas/InvoiceCreate' }],
      },
    },
  },
};
