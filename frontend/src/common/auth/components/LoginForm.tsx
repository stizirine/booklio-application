import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthForm } from '../hooks';
import { AuthResponse, LoginRequest } from '../types';
import { AuthToggleLink, ErrorMessage, FormField, SubmitButton } from './AuthFormComponents';

interface LoginFormProps {
  onLogin: (authData: AuthResponse) => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const { t } = useTranslation();
  
  const {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    handleChange
  } = useAuthForm<LoginRequest>({
    endpoint: '/v1/auth/login',
    onSuccess: onLogin
  });

  // Initialiser les données du formulaire
  React.useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
  }, [setFormData]);

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-gradient-to-br from-[var(--color-secondary)]/14 to-[var(--color-primary)]/10 blur-3xl" />
      </div>

      <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 mx-auto">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm sm:text-base font-semibold uppercase tracking-wide text-[var(--color-secondary)]">{t('auth.login')}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] leading-tight">
              {t('auth.welcomeBack', { name: '' })}
            </h1>
            <p className="text-[var(--color-muted)] text-sm sm:text-base">
              Accédez à votre espace en toute sécurité avec une interface pensée mobile-first.
            </p>
          </div>

          <div className="bg-[var(--color-card)] border border-[var(--color-border)] shadow-card rounded-[var(--radius-md)] p-6 sm:p-8 space-y-6 mx-auto">
            <div className="inline-flex items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-primary)]">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-lg shadow-sm">
                B
              </span>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Connexion sécurisée</p>
                <p className="text-sm font-semibold text-[var(--color-fg)]">Booklio</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <FormField
                id="email"
                name="email"
                type="email"
                label={t('auth.email')}
                placeholder={t('auth.email')}
                value={formData.email}
                onChange={handleChange}
                icon="mail"
                required
                autoComplete="email"
              />

              <FormField
                id="password"
                name="password"
                type="password"
                label={t('auth.password')}
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={handleChange}
                icon="lock-closed"
                required
                autoComplete="current-password"
              />

              {error && <ErrorMessage error={error} />}

              <SubmitButton
                loading={loading}
                loadingText={t('common.loading')}
                buttonText={t('auth.loginButton')}
                icon="arrow-right"
              />

              <AuthToggleLink
                text="Pas de compte ?"
                linkText={t('auth.register')}
                onClick={onSwitchToRegister}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
