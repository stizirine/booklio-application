import * as client from 'prom-client';

// Create a registry for metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Prometheus metrics
export const metrics = {
  messagesSent: new client.Counter({
    name: 'agent_messages_sent_total',
    help: 'Total number of messages sent by the agent',
    labelNames: ['tenant_id', 'provider', 'template_name'],
    registers: [register],
  }),

  webhookErrors: new client.Counter({
    name: 'agent_webhook_errors_total',
    help: 'Total number of webhook errors',
    labelNames: ['tenant_id', 'error_type'],
    registers: [register],
  }),

  jobsProcessed: new client.Counter({
    name: 'agent_jobs_processed_total',
    help: 'Total number of jobs processed by the agent',
    labelNames: ['tenant_id', 'job_type'],
    registers: [register],
  }),

  inboundIntents: new client.Counter({
    name: 'agent_inbound_intents_total',
    help: 'Total number of inbound intents detected',
    labelNames: ['tenant_id', 'intent'],
    registers: [register],
  }),
};

// Export the register for use in server.ts
export { register };
