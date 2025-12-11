import crypto from 'crypto';

import { MessageChannels } from './enums.js';
import { MessageLogModel } from './messageLog.js';

export interface IdempotencyKey {
  tenantId: string;
  type: 'outbound' | 'inbound';
  source: string; // appointmentId, clientId, or webhook signature
  action: string; // send-48h, reengage, webhook-status, webhook-inbound
  timestamp?: number; // Optional timestamp for time-based keys
}

export interface ExistingMessageInfo {
  messageId: string;
  status?: string;
  sentAt?: Date | null;
}

export type CachedResult = ExistingMessageInfo | { error: string };

export interface IdempotencyResult {
  isDuplicate: boolean;
  existingResult?: CachedResult;
  key: string;
}

export class IdempotencyManager {
  private cache: Map<string, { result: CachedResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Generate idempotency key
  generateKey(params: IdempotencyKey): string {
    const keyData = {
      tenantId: params.tenantId,
      type: params.type,
      source: params.source,
      action: params.action,
      timestamp: params.timestamp || Math.floor(Date.now() / (60 * 1000)), // Round to minute
    };

    const keyString = JSON.stringify(keyData);
    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  // Check if operation is duplicate
  async checkIdempotency(key: string): Promise<IdempotencyResult> {
    // Check in-memory cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return {
        isDuplicate: true,
        existingResult: cached.result,
        key,
      };
    }

    // Check database for outbound messages
    const existingMessage = await MessageLogModel.findOne({
      idempotencyKey: key,
      tenantId: { $exists: true },
    });

    if (existingMessage) {
      // Cache the result
      const statusMaybe = (existingMessage as unknown as { status?: string }).status;
      const sentAtMaybe = (existingMessage as unknown as { sentAt?: Date | null }).sentAt;
      const result: ExistingMessageInfo = {
        messageId: String(existingMessage._id),
        ...(statusMaybe !== undefined ? { status: statusMaybe } : {}),
        ...(sentAtMaybe !== undefined ? { sentAt: sentAtMaybe ?? null } : {}),
      };
      this.cache.set(key, { result, timestamp: Date.now() });

      return {
        isDuplicate: true,
        existingResult: result,
        key,
      };
    }

    return {
      isDuplicate: false,
      key,
    };
  }

  // Record successful operation
  async recordSuccess(key: string, result: ExistingMessageInfo): Promise<void> {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  // Record failed operation (for retry logic)
  async recordFailure(key: string, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    this.cache.set(key, { result: { error: message }, timestamp: Date.now() });
  }

  // Clean up expired cache entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Generate webhook signature for deduplication
  generateWebhookSignature(payload: unknown, secret: string): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  // Check for duplicate webhook
  async checkWebhookDuplicate(
    tenantId: string,
    signature: string,
    payload: unknown
  ): Promise<{ isDuplicate: boolean; existingMessage?: ExistingMessageInfo }> {
    // Look for existing webhook with same signature
    const existingWebhook = await MessageLogModel.findOne({
      tenantId,
      'variables.webhookSignature': signature,
      channel: MessageChannels.WhatsApp,
    });

    if (existingWebhook) {
      const statusMaybe = (existingWebhook as unknown as { status?: string }).status;
      const sentAtMaybe = (existingWebhook as unknown as { sentAt?: Date | null }).sentAt;
      return {
        isDuplicate: true,
        existingMessage: {
          messageId: String(existingWebhook._id),
          ...(statusMaybe !== undefined ? { status: statusMaybe } : {}),
          ...(sentAtMaybe !== undefined ? { sentAt: sentAtMaybe ?? null } : {}),
        },
      };
    }

    // Additional check: look for similar inbound messages within last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const similarMessage = await MessageLogModel.findOne({
      tenantId,
      channel: MessageChannels.WhatsApp,
      direction: 'inbound',
      sentAt: { $gte: fiveMinutesAgo },
      'variables.text':
        (payload as { text?: string; message?: { text?: string } }).text ||
        (payload as { text?: string; message?: { text?: string } }).message?.text,
    });

    if (similarMessage) {
      const statusMaybe = (similarMessage as unknown as { status?: string }).status;
      const sentAtMaybe = (similarMessage as unknown as { sentAt?: Date | null }).sentAt;
      return {
        isDuplicate: true,
        existingMessage: {
          messageId: String(similarMessage._id),
          ...(statusMaybe !== undefined ? { status: statusMaybe } : {}),
          ...(sentAtMaybe !== undefined ? { sentAt: sentAtMaybe ?? null } : {}),
        },
      };
    }

    return { isDuplicate: false };
  }

  // Enhanced idempotency for outbound messages
  async checkOutboundIdempotency(
    tenantId: string,
    appointmentId: string,
    action: string
  ): Promise<IdempotencyResult> {
    const key = this.generateKey({
      tenantId,
      type: 'outbound',
      source: appointmentId,
      action,
    });

    return this.checkIdempotency(key);
  }

  // Enhanced idempotency for inbound webhooks
  async checkInboundIdempotency(
    tenantId: string,
    webhookData: Record<string, unknown>,
    secret: string
  ): Promise<{ isDuplicate: boolean; key: string; existingResult?: ExistingMessageInfo }> {
    const signature = this.generateWebhookSignature(webhookData, secret);
    const key = this.generateKey({
      tenantId,
      type: 'inbound',
      source: signature,
      action: 'webhook-inbound',
    });

    const duplicateCheck = await this.checkWebhookDuplicate(tenantId, signature, webhookData);

    if (duplicateCheck.isDuplicate) {
      const response: { isDuplicate: boolean; key: string; existingResult?: ExistingMessageInfo } =
        { isDuplicate: true, key };
      if (duplicateCheck.existingMessage) {
        response.existingResult = duplicateCheck.existingMessage;
      }
      return response;
    }

    return {
      isDuplicate: false,
      key,
    };
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).length,
    };
  }
}

// Export singleton instance
export const idempotencyManager = new IdempotencyManager();

// Cleanup cache every hour
setInterval(
  () => {
    idempotencyManager.cleanup();
  },
  60 * 60 * 1000
);
