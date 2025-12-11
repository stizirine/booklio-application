import { Router, type Response } from 'express';
import rateLimit from 'express-rate-limit';

import { ClientModel } from '@crm/clients/model.js';

import { requireAuth, type AuthenticatedRequest } from '@middlewares/requireAuth.js';

import { metrics } from '../../metrics.js';

import { MessageComposer } from './composer.js';
import { MessageChannels, ProviderTypes } from './enums.js';
import {
  handleAgentTemplateNotFoundError,
  handleNotFoundError,
  handleValidationError,
} from './errors.js';
import { idempotencyManager } from './idempotency.js';
import { MessageLogModel } from './messageLog.js';
import { SimpleClassifier } from './nlp/classifier.js';
import { decideNextAction } from './nlp/rules.js';
import { AgentPolicyModel } from './policies.js';
import { dlqManager } from './queue/dlqManager.js';
import { quotaManager } from './quotas.js';
import { runReengagementOnce } from './reengagement.js';
import { runReminders48hOnce } from './reminders.js';
import { MessageTemplateModel } from './templates.js';
import { getWhatsAppProvider } from './whatsapp/factory.js';

export const router = Router();

const composer = new MessageComposer();
// Le provider est résolu à la demande selon la policy
const classifier = new SimpleClassifier();

// Limiteur de débit pour les webhooks (60 req/min/IP)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/test-message', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = req.user as { tenantId: string };
    const {
      clientId,
      templateName,
      locale = 'fr',
      variables,
    } = (req.body || {}) as {
      clientId: string;
      templateName: string;
      locale?: string;
      variables?: Record<string, unknown>;
    };

    if (!clientId || !templateName)
      return res.status(400).json(
        handleValidationError({
          flatten: () => ({ fieldErrors: { clientId: ['Required'], templateName: ['Required'] } }),
        })
      );

    const client = await ClientModel.findOne({ _id: clientId, tenantId: current.tenantId });
    if (!client) return res.status(404).json(handleNotFoundError('client'));
    if (!client.phone) return res.status(400).json({ error: 'client_phone_missing' });

    const template = await MessageTemplateModel.findOne({
      tenantId: current.tenantId,
      name: templateName,
      locale,
    });
    if (!template) return res.status(404).json(handleAgentTemplateNotFoundError());

    const composed = composer.compose({
      template,
      variables: { firstName: client.firstName, locale, ...variables },
    });

    const idempotencyKey = `${current.tenantId}:${clientId}:${templateName}:test`;
    const provider = await getWhatsAppProvider(current.tenantId);
    const sendResult = await provider.sendTemplateMessage({
      toPhone: client.phone,
      templateName,
      variables: { ...variables, text: composed.text },
      locale,
      idempotencyKey,
    });

    await MessageLogModel.create({
      tenantId: current.tenantId,
      clientId: client._id,
      channel: MessageChannels.WhatsApp,
      templateName,
      locale,
      content: composed.text,
      variables,
      provider: sendResult.provider,
      providerMessageId: sendResult.providerMessageId,
      idempotencyKey,
      sentAt: new Date(),
    });

    return res.json({
      ok: sendResult.ok,
      providerMessageId: sendResult.providerMessageId,
      text: composed.text,
    });
  } catch (err) {
    return res.status(500).json({ error: 'send_failed', details: (err as Error).message });
  }
});

// Prévisualiser un template avec variables (sans envoi)
router.post('/preview', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = req.user as { tenantId: string };
    const {
      templateName,
      locale = 'fr',
      variables,
    } = (req.body || {}) as {
      templateName?: string;
      locale?: string;
      variables?: Record<string, unknown>;
    };
    if (!templateName) return res.status(400).json({ error: 'missing_templateName' });

    const template = await MessageTemplateModel.findOne({
      tenantId: current.tenantId,
      name: templateName,
      locale,
    });
    if (!template) return res.status(404).json(handleAgentTemplateNotFoundError());

    const result = composer.preview({ template, variables: variables || {} });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'preview_failed', details: (err as Error).message });
  }
});

router.post('/reminders/run', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { tenantId: string };
  const windowMinutesRaw = req.query.windowMinutes;
  const params: { tenantId: string; windowMinutes?: number } = { tenantId: current.tenantId };
  if (typeof windowMinutesRaw !== 'undefined') {
    const parsed = Math.max(0, Number(windowMinutesRaw));
    if (!Number.isNaN(parsed)) params.windowMinutes = parsed;
  }
  const result = await runReminders48hOnce(params);
  return res.json(result);
});

// Lancer une campagne de réengagement clients sans RDV depuis X jours
router.post('/reengagement/run', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { tenantId: string };
  const daysRaw = req.query.days;
  const limitRaw = req.query.limit;
  const params: { tenantId: string; days?: number; limit?: number } = {
    tenantId: current.tenantId,
  };
  if (typeof daysRaw !== 'undefined') {
    const parsed = Math.max(0, Number(daysRaw));
    if (!Number.isNaN(parsed)) params.days = parsed;
  }
  if (typeof limitRaw !== 'undefined') {
    const parsed = Math.max(1, Number(limitRaw));
    if (!Number.isNaN(parsed)) params.limit = parsed;
  }
  const result = await runReengagementOnce(params);
  return res.json(result);
});

// Envoi immédiat d'un rappel 48h pour un rendez-vous (synchrone)
router.post('/send-now', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = req.user as { tenantId: string };
    const { appointmentId, locale = 'fr' } = (req.body || {}) as {
      appointmentId?: string;
      locale?: string;
    };
    if (!appointmentId) return res.status(400).json({ error: 'missing_appointmentId' });

    // Check quota before processing
    const quotaCheck = await quotaManager.canSendMessage(current.tenantId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        error: 'quota_exceeded',
        reason: quotaCheck.reason,
        quota: await quotaManager.getUsage(current.tenantId),
      });
    }

    // Check idempotency
    const idempotencyCheck = await idempotencyManager.checkOutboundIdempotency(
      current.tenantId,
      appointmentId,
      'send-now'
    );
    if (idempotencyCheck.isDuplicate) {
      return res.status(409).json({
        error: 'duplicate_request',
        message: 'This message has already been sent',
        existingResult: idempotencyCheck.existingResult,
      });
    }

    const appt = await (
      await import('@crm/appointments/model.js')
    ).AppointmentModel.findOne({
      _id: appointmentId,
      tenantId: current.tenantId,
      deletedAt: null,
    });
    if (!appt) return res.status(404).json(handleNotFoundError('appointment'));

    const clientId =
      typeof appt.clientId === 'object'
        ? String((appt.clientId as unknown as { _id: string })._id)
        : String(appt.clientId);
    const client = await ClientModel.findOne({ _id: clientId, tenantId: current.tenantId });
    if (!client) return res.status(404).json(handleNotFoundError('client'));
    if (!client.phone) return res.status(400).json({ error: 'client_phone_missing' });

    const template = await MessageTemplateModel.findOne({
      tenantId: current.tenantId,
      purpose: 'reminder_48h',
      locale,
    });
    if (!template) return res.status(404).json(handleAgentTemplateNotFoundError());

    const composed = composer.compose({
      template,
      variables: {
        firstName: client.firstName,
        date: appt.startAt,
        time: appt.startAt,
        bookingLink: '',
      },
    });

    const idempotencyKey = `${current.tenantId}:${clientId}:${String(appt._id)}:${template.name}:sendnow`;
    const provider = await getWhatsAppProvider(current.tenantId);
    const sendResult = await provider.sendTemplateMessage({
      toPhone: client.phone,
      templateName: template.name,
      variables: { text: composed.text },
      locale,
      idempotencyKey,
    });

    await MessageLogModel.create({
      tenantId: current.tenantId,
      clientId: client._id,
      appointmentId: appt._id,
      channel: MessageChannels.WhatsApp,
      templateName: template.name,
      locale,
      content: composed.text,
      provider: sendResult.provider,
      providerMessageId: sendResult.providerMessageId,
      idempotencyKey,
      sentAt: new Date(),
    });
    metrics.messagesSent.inc();

    await (
      await import('@crm/appointments/model.js')
    ).AppointmentModel.updateOne({ _id: appt._id }, { $set: { reminder48hSentAt: new Date() } });

    return res.json({
      ok: true,
      providerMessageId: sendResult.providerMessageId,
      text: composed.text,
    });
  } catch (err) {
    return res.status(500).json({ error: 'send_now_failed', details: (err as Error).message });
  }
});

// Webhook statut provider (mock) — met à jour le MessageLog
router.post('/webhooks/whatsapp/status', webhookLimiter, async (req, res) => {
  try {
    const { providerMessageId, event, timestamp } = (req.body || {}) as {
      providerMessageId?: string;
      event?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
      timestamp?: string | number | Date;
    };
    if (!providerMessageId || !event) return res.status(400).json({ error: 'missing_params' });

    const log = await MessageLogModel.findOne({ providerMessageId });
    if (!log) return res.status(404).json({ error: 'message_not_found' });

    const ts = timestamp ? new Date(timestamp) : new Date();
    const updates: Record<string, unknown> = { status: event };
    if (event === 'sent') updates.sentAt = ts;
    if (event === 'delivered') updates.deliveredAt = ts;
    if (event === 'read') updates.readAt = ts;
    if (event === 'failed') updates.error = updates.error ?? 'failed_by_provider';

    await MessageLogModel.updateOne({ _id: log._id }, { $set: updates });
    return res.json({ ok: true });
  } catch (err) {
    metrics.webhookErrors.inc();
    return res
      .status(500)
      .json({ error: 'webhook_status_failed', details: (err as Error).message });
  }
});

// Webhook Meta (vérification)
router.get('/webhooks/meta', webhookLimiter, async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expected = process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_SECRET;
    if (mode === 'subscribe' && token && expected && token === expected) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'meta_webhook_verify_failed', details: (err as Error).message });
  }
});

// Webhook Meta (inbound)
router.post('/webhooks/meta', webhookLimiter, async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || undefined;
    if (!tenantId) return res.status(400).json({ error: 'missing_tenantId' });

    // Meta payload shape
    const entry = Array.isArray((req.body || {}).entry) ? req.body.entry[0] : undefined;
    const changes = entry && Array.isArray(entry.changes) ? entry.changes[0] : undefined;
    const value = changes ? changes.value : undefined;
    const messages = value && Array.isArray(value.messages) ? value.messages : undefined;
    const msg = messages && messages[0] ? messages[0] : undefined;

    if (!msg) return res.status(400).json({ error: 'no_message' });

    const fromPhone = msg.from as string | undefined;
    const text = (msg.text && msg.text.body) || (msg.type === 'text' ? msg.body : undefined);
    if (!text) return res.status(400).json({ error: 'no_text' });

    // Idempotence simple via signature calculée sur le payload brut
    const webhookSecret = process.env.WEBHOOK_SECRET || 'default-secret';
    const duplicateCheck = await idempotencyManager.checkInboundIdempotency(
      tenantId,
      { fromPhone, text },
      webhookSecret
    );
    if (duplicateCheck.isDuplicate) {
      return res
        .status(409)
        .json({ error: 'duplicate_webhook', existingResult: duplicateCheck.existingResult });
    }

    // Résoudre client (via téléphone)
    if (!fromPhone)
      return res.status(400).json({ error: 'client_missing', details: 'fromPhone required' });
    const client = await ClientModel.findOne({ tenantId, phone: fromPhone });
    if (!client) return res.status(404).json(handleNotFoundError('client'));

    // Détection intent et actions
    const intent = classifier.classify(text);
    await MessageLogModel.create({
      tenantId,
      clientId: String(client._id),
      channel: MessageChannels.WhatsApp,
      templateName: 'inbound',
      locale: 'fr',
      content: text,
      variables: { intent, provider: 'meta' },
      status: 'read',
      provider: ProviderTypes.Mock,
      idempotencyKey: `${tenantId}:${fromPhone}:${Date.now()}:inbound:meta`,
      readAt: new Date(),
    });

    const action = decideNextAction(intent);
    metrics.inboundIntents.inc({ intent });
    if (action.type === 'disable_agent') {
      await AgentPolicyModel.findOneAndUpdate(
        { tenantId },
        { $set: { enabled: false } },
        { upsert: true }
      );
    }

    return res.json({ ok: true, received: true, intent });
  } catch (err) {
    metrics.webhookErrors.inc();
    return res
      .status(500)
      .json({ error: 'meta_webhook_inbound_failed', details: (err as Error).message });
  }
});

// Webhook inbound (ex: STOP) — enregistre le message entrant minimal et retourne ok
router.post('/webhooks/whatsapp/inbound', webhookLimiter, async (req, res) => {
  try {
    const { tenantId, clientId, fromPhone, text } = (req.body || {}) as {
      tenantId?: string;
      clientId?: string;
      fromPhone?: string;
      text?: string;
    };
    if (!tenantId || !text) return res.status(400).json({ error: 'missing_params' });

    // Check for duplicate inbound message
    const webhookSecret = process.env.WEBHOOK_SECRET || 'default-secret';
    const duplicateCheck = await idempotencyManager.checkInboundIdempotency(
      tenantId,
      { clientId, fromPhone, text },
      webhookSecret
    );

    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        error: 'duplicate_webhook',
        message: 'This inbound message has already been processed',
        existingResult: duplicateCheck.existingResult,
      });
    }

    // Résoudre clientId si absent via fromPhone
    let resolvedClientId: string | undefined = clientId;
    if (!resolvedClientId) {
      if (!fromPhone)
        return res
          .status(400)
          .json({ error: 'client_missing', details: 'clientId or fromPhone required' });
      const client = await ClientModel.findOne({ tenantId, phone: fromPhone });
      if (!client) return res.status(404).json(handleNotFoundError('client'));
      resolvedClientId = String(client._id);
    }

    // Détection d'intent simple
    const intent = classifier.classify(text);

    // Enregistre un log inbound (sans providerMessageId) avec intent détecté
    await MessageLogModel.create({
      tenantId,
      clientId: resolvedClientId,
      channel: MessageChannels.WhatsApp,
      templateName: 'inbound',
      locale: 'fr',
      content: text,
      variables: { intent },
      status: 'read',
      provider: ProviderTypes.Mock,
      idempotencyKey: `${tenantId}:${fromPhone || resolvedClientId}:${Date.now()}:inbound`,
      readAt: new Date(),
    });

    // Règles simples d'action
    const action = decideNextAction(intent);
    metrics.inboundIntents.inc({ intent });
    if (action.type === 'disable_agent') {
      await AgentPolicyModel.findOneAndUpdate(
        { tenantId },
        { $set: { enabled: false } },
        { upsert: true }
      );
    }

    return res.json({ ok: true, received: true, intent });
  } catch (err) {
    metrics.webhookErrors.inc();
    return res
      .status(500)
      .json({ error: 'webhook_inbound_failed', details: (err as Error).message });
  }
});

router.get('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { tenantId: string };
  const doc =
    (await AgentPolicyModel.findOne({ tenantId: current.tenantId })) ||
    (await AgentPolicyModel.create({ tenantId: current.tenantId }));
  return res.json({ settings: doc });
});

router.patch('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user as { tenantId: string };
  const body = (req.body || {}) as Record<string, unknown>;
  const keys = [
    'enabled',
    'quietHours',
    'daysBeforeReminder',
    'reengageAfterDays',
    'locale',
    'fallbackLocale',
    'timezone',
    'model',
    'tone',
    'provider',
  ];
  const allowed: Record<string, unknown> = {};
  for (const k of keys) if (k in body) allowed[k] = body[k];
  const updated = await AgentPolicyModel.findOneAndUpdate(
    { tenantId: current.tenantId },
    { $set: allowed, $setOnInsert: { tenantId: current.tenantId } },
    { new: true, upsert: true }
  );
  return res.json({ settings: updated });
});

// DLQ Management endpoints
router.get('/dlq/stats', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await dlqManager.getDLQStats();
    return res.json({ dlq: stats });
  } catch (error) {
    console.error('Failed to fetch DLQ stats', error);
    return res.status(500).json({ error: 'Failed to fetch DLQ stats' });
  }
});

router.post(
  '/dlq/retry/:queue/:jobId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { queue, jobId } = req.params;
      if (!queue || !jobId) {
        return res.status(400).json({ error: 'Missing queue or jobId parameter' });
      }
      await dlqManager.retryDLQJob(queue, jobId);
      return res.json({ message: 'Job retry initiated' });
    } catch (error) {
      console.error('Failed to retry DLQ job', error);
      return res.status(500).json({ error: 'Failed to retry DLQ job' });
    }
  }
);

// Quota Management endpoints
router.get('/quotas/usage', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = req.user as { tenantId: string };
    const usage = await quotaManager.getUsage(current.tenantId);
    const quota = quotaManager.getQuota(current.tenantId);
    return res.json({ usage, quota });
  } catch (error) {
    console.error('Failed to fetch quota usage', error);
    return res.status(500).json({ error: 'Failed to fetch quota usage' });
  }
});

router.get('/quotas/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = req.user as { tenantId: string };
    const canSend = await quotaManager.canSendMessage(current.tenantId);
    const usage = await quotaManager.getUsage(current.tenantId);
    return res.json({ canSend, usage });
  } catch (error) {
    console.error('Failed to check quota status', error);
    return res.status(500).json({ error: 'Failed to check quota status' });
  }
});
