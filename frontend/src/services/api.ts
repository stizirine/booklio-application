import axios from 'axios';
import { mockApi } from './mockApi';

// Fonction utilitaire pour récupérer les variables d'environnement
const getEnvConfig = () => {
  // Utiliser REACT_APP_ENV si défini, sinon NODE_ENV
  // REACT_APP_ENV peut être 'development', 'staging', ou 'production'
  const appEnv = process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';
  
  // Récupérer la valeur du header selon l'environnement
  const getHeaderValue = (): string | undefined => {
    // Priorité: valeur spécifique à l'environnement, puis valeur globale
    if (appEnv === 'production' && process.env.REACT_APP_REQUIRED_HEADER_VALUE_PROD) {
      return process.env.REACT_APP_REQUIRED_HEADER_VALUE_PROD;
    }
    if (appEnv === 'staging' && process.env.REACT_APP_REQUIRED_HEADER_VALUE_STAGING) {
      return process.env.REACT_APP_REQUIRED_HEADER_VALUE_STAGING;
    }
    if (appEnv === 'development' && process.env.REACT_APP_REQUIRED_HEADER_VALUE_DEV) {
      return process.env.REACT_APP_REQUIRED_HEADER_VALUE_DEV;
    }
    // Valeur globale (si définie)
    return process.env.REACT_APP_REQUIRED_HEADER_VALUE;
  };
  
  const config = {
    // Configuration de l'API
    // En production/Docker, utiliser une URL relative qui sera proxifiée par Nginx
    // En développement, utiliser localhost:4000
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:4000'),
    
    // Configuration du mode API
    USE_MOCK_API: process.env.REACT_APP_USE_MOCK_API === 'true',
    
    FALLBACK_TO_MOCK: process.env.REACT_APP_FALLBACK_TO_MOCK !== 'false' && 
                      process.env.NODE_ENV === 'development',
    
    // Configuration de l'authentification
    DEFAULT_EMAIL: process.env.REACT_APP_DEFAULT_EMAIL || 'admin@booklio.com',
    DEFAULT_PASSWORD: process.env.REACT_APP_DEFAULT_PASSWORD || 'P@ssw0rd123',
    
    // Configuration du timeout
    REQUEST_TIMEOUT: parseInt(process.env.REACT_APP_REQUEST_TIMEOUT || '2000', 10),
    
    // Mode debug
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development',
    
    // Configuration des headers API
    X_API_KEY_HEADER_NAME: process.env.REACT_APP_X_API_KEY || 'x-api-key',
    REQUIRED_HEADER_VALUE: getHeaderValue()
  };
  
  return config;
};

// Récupération de la configuration d'environnement
const envConfig = getEnvConfig();

// Extraction des variables principales pour compatibilité
const API_BASE_URL = envConfig.API_BASE_URL;
const USE_MOCK_API = envConfig.USE_MOCK_API;
const FALLBACK_TO_MOCK = envConfig.FALLBACK_TO_MOCK;

// Log des variables d'environnement pour debug
if (envConfig.DEBUG_MODE) {
  console.log('[API CONFIG] Configuration chargée:', {
    'Variables brutes': {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_ENV: process.env.REACT_APP_ENV,
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
      REACT_APP_USE_MOCK_API: process.env.REACT_APP_USE_MOCK_API,
      REACT_APP_FALLBACK_TO_MOCK: process.env.REACT_APP_FALLBACK_TO_MOCK,
      REACT_APP_DEFAULT_EMAIL: process.env.REACT_APP_DEFAULT_EMAIL,
      REACT_APP_DEFAULT_PASSWORD: process.env.REACT_APP_DEFAULT_PASSWORD,
      REACT_APP_REQUEST_TIMEOUT: process.env.REACT_APP_REQUEST_TIMEOUT,
      REACT_APP_DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE,
      REACT_APP_X_API_KEY: process.env.REACT_APP_X_API_KEY,
      REACT_APP_REQUIRED_HEADER_VALUE_DEV: process.env.REACT_APP_REQUIRED_HEADER_VALUE_DEV,
      REACT_APP_REQUIRED_HEADER_VALUE_STAGING: process.env.REACT_APP_REQUIRED_HEADER_VALUE_STAGING,
      REACT_APP_REQUIRED_HEADER_VALUE_PROD: process.env.REACT_APP_REQUIRED_HEADER_VALUE_PROD,
      REACT_APP_REQUIRED_HEADER_VALUE: process.env.REACT_APP_REQUIRED_HEADER_VALUE
    },
    'Configuration finale': envConfig
  });
}

// Cache pour éviter de vérifier plusieurs fois
let serverAvailable: boolean | null = null;
let serverCheckPromise: Promise<boolean> | null = null;

// Fonction pour vérifier si le serveur backend est disponible
const checkServerAvailability = async (): Promise<boolean> => {
  if (serverAvailable !== null) return serverAvailable;
  
  if (serverCheckPromise) return serverCheckPromise;
  
  serverCheckPromise = (async () => {
    try {
      // Essayer de faire un ping simple au serveur
      const response = await axios.get(`${API_BASE_URL}/health`, { 
        timeout: envConfig.REQUEST_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
      serverAvailable = response.status === 200;
      console.log('[API] Serveur backend disponible:', serverAvailable);
      return serverAvailable;
    } catch (error) {
      serverAvailable = false;
      console.log('[API] Serveur backend non disponible, utilisation de l\'API mockée');
      return false;
    }
  })();
  
  return serverCheckPromise;
};

// Fonction pour gérer les requêtes mockées
const handleMockRequest = async (method: string, url: string, config?: any, data?: any) => {
  if (url.includes('/v1/clients')) {
    if (url.includes('/v1/clients/') && !url.endsWith('/v1/clients')) {
      // GET /v1/clients/:id
      const id = url.split('/').pop();
      return await mockApi.getClient(id!);
    } else {
      // GET /v1/clients
      return await mockApi.getClients();
    }
  }
  
  if (url.includes('/v1/appointments')) {
    if (method === 'GET') {
      return await mockApi.getAppointments(config?.params);
    } else if (method === 'POST') {
      return await mockApi.createAppointment(data);
    } else if (method === 'PATCH') {
      const id = url.split('/').pop();
      return await mockApi.updateAppointment(id!, data);
    } else if (method === 'DELETE') {
      const id = url.split('/').pop();
      return await mockApi.deleteAppointment(id!);
    }
  }
  
  if (url.includes('/v1/auth/login')) {
    return await mockApi.login(data.email, data.password);
  }
  
  if (url.includes('/v1/auth/register')) {
    return await mockApi.register(data.tenantId, data.email, data.password);
  }
  
  // Gérer les factures optiques (/v1/optician/invoices)
  if (url.includes('/v1/optician/invoices')) {
    // DELETE /v1/optician/invoices/:id/payments/:paymentId
    if (method === 'DELETE' && url.match(/\/v1\/optician\/invoices\/[^/]+\/payments\/[^/]+$/)) {
      const parts = url.split('/');
      const invoiceId = parts[parts.length - 3];
      const paymentId = parts[parts.length - 1];
      return await mockApi.deletePayment(invoiceId, paymentId);
    }
    
    // POST /v1/optician/invoices/:id/payments
    if (method === 'POST' && url.includes('/payments')) {
      const invoiceId = url.split('/')[3];
      return await mockApi.addPayment(invoiceId, data);
    }
    
    // DELETE /v1/optician/invoices/:id
    if (method === 'DELETE' && url.match(/\/v1\/optician\/invoices\/[^/]+$/)) {
      const id = url.split('/').pop();
      return await mockApi.deleteInvoice(id!);
    }
    
    // PATCH /v1/optician/invoices/:id
    if (method === 'PATCH') {
      const id = url.split('/').pop();
      return await mockApi.updateInvoice(id!, data);
    }
    
    // POST /v1/optician/invoices (create)
    if (method === 'POST' && (url === '/v1/optician/invoices' || url.endsWith('/v1/optician/invoices'))) {
      return await mockApi.createInvoice(data);
    }
    
    // GET /v1/optician/invoices/:id
    if (method === 'GET' && url.match(/\/v1\/optician\/invoices\/[^/]+$/)) {
      const id = url.split('/').pop();
      return await mockApi.getInvoice(id!);
    }
    
    // GET /v1/optician/invoices (list)
    if (method === 'GET') {
      return await mockApi.getInvoices(config?.params);
    }
  }
  
  if (url.includes('/v1/invoices')) {
    // DELETE /v1/invoices/:id/payments/:paymentId
    if (method === 'DELETE' && url.match(/\/v1\/invoices\/[^/]+\/payments\/[^/]+$/)) {
      const parts = url.split('/');
      const invoiceId = parts[parts.length - 3];
      const paymentId = parts[parts.length - 1];
      return await mockApi.deletePayment(invoiceId, paymentId);
    }
    
    // POST /v1/invoices/:id/payments
    if (method === 'POST' && url.includes('/payments')) {
      const invoiceId = url.split('/')[3];
      return await mockApi.addPayment(invoiceId, data);
    }
    
    // DELETE /v1/invoices/:id
    if (method === 'DELETE' && url.match(/\/v1\/invoices\/[^/]+$/)) {
      const id = url.split('/').pop();
      return await mockApi.deleteInvoice(id!);
    }
    
    // PATCH /v1/invoices/:id
    if (method === 'PATCH') {
      const id = url.split('/').pop();
      return await mockApi.updateInvoice(id!, data);
    }
    
    // POST /v1/invoices (create)
    if (method === 'POST' && url === '/v1/invoices') {
      return await mockApi.createInvoice(data);
    }
    
    // GET /v1/invoices/:id
    if (method === 'GET' && url.match(/\/v1\/invoices\/[^/]+$/)) {
      const id = url.split('/').pop();
      return await mockApi.getInvoice(id!);
    }
    
    // GET /v1/invoices (list)
    if (method === 'GET') {
      return await mockApi.getInvoices(config?.params);
    }
  }
  
  // Fallback pour d'autres endpoints
  return { data: { items: [] } };
};

// Routes à exclure de l'ajout du header x-api-key
// Note: Les routes d'authentification peuvent nécessiter l'API key selon la configuration du backend
const excludedPaths = ['/health', '/metrics', '/docs', '/docs.json'];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification et les headers API
api.interceptors.request.use((config) => {
  // S'assurer que headers existe
  if (!config.headers) config.headers = {} as any;

  // Vérifier si la route doit être exclue de l'ajout du header x-api-key
  const url = config.url || '';
  const shouldAddApiKey = !excludedPaths.some(path => url.includes(path));

  // Ajouter le header x-api-key si nécessaire
  // Le backend accepte n'importe quelle valeur si REQUIRED_HEADER_VALUE n'est pas défini
  if (shouldAddApiKey && envConfig.X_API_KEY_HEADER_NAME) {
    // Utiliser la valeur depuis envConfig qui vient du .env via getHeaderValue()
    // envConfig.REQUIRED_HEADER_VALUE est défini par getHeaderValue() qui lit
    // REACT_APP_REQUIRED_HEADER_VALUE_PROD depuis le .env au moment du build
    const headerValue = envConfig.REQUIRED_HEADER_VALUE || 'default-api-key';
    const maybeAxiosHeaders = config.headers as any;
    if (typeof maybeAxiosHeaders.set === 'function') {
      maybeAxiosHeaders.set(envConfig.X_API_KEY_HEADER_NAME, headerValue);
    } else {
      (config.headers as any)[envConfig.X_API_KEY_HEADER_NAME] = headerValue;
    }
  }

  // Ajouter le token d'authentification
  const token = localStorage.getItem('accessToken');
  if (token) {
    // Compatibilité Axios v1: AxiosHeaders possède .set
    const maybeAxiosHeaders = config.headers as any;
    if (typeof maybeAxiosHeaders.set === 'function') {
      maybeAxiosHeaders.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const authHeader = (config.headers as any)?.Authorization || (config.headers as any)?.get?.('Authorization');
    const apiKeyHeaderValue = shouldAddApiKey && envConfig.X_API_KEY_HEADER_NAME
      ? (config.headers as any)?.[envConfig.X_API_KEY_HEADER_NAME] || (config.headers as any)?.get?.(envConfig.X_API_KEY_HEADER_NAME)
      : null;
    
    if (envConfig.DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.log('[API] ->', (config.method || 'GET').toUpperCase(), config.url, {
        'Auth': Boolean(authHeader),
        'API-Key': apiKeyHeaderValue ? `${envConfig.X_API_KEY_HEADER_NAME}: ${apiKeyHeaderValue.substring(0, 10)}...` : 'non défini',
        'Headers': Object.keys(config.headers as any || {})
      });
    }
  } catch {}

  return config;
});

// Rafraîchissement de token avec anti-boucle
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let lastRefreshAttempt = 0;
let redirectingToLogin = false;

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, essayer de le renouveler
      const refreshToken = localStorage.getItem('refreshToken');
      const originalRequest = error.config;

      // Ne pas tenter de refresh si on est déjà sur l'endpoint de refresh
      const isRefreshEndpoint = originalRequest?.url?.includes('/v1/auth/refresh');
      if (!refreshToken || isRefreshEndpoint) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (!redirectingToLogin) {
          redirectingToLogin = true;
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const now = Date.now();
        // Anti-boucle: éviter de tenter un refresh trop fréquent si plusieurs 401 arrivent en rafale
        if (!isRefreshing && now - lastRefreshAttempt > 3000) {
          lastRefreshAttempt = now;
          isRefreshing = true;
          refreshPromise = new Promise<string>((resolve, reject) => {
            axios
              .post(`${API_BASE_URL}/v1/auth/refresh`, {}, {
                headers: { Authorization: `Bearer ${refreshToken}` },
              })
              .then((resp) => {
                const { tokens } = (resp.data as any);
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                resolve(tokens.accessToken as string);
              })
              .catch((refreshError) => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (!redirectingToLogin) {
                  redirectingToLogin = true;
                  window.location.href = '/login';
                }
                reject(refreshError);
              })
              .then(() => {
                isRefreshing = false;
                refreshPromise = null;
              }, () => {
                isRefreshing = false;
                refreshPromise = null;
              });
          });
        }

        // Empêcher les multiples retries sur la même requête
        if (originalRequest._retry) {
          return Promise.reject(error);
        }
        originalRequest._retry = true;

        const newToken = refreshPromise ? await refreshPromise : (localStorage.getItem('accessToken') || '');

        // Rejouer la requête originale avec le nouveau token
        if (!originalRequest.headers) originalRequest.headers = {} as any;
        const origHeaders = originalRequest.headers as any;
        if (typeof origHeaders.set === 'function') {
          origHeaders.set('Authorization', `Bearer ${newToken}`);
        } else {
          origHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        return api.request(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// Wrapper pour utiliser l'API réelle avec fallback vers l'API mockée
const apiWrapper = {
  get: async (url: string, config?: any) => {
    // Si on force l'utilisation de l'API mockée
    if (USE_MOCK_API) {
      console.log('[MOCK API] GET', url, config?.params);
      return await handleMockRequest('GET', url, config);
    }
    
    // Sinon, essayer d'abord le serveur réel
    try {
      const isServerAvailable = await checkServerAvailability();
      if (isServerAvailable) {
        console.log('[REAL API] GET', url, config?.params);
        return await api.get(url, config);
      }
    } catch (error) {
      console.log('[API] Erreur serveur réel, fallback vers API mockée');
    }
    
    // Fallback vers l'API mockée
    if (FALLBACK_TO_MOCK) {
      console.log('[FALLBACK MOCK] GET', url, config?.params);
      return await handleMockRequest('GET', url, config);
    }
    
    throw new Error('Serveur backend non disponible et API mockée désactivée');
  },

  post: async (url: string, data?: any, config?: any) => {
    // Si on force l'utilisation de l'API mockée
    if (USE_MOCK_API) {
      console.log('[MOCK API] POST', url, data);
      return await handleMockRequest('POST', url, config, data);
    }
    
    // Sinon, essayer d'abord le serveur réel
    try {
      const isServerAvailable = await checkServerAvailability();
      if (isServerAvailable) {
        console.log('[REAL API] POST', url, data);
        return await api.post(url, data, config);
      }
    } catch (error) {
      console.log('[API] Erreur serveur réel, fallback vers API mockée');
    }
    
    // Fallback vers l'API mockée
    if (FALLBACK_TO_MOCK) {
      console.log('[FALLBACK MOCK] POST', url, data);
      return await handleMockRequest('POST', url, config, data);
    }
    
    throw new Error('Serveur backend non disponible et API mockée désactivée');
  },

  put: async (url: string, data?: any, config?: any) => {
    // Si on force l'utilisation de l'API mockée
    if (USE_MOCK_API) {
      console.log('[MOCK API] PUT', url, data);
      return await handleMockRequest('PUT', url, config, data);
    }
    
    // Sinon, essayer d'abord le serveur réel
    try {
      const isServerAvailable = await checkServerAvailability();
      if (isServerAvailable) {
        console.log('[REAL API] PUT', url, data);
        return await api.put(url, data, config);
      }
    } catch (error) {
      console.log('[API] Erreur serveur réel, fallback vers API mockée');
    }
    
    // Fallback vers l'API mockée
    if (FALLBACK_TO_MOCK) {
      console.log('[FALLBACK MOCK] PUT', url, data);
      return await handleMockRequest('PUT', url, config, data);
    }
    
    throw new Error('Serveur backend non disponible et API mockée désactivée');
  },

  patch: async (url: string, data?: any, config?: any) => {
    // Si on force l'utilisation de l'API mockée
    if (USE_MOCK_API) {
      console.log('[MOCK API] PATCH', url, data);
      return await handleMockRequest('PATCH', url, config, data);
    }
    
    // Sinon, essayer d'abord le serveur réel
    try {
      const isServerAvailable = await checkServerAvailability();
      if (isServerAvailable) {
        console.log('[REAL API] PATCH', url, data);
        return await api.patch(url, data, config);
      }
    } catch (error) {
      console.log('[API] Erreur serveur réel, fallback vers API mockée');
    }
    
    // Fallback vers l'API mockée
    if (FALLBACK_TO_MOCK) {
      console.log('[FALLBACK MOCK] PATCH', url, data);
      return await handleMockRequest('PATCH', url, config, data);
    }
    
    throw new Error('Serveur backend non disponible et API mockée désactivée');
  },

  delete: async (url: string, config?: any) => {
    // Si on force l'utilisation de l'API mockée
    if (USE_MOCK_API) {
      console.log('[MOCK API] DELETE', url);
      return await handleMockRequest('DELETE', url, config);
    }
    
    // Sinon, essayer d'abord le serveur réel
    try {
      const isServerAvailable = await checkServerAvailability();
      if (isServerAvailable) {
        console.log('[REAL API] DELETE', url);
        return await api.delete(url, config);
      }
    } catch (error) {
      console.log('[API] Erreur serveur réel, fallback vers API mockée');
    }
    
    // Fallback vers l'API mockée
    if (FALLBACK_TO_MOCK) {
      console.log('[FALLBACK MOCK] DELETE', url);
      return await handleMockRequest('DELETE', url, config);
    }
    
    throw new Error('Serveur backend non disponible et API mockée désactivée');
  }
};

// Export de la configuration d'environnement pour utilisation dans d'autres composants
export { envConfig };

export default apiWrapper;
