export type SendTemplateParams = {
  toPhone: string;
  templateName: string;
  variables: Record<string, unknown>;
  locale?: string;
  idempotencyKey?: string;
};

import type { ProviderType } from '../enums.js';

export type SendResult = {
  ok: boolean;
  provider: ProviderType;
  providerMessageId?: string;
  error?: string;
};

export interface WhatsAppProvider {
  sendTemplateMessage(params: SendTemplateParams): Promise<SendResult>;
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  async sendTemplateMessage(params: SendTemplateParams): Promise<SendResult> {
    // Stub Meta: à implémenter plus tard
    console.log('Meta sendTemplateMessage (stub)', params);
    return {
      ok: true,
      provider: 'meta' as unknown as ProviderType,
      providerMessageId: `meta_${Date.now()}`,
    };
  }
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  async sendTemplateMessage(params: SendTemplateParams): Promise<SendResult> {
    // Stub Twilio: à implémenter plus tard
    console.log('Twilio sendTemplateMessage (stub)', params);
    return {
      ok: true,
      provider: 'twilio' as unknown as ProviderType,
      providerMessageId: `tw_${Date.now()}`,
    };
  }
}
