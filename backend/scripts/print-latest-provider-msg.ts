#!/usr/bin/env tsx
import { MessageLogModel } from '@agent/messageLog.js';
import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const log = await MessageLogModel.findOne({ providerMessageId: { $ne: null } })
      .sort({ createdAt: -1 })
      .lean();
    if (!log || !log.providerMessageId) {
      console.error('No providerMessageId');
      process.exit(1);
    }
    console.log(log.providerMessageId);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
