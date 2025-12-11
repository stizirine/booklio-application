#!/usr/bin/env tsx
import { TemplatePurposes } from '@agent/enums.js';
import { MessageTemplateModel } from '@agent/templates.js';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;
const TENANT_ID = process.env.TENANT_ID as string;

if (!MONGO_URI) {
  console.error('MONGO_URI manquant');
  process.exit(1);
}
if (!TENANT_ID) {
  console.error('TENANT_ID manquant');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const upserts = [
      {
        tenantId: TENANT_ID,
        name: 'reminder_48h_fr',
        channel: 'whatsapp',
        locale: 'fr',
        purpose: TemplatePurposes.Reminder48h,
        placeholders: ['firstName', 'date', 'time', 'bookingLink'],
        previewText:
          'Bonjour {{firstName}}, rappel de votre rendez-vous dans 48h le {{date}} à {{time}}. Si besoin de reprogrammer, utilisez ce lien: {{bookingLink}}.',
      },
    ];

    for (const t of upserts) {
      await MessageTemplateModel.updateOne(
        { tenantId: t.tenantId, name: t.name, locale: t.locale },
        { $set: t },
        { upsert: true }
      );
      console.log(`✅ Template seedé: ${t.name} (${t.locale})`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
