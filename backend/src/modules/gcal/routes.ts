import { Router, type Request, type Response } from 'express';
import { google } from 'googleapis';

import { requireAuth, type AuthenticatedRequest } from '@middlewares/requireAuth.js';

import { GoogleToken } from './model.js';

const router = Router();

function getOAuthClient() {
  const clientId = process.env.GCAL_CLIENT_ID || '';
  const clientSecret = process.env.GCAL_CLIENT_SECRET || '';
  const redirectUri =
    process.env.GCAL_REDIRECT_URI || 'http://localhost:4000/v1/gcal/oauth/callback';
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

router.get('/auth-url', requireAuth, async (req: Request, res: Response) => {
  const oauth2Client = getOAuthClient();
  // Supporte un mode popup via state=popup (le front peut aussi l'ajouter côté client)
  const state = (req.query.state as string) || 'popup';
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
  return res.json({ url });
});

router.get('/oauth/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).json({ error: 'missing_code' });
  const state = (req.query.state as string) || '';
  const oauth2Client = getOAuthClient();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Si state=popup, renvoyer une page HTML qui renvoie les tokens au front via postMessage et se ferme
    if (state === 'popup') {
      const payload = JSON.stringify({ tokens });
      const targetOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
      return res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Connexion Google réussie</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#0f172a} .card{background:#fff;padding:24px 20px;border-radius:12px;box-shadow:0 10px 20px rgba(2,6,23,.08)} .muted{font-size:12px;color:#475569;margin-top:8px}</style>
  </head>
  <body>
    <div class="card">
      <div><strong>Connexion Google réussie.</strong><div class="muted">Vous pouvez fermer cette fenêtre.</div></div>
    </div>
    <script>
      (function(){
        try {
          var data = ${payload};
          if (window.opener && typeof window.opener.postMessage === 'function') {
            window.opener.postMessage({ type: 'gcal_tokens', tokens: data.tokens }, '${targetOrigin}');
          }
        } catch(e) {}
        setTimeout(function(){ window.close(); }, 300);
      })();
    </script>
  </body>
</html>`);
    }
    return res.json({ tokens });
  } catch {
    return res.status(400).json({ error: 'token_exchange_failed' });
  }
});

router.post('/store-tokens', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const { access_token, refresh_token, scope, token_type, expiry_date } =
    (req.body as Record<string, unknown>) || {};
  if (!access_token || !refresh_token) return res.status(400).json({ error: 'missing_tokens' });
  await GoogleToken.findOneAndUpdate(
    { userId: current.id, tenantId: current.tenantId },
    {
      accessToken: access_token as string,
      refreshToken: refresh_token as string,
      scope: scope as string,
      tokenType: token_type as string,
      expiryDate: expiry_date as number,
    },
    { upsert: true }
  );
  return res.json({ ok: true });
});

async function getAuthedClient(userId: string, tenantId: string) {
  const token = await GoogleToken.findOne({ userId, tenantId });
  if (!token) return null;
  const client = getOAuthClient();
  const creds: Record<string, unknown> = {};
  if (token.accessToken) creds.access_token = token.accessToken;
  if (token.refreshToken) creds.refresh_token = token.refreshToken;
  if (token.scope) creds.scope = token.scope;
  if (token.tokenType) creds.token_type = token.tokenType;
  if (typeof token.expiryDate === 'number') creds.expiry_date = token.expiryDate;
  client.setCredentials(creds);
  return client;
}

router.get('/calendars', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const client = await getAuthedClient(current.id, current.tenantId);
  if (!client) return res.status(401).json({ error: 'no_gcal_token' });
  const calendar = google.calendar({ version: 'v3', auth: client });
  const { data } = await calendar.calendarList.list();
  return res.json({ items: data.items || [] });
});

router.get('/events', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const current = req.user!;
  const {
    calendarId = 'primary',
    timeMin,
    timeMax,
  } = req.query as Record<string, string | undefined>;
  const client = await getAuthedClient(current.id, current.tenantId);
  if (!client) return res.status(401).json({ error: 'no_gcal_token' });
  const calendar = google.calendar({ version: 'v3', auth: client });
  const { data } = await calendar.events.list({
    calendarId,
    timeMin: timeMin || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.json({ items: data.items || [] });
});

export { router };
