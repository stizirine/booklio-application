import { createErrorResponse } from '../../errors/index.js';

export const AgentErrors = {
  // Template errors
  TEMPLATE_NOT_FOUND: {
    errorId: 'AGENT_TEMPLATE_NOT_FOUND',
    message: 'Template not found',
    description: 'The requested message template does not exist',
    statusCode: 404,
  },
  TEMPLATE_INVALID: {
    errorId: 'AGENT_TEMPLATE_INVALID',
    message: 'Invalid template',
    description: 'The template format or content is invalid',
    statusCode: 400,
  },
  TEMPLATE_MISSING_VARIABLES: {
    errorId: 'AGENT_TEMPLATE_MISSING_VARIABLES',
    message: 'Missing template variables',
    description: 'Required template variables are missing',
    statusCode: 400,
  },

  // Message sending errors
  MESSAGE_SEND_FAILED: {
    errorId: 'AGENT_MESSAGE_SEND_FAILED',
    message: 'Message send failed',
    description: 'Failed to send message via the configured provider',
    statusCode: 500,
  },
  PROVIDER_NOT_CONFIGURED: {
    errorId: 'AGENT_PROVIDER_NOT_CONFIGURED',
    message: 'Provider not configured',
    description: 'The message provider is not properly configured',
    statusCode: 500,
  },
  PROVIDER_QUOTA_EXCEEDED: {
    errorId: 'AGENT_PROVIDER_QUOTA_EXCEEDED',
    message: 'Provider quota exceeded',
    description: 'The message provider quota has been exceeded',
    statusCode: 429,
  },
  MESSAGE_TOO_LONG: {
    errorId: 'AGENT_MESSAGE_TOO_LONG',
    message: 'Message too long',
    description: 'The message exceeds the maximum allowed length',
    statusCode: 400,
  },

  // Queue errors
  QUEUE_FULL: {
    errorId: 'AGENT_QUEUE_FULL',
    message: 'Queue is full',
    description: 'The message queue is at capacity',
    statusCode: 503,
  },
  JOB_NOT_FOUND: {
    errorId: 'AGENT_JOB_NOT_FOUND',
    message: 'Job not found',
    description: 'The requested job does not exist in the queue',
    statusCode: 404,
  },
  JOB_ALREADY_PROCESSING: {
    errorId: 'AGENT_JOB_ALREADY_PROCESSING',
    message: 'Job already processing',
    description: 'The job is already being processed',
    statusCode: 409,
  },
  JOB_RETRY_LIMIT_EXCEEDED: {
    errorId: 'AGENT_JOB_RETRY_LIMIT_EXCEEDED',
    message: 'Job retry limit exceeded',
    description: 'The job has exceeded its maximum retry attempts',
    statusCode: 500,
  },

  // Webhook errors
  WEBHOOK_VERIFICATION_FAILED: {
    errorId: 'AGENT_WEBHOOK_VERIFICATION_FAILED',
    message: 'Webhook verification failed',
    description: 'The webhook verification token is invalid',
    statusCode: 403,
  },
  WEBHOOK_SIGNATURE_INVALID: {
    errorId: 'AGENT_WEBHOOK_SIGNATURE_INVALID',
    message: 'Invalid webhook signature',
    description: 'The webhook signature verification failed',
    statusCode: 403,
  },
  WEBHOOK_PAYLOAD_INVALID: {
    errorId: 'AGENT_WEBHOOK_PAYLOAD_INVALID',
    message: 'Invalid webhook payload',
    description: 'The webhook payload format is invalid',
    statusCode: 400,
  },

  // Settings errors
  SETTINGS_NOT_FOUND: {
    errorId: 'AGENT_SETTINGS_NOT_FOUND',
    message: 'Agent settings not found',
    description: 'Agent settings for this tenant do not exist',
    statusCode: 404,
  },
  SETTINGS_INVALID: {
    errorId: 'AGENT_SETTINGS_INVALID',
    message: 'Invalid agent settings',
    description: 'The provided agent settings are invalid',
    statusCode: 400,
  },
  QUIET_HOURS_INVALID: {
    errorId: 'AGENT_QUIET_HOURS_INVALID',
    message: 'Invalid quiet hours',
    description: 'The quiet hours configuration is invalid',
    statusCode: 400,
  },

  // Quota errors
  QUOTA_EXCEEDED: {
    errorId: 'AGENT_QUOTA_EXCEEDED',
    message: 'Quota exceeded',
    description: 'The daily or hourly message quota has been exceeded',
    statusCode: 429,
  },
  QUOTA_CONFIG_INVALID: {
    errorId: 'AGENT_QUOTA_CONFIG_INVALID',
    message: 'Invalid quota configuration',
    description: 'The quota configuration is invalid',
    statusCode: 500,
  },

  // NLP errors
  NLP_CLASSIFICATION_FAILED: {
    errorId: 'AGENT_NLP_CLASSIFICATION_FAILED',
    message: 'NLP classification failed',
    description: 'Failed to classify the message intent',
    statusCode: 500,
  },
  NLP_MODEL_NOT_LOADED: {
    errorId: 'AGENT_NLP_MODEL_NOT_LOADED',
    message: 'NLP model not loaded',
    description: 'The NLP model is not properly loaded',
    statusCode: 500,
  },
} as const;

// Helper functions for Agent-specific errors
export function handleAgentTemplateNotFoundError() {
  return createErrorResponse(AgentErrors.TEMPLATE_NOT_FOUND);
}

export function handleMessageSendError(provider: string, originalError: unknown) {
  return createErrorResponse(AgentErrors.MESSAGE_SEND_FAILED, {
    provider,
    originalError: originalError instanceof Error ? originalError.message : String(originalError),
  });
}

export function handleAgentQuotaExceededError(quotaType: string, limit: number) {
  return createErrorResponse(AgentErrors.QUOTA_EXCEEDED, {
    quotaType,
    limit,
  });
}

export function handleWebhookVerificationError() {
  return createErrorResponse(AgentErrors.WEBHOOK_VERIFICATION_FAILED);
}

export function handleJobNotFoundError() {
  return createErrorResponse(AgentErrors.JOB_NOT_FOUND);
}

export function handleSettingsNotFoundError() {
  return createErrorResponse(AgentErrors.SETTINGS_NOT_FOUND);
}

// Re-export common error handling functions
export {
  createErrorResponse,
  handleDatabaseError,
  handleNotFoundError,
  handleValidationError,
} from '../../errors/index.js';
