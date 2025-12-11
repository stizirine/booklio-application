/*
  Smoke test pour l'endpoint /v1/agent/preview
  Usage:
    ACCESS_TOKEN="<token>" TEMPLATE_NAME="reminder_48h_fr" npm run smoke:agent-preview
*/
import fetch from 'node-fetch';

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
  const accessToken = process.env.ACCESS_TOKEN || '';
  const templateName = process.env.TEMPLATE_NAME || 'reminder_48h_fr';
  const locale = process.env.LOCALE || 'fr';

  if (!accessToken) throw new Error('ACCESS_TOKEN manquant');

  const res = await fetch(`${baseUrl}/v1/agent/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      templateName,
      locale,
      variables: {
        firstName: 'Alice',
        date: '2025-10-15',
        time: '10:00',
        bookingLink: 'https://booklio.app/r/abc',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`preview failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  console.log('preview:', data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
