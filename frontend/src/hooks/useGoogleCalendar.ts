import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export function useGoogleCalendar(actions: any) {
  const { t } = useTranslation();
  
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    url: string;
    buttonText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    url: '',
    buttonText: '',
    onConfirm: () => {}
  });
  const loadCalendars = useCallback(async () => {
    try {
      const response = await api.get('/v1/gcal/calendars');
      actions.setCalendars((response.data as any).items || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        actions.setError('Google Calendar non connecté. Veuillez vous connecter d\'abord.');
      } else {
        actions.setError('Erreur lors du chargement des calendriers');
      }
    }
  }, [actions]);

  const checkGcalConnection = useCallback(async () => {
    try {
      // Vérifier d'abord si on a un token d'accès
      const token = localStorage.getItem('accessToken');
      if (!token) {
        actions.setGcalConnected(false);
        return;
      }
      
      await api.get('/v1/gcal/calendars');
      actions.setGcalConnected(true);
      loadCalendars();
    } catch (err: any) {
      console.log('Google Calendar non connecté:', err.response?.status);
      actions.setGcalConnected(false);
    }
  }, [actions, loadCalendars]);

  const loadEvents = useCallback(async (calendarId: string = 'primary') => {
    try {
      actions.setLoading(true);
      const response = await api.get(`/v1/gcal/events?calendarId=${calendarId}`);
      actions.setEvents((response.data as any).items || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        actions.setError('Google Calendar non connecté. Veuillez vous connecter d\'abord.');
      } else {
        actions.setError('Erreur lors du chargement des événements');
      }
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const connectGoogleCalendar = useCallback(async () => {
    try {
      const response = await api.get('/v1/gcal/auth-url');
      const authUrl = (response.data as any).url;
      
      setAuthModal({
        isOpen: true,
        title: t('externalLink.googleAuth.title'),
        description: t('externalLink.googleAuth.description'),
        url: authUrl,
        buttonText: t('externalLink.googleAuth.openGoogle'),
        onConfirm: () => {
          window.open(authUrl, '_blank');
          actions.setShowTokenInput(true);
        }
      });
    } catch (err: any) {
      actions.setError('Erreur lors de la génération de l\'URL OAuth');
    }
  }, [actions, t]);

  const storeTokens = useCallback(async (tokensText: string) => {
    try {
      const parsed = JSON.parse(tokensText || '{}');
      const payload = parsed.tokens ? parsed.tokens : parsed;
      if (!payload?.access_token || !payload?.refresh_token) {
        actions.setError('Tokens invalides: access_token ou refresh_token manquant');
        return;
      }
      await api.post('/v1/gcal/store-tokens', {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        scope: payload.scope,
        token_type: payload.token_type || 'Bearer',
        expiry_date: payload.expiry_date,
      });
      actions.resetTokens();
      actions.setGcalConnected(true);
      await loadCalendars();
    } catch (e) {
      actions.setError('Échec de l\'enregistrement des tokens');
    }
  }, [actions, loadCalendars]);

  const closeAuthModal = useCallback(() => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return useMemo(() => ({
    checkGcalConnection,
    loadCalendars,
    loadEvents,
    connectGoogleCalendar,
    storeTokens,
    authModal,
    closeAuthModal,
  }), [checkGcalConnection, loadCalendars, loadEvents, connectGoogleCalendar, storeTokens, authModal, closeAuthModal]);
}
