// Helper pour présenter une erreur API avec i18n
// Utilisation côté composant React :
// const { t } = useTranslation();
// const { title, message } = presentApiErrorI18n(err, t);
// showError(title, message);

type TFunction = (key: string, options?: Record<string, any>) => string;

export const presentApiErrorI18n = (err: unknown, t: TFunction) => {
  const e = (err as any) || {};
  const errorId: string | undefined = e?.errorId ?? e?.response?.data?.errorId;
  const rawMessage: string | undefined = e?.message ?? e?.response?.data?.message;

  const title = t('errors.title', { defaultValue: 'Erreur' });
  // Clé i18n basée sur errorId, avec repli sur un message par défaut
  const key = errorId ? `errors.backend.${errorId}` : 'errors.unexpected';
  const fallback = rawMessage || t('errors.unexpected', { defaultValue: 'Une erreur est survenue.' });
  const message = t(key, { defaultValue: fallback });

  return { title, message, errorId };
};


