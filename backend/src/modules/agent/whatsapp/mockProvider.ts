import { ProviderTypes } from '../enums.js';

import type { SendResult, SendTemplateParams, WhatsAppProvider } from './provider.js';

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendTemplateMessage(params: SendTemplateParams): Promise<SendResult> {
    console.log('sendTemplateMessage', params);
    // Simule un envoi réussi avec un providerMessageId
    const fakeId = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return { ok: true, provider: ProviderTypes.Mock, providerMessageId: fakeId };
  }
}
