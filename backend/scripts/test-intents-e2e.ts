#!/usr/bin/env tsx
// Test e2e: flux complet des intents (STOP, REBOOK, QUESTION)
import { MessageLogModel } from '@agent/messageLog.js';
import { AgentPolicyModel } from '@agent/policies.js';
import mongoose from 'mongoose';

import { ClientModel } from '@src/modules/crm/clients/model';

import { AppointmentModel } from '@crm/appointments/model.js';

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

async function getExistingData(
  tenantId: string
): Promise<{ clientId: string; appointmentId: string }> {
  await mongoose.connect(MONGO_URI);
  try {
    // Utiliser le client existant créé par dev:seed-sendnow
    const client = await ClientModel.findOne({ tenantId, phone: '+33600000000' });
    if (!client) throw new Error('No existing client found. Run dev:seed-sendnow first.');

    // Trouver un rendez-vous pour ce client
    const appointment = await AppointmentModel.findOne({ tenantId, clientId: client._id });
    if (!appointment) throw new Error('No existing appointment found. Run dev:seed-sendnow first.');

    return { clientId: String(client._id), appointmentId: String(appointment._id) };
  } finally {
    await mongoose.disconnect();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendMessage(token: string, clientId: string) {
  const r = await fetch(`${BASE_URL}/v1/agent/test-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ clientId, message: 'Test message for intents' }),
  });
  if (!r.ok) throw new Error(`test-message failed: ${r.status}`);
  return (await r.json()) as { messageLogId: string; providerMessageId: string };
}

async function simulateInboundWebhook(tenantId: string, clientId: string, message: string) {
  const r = await fetch(`${BASE_URL}/v1/agent/webhooks/whatsapp/inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      clientId,
      text: message,
    }),
  });
  if (!r.ok) throw new Error(`inbound webhook failed: ${r.status}`);
  return (await r.json()) as { ok: boolean; intent: string };
}

async function checkAgentStatus(tenantId: string): Promise<boolean> {
  await mongoose.connect(MONGO_URI);
  try {
    const policy = await AgentPolicyModel.findOne({ tenantId });
    return policy?.enabled ?? false;
  } finally {
    await mongoose.disconnect();
  }
}

async function checkMessageLog(tenantId: string, clientId: string, expectedIntent?: string) {
  await mongoose.connect(MONGO_URI);
  try {
    const log = await MessageLogModel.findOne({ tenantId, clientId }).sort({ createdAt: -1 });
    if (!log) throw new Error('No message log found');
    if (expectedIntent && log.variables?.intent !== expectedIntent) {
      throw new Error(`Expected intent ${expectedIntent}, got ${log.variables?.intent}`);
    }
    return log;
  } finally {
    await mongoose.disconnect();
  }
}

async function testStopIntent(tenantId: string, clientId: string) {
  console.log('🧪 Testing STOP intent...');

  // Simuler réponse "STOP" directement
  const result = await simulateInboundWebhook(tenantId, clientId, 'STOP');
  if (result.intent !== 'stop') throw new Error(`Expected stop intent, got ${result.intent}`);

  // Vérifier que l'agent est désactivé
  const isEnabled = await checkAgentStatus(tenantId);
  if (isEnabled) throw new Error('Agent should be disabled after STOP');

  // Vérifier le log
  const log = await checkMessageLog(tenantId, clientId, 'stop');
  console.log('✅ STOP intent: Agent disabled, intent logged');

  return log;
}

async function testRebookIntent(tenantId: string, clientId: string) {
  console.log('🧪 Testing REBOOK intent...');

  // Réactiver l'agent
  await mongoose.connect(MONGO_URI);
  try {
    await AgentPolicyModel.findOneAndUpdate(
      { tenantId },
      { $set: { enabled: true } },
      { upsert: true }
    );
  } finally {
    await mongoose.disconnect();
  }

  // Simuler réponse "REBOOK" directement
  const result = await simulateInboundWebhook(tenantId, clientId, 'Je veux reprendre rendez-vous');
  if (result.intent !== 'rebook') throw new Error(`Expected rebook intent, got ${result.intent}`);

  // Vérifier le log
  const log = await checkMessageLog(tenantId, clientId, 'rebook');
  console.log('✅ REBOOK intent: Intent logged correctly');

  return log;
}

async function testQuestionIntent(tenantId: string, clientId: string) {
  console.log('🧪 Testing QUESTION intent...');

  // Simuler réponse "QUESTION" directement
  const result = await simulateInboundWebhook(tenantId, clientId, 'Comment ça marche ?');
  if (result.intent !== 'question')
    throw new Error(`Expected question intent, got ${result.intent}`);

  // Vérifier le log
  const log = await checkMessageLog(tenantId, clientId, 'question');
  console.log('✅ QUESTION intent: Intent logged correctly');

  return log;
}

async function testUnknownIntent(tenantId: string, clientId: string) {
  console.log('🧪 Testing UNKNOWN intent...');

  // Simuler réponse "UNKNOWN" directement
  const result = await simulateInboundWebhook(tenantId, clientId, 'asdfghjkl');
  if (result.intent !== 'unknown') throw new Error(`Expected unknown intent, got ${result.intent}`);

  // Vérifier le log
  const log = await checkMessageLog(tenantId, clientId, 'unknown');
  console.log('✅ UNKNOWN intent: Intent logged correctly');

  return log;
}

async function main() {
  console.log('🚀 Starting intents e2e test...');

  const { token, tenantId } = await login();
  console.log('✅ Login successful', token, tenantId);
  const { clientId } = await getExistingData(tenantId);

  try {
    // Test tous les intents
    await testStopIntent(tenantId, clientId);
    await testRebookIntent(tenantId, clientId);
    await testQuestionIntent(tenantId, clientId);
    await testUnknownIntent(tenantId, clientId);

    console.log('🎉 All intents e2e tests: SUCCESS');
  } catch (error) {
    console.error('❌ Intents e2e test failed:', error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
