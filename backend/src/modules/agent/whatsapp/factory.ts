import { ProviderTypes } from '../enums.js';
import { AgentPolicyModel } from '../policies.js';

import { MockWhatsAppProvider } from './mockProvider.js';
import { MetaWhatsAppProvider, TwilioWhatsAppProvider, type WhatsAppProvider } from './provider.js';

export async function getWhatsAppProvider(tenantId: string): Promise<WhatsAppProvider> {
  const policy = await AgentPolicyModel.findOne({ tenantId });
  const provider = policy?.provider || ProviderTypes.Mock;
  switch (provider) {
    case ProviderTypes.Meta:
      return new MetaWhatsAppProvider();
    case ProviderTypes.Twilio:
      return new TwilioWhatsAppProvider();
    default:
      return new MockWhatsAppProvider();
  }
}
