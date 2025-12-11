import { ClientModel } from '@crm/clients/model.js';

import { MessageLogModel } from './messageLog.js';

export interface QuotaConfig {
  dailyLimit: number;
  hourlyLimit: number;
  burstLimit: number; // Max messages in a short burst (5 minutes)
}

export interface QuotaUsage {
  daily: number;
  hourly: number;
  burst: number;
  remaining: {
    daily: number;
    hourly: number;
    burst: number;
  };
  resetAt: {
    daily: Date;
    hourly: Date;
    burst: Date;
  };
}

// Default quota configuration per tenant
const DEFAULT_QUOTAS: Record<string, QuotaConfig> = {
  t1: {
    // Default tenant
    dailyLimit: 1000,
    hourlyLimit: 100,
    burstLimit: 20,
  },
  t2: {
    // Premium tenant
    dailyLimit: 5000,
    hourlyLimit: 500,
    burstLimit: 100,
  },
};

export class QuotaManager {
  private quotas: Map<string, QuotaConfig> = new Map();

  constructor() {
    // Initialize with default quotas
    Object.entries(DEFAULT_QUOTAS).forEach(([tenantId, config]) => {
      this.quotas.set(tenantId, config);
    });
  }

  // Set quota configuration for a tenant
  setQuota(tenantId: string, config: QuotaConfig): void {
    this.quotas.set(tenantId, config);
  }

  // Get quota configuration for a tenant
  getQuota(tenantId: string): QuotaConfig {
    const quota = this.quotas.get(tenantId);
    if (quota) {
      return quota;
    }
    // Fallback to default tenant quota
    const defaultQuota = DEFAULT_QUOTAS['t1'];
    if (!defaultQuota) {
      throw new Error('Default quota configuration not found');
    }
    return defaultQuota;
  }

  // Check if a tenant can send a message
  async canSendMessage(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const quota = this.getQuota(tenantId);
    const usage = await this.getUsage(tenantId);

    // Check burst limit (last 5 minutes)
    if (usage.burst >= quota.burstLimit) {
      return {
        allowed: false,
        reason: `Burst limit exceeded: ${usage.burst}/${quota.burstLimit} messages in last 5 minutes`,
      };
    }

    // Check hourly limit
    if (usage.hourly >= quota.hourlyLimit) {
      return {
        allowed: false,
        reason: `Hourly limit exceeded: ${usage.hourly}/${quota.hourlyLimit} messages in last hour`,
      };
    }

    // Check daily limit
    if (usage.daily >= quota.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily limit exceeded: ${usage.daily}/${quota.dailyLimit} messages today`,
      };
    }

    return { allowed: true };
  }

  // Get current usage for a tenant
  async getUsage(tenantId: string): Promise<QuotaUsage> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const startOfBurst = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago

    const [dailyCount, hourlyCount, burstCount] = await Promise.all([
      MessageLogModel.countDocuments({
        tenantId,
        sentAt: { $gte: startOfDay },
        status: { $in: ['sent', 'delivered', 'read'] },
      }),
      MessageLogModel.countDocuments({
        tenantId,
        sentAt: { $gte: startOfHour },
        status: { $in: ['sent', 'delivered', 'read'] },
      }),
      MessageLogModel.countDocuments({
        tenantId,
        sentAt: { $gte: startOfBurst },
        status: { $in: ['sent', 'delivered', 'read'] },
      }),
    ]);

    const quota = this.getQuota(tenantId);

    return {
      daily: dailyCount,
      hourly: hourlyCount,
      burst: burstCount,
      remaining: {
        daily: Math.max(0, quota.dailyLimit - dailyCount),
        hourly: Math.max(0, quota.hourlyLimit - hourlyCount),
        burst: Math.max(0, quota.burstLimit - burstCount),
      },
      resetAt: {
        daily: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        hourly: new Date(startOfHour.getTime() + 60 * 60 * 1000),
        burst: new Date(startOfBurst.getTime() + 5 * 60 * 1000),
      },
    };
  }

  // Record a message send (for quota tracking)
  async recordMessage(tenantId: string, messageId: string): Promise<void> {
    // This is called after a message is successfully sent
    // The actual recording happens in MessageLogModel, this is just for logging
    console.log(`📊 Quota recorded for tenant ${tenantId}, message ${messageId}`);
  }

  // Get quota status for all tenants
  async getAllQuotaStatus(): Promise<Record<string, QuotaUsage>> {
    const status: Record<string, QuotaUsage> = {};

    for (const tenantId of this.quotas.keys()) {
      status[tenantId] = await this.getUsage(tenantId);
    }

    return status;
  }

  // Check if tenant exists and is active
  async isTenantActive(tenantId: string): Promise<boolean> {
    try {
      // Check if tenant has any clients (basic activity check)
      const clientCount = await ClientModel.countDocuments({ tenantId });
      return clientCount > 0;
    } catch (error) {
      console.error(`Error checking tenant activity for ${tenantId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const quotaManager = new QuotaManager();
