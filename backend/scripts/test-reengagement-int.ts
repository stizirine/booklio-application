#!/usr/bin/env tsx
// Test d'intégration: campagne reengagement (enqueue + worker)

import { MessageLogModel } from '@agent/messageLog.js';
import { startReengagementWorker } from '@agent/queue/reengagementWorker.js';
import { MessageTemplateModel } from '@agent/templates.js';
import mongoose from 'mongoose';

import { ClientModel } from '@crm/clients/model.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.EMAIL || 'test@booklio.com';
const PASSWORD = process.env.PASSWORD || 'password123';
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';

async function login(): Promise<{ token: string; tenantId: string }> {
  const r = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!r.ok) throw new Error(`Login failed: ${r.status}`);
  const j = (await r.json()) as { tokens: { accessToken: string }; user: { tenantId: string } };
  return { token: j.tokens.accessToken, tenantId: j.user.tenantId };
}

async function ensureTestClient(tenantId: string): Promise<string> {
  await mongoose.connect(MONGO_URI);
  try {
    const phone = `+3360000${Math.floor(Math.random() * 10000)}`;
    const created = await ClientModel.create({
      tenantId,
      firstName: 'Client',
      lastName: 'Reengage',
      phone,
      deletedAt: null,
    });
    return String(created._id);
  } finally {
    await mongoose.disconnect();
  }
}

async function ensureReengagementTemplate(tenantId: string) {
  await mongoose.connect(MONGO_URI);
  try {
    const existing = await MessageTemplateModel.findOne({
      tenantId,
      purpose: 'reengagement',
      locale: 'fr',
    });
    if (existing) return;
    await MessageTemplateModel.create({
      tenantId,
      name: 'reengagement_fr',
      channel: 'whatsapp',
      locale: 'fr',
      purpose: 'reengagement',
      placeholders: ['firstName'],
      previewText: 'Bonjour {{firstName}}, cela fait un moment ! Souhaitez-vous reprendre RDV ?',
    });
  } finally {
    await mongoose.disconnect();
  }
}

async function runCampaign(token: string) {
  const url = new URL('/v1/agent/reengagement/run', BASE_URL);
  url.searchParams.set('days', '0');
  url.searchParams.set('limit', '50');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`reengagement run failed: ${r.status}`);
}

async function waitForMessage(tenantId: string, clientId: string, timeoutMs = 30000) {
  const started = Date.now();
  await mongoose.connect(MONGO_URI);
  try {
    // Poll toutes les 500ms

    for (;;) {
      const log = await MessageLogModel.findOne({ tenantId, clientId }).sort({ createdAt: -1 });
      if (log) return log;
      if (Date.now() - started > timeoutMs) throw new Error('timeout waiting for message');
      await new Promise((res) => setTimeout(res, 500));
    }
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  const { token, tenantId } = await login();
  await ensureReengagementTemplate(tenantId);
  const clientId = await ensureTestClient(tenantId);

  // Démarrer un worker local pour traiter la file
  const worker = startReengagementWorker(2);
  try {
    await runCampaign(token);
    const msg = await waitForMessage(tenantId, clientId, 30000);
    console.log('Reengagement message log:', {
      id: String(msg._id),
      provider: msg.provider,
      providerMessageId: msg.providerMessageId,
      templateName: msg.templateName,
    });
    console.log('Reengagement integration: SUCCESS');
  } finally {
    await worker.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
