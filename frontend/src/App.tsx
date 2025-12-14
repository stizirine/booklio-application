import { Dashboard } from '@dashboard/index';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthResponse, LoginForm, RegisterForm } from './common/auth';
import LanguageSwitcher from './components/LanguageSwitcher';
import { AuthProvider, ModalProvider, NotificationProvider, TenantProvider, UIConfigProvider, useAuth } from './contexts';

type AuthState = 'login' | 'register' | 'dashboard';

// Composant interne pour utiliser le contexte Auth
function AppContent() {
  const { user, loading, refreshUser } = useAuth();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENV === 'production';
  const [authState, setAuthState] = useState<AuthState>('login');

  const handleLogin = async (authData: AuthResponse) => {
    // Persiste les tokens puis recharge l'utilisateur avant de basculer sur le dashboard
    localStorage.setItem('accessToken', authData.tokens.accessToken);
    localStorage.setItem('refreshToken', authData.tokens.refreshToken);
    await refreshUser();
    setAuthState('dashboard');
    window.dispatchEvent(new Event('authChanged'));
  };

  const handleRegister = (authData: AuthResponse) => {
    localStorage.setItem('accessToken', authData.tokens.accessToken);
    localStorage.setItem('refreshToken', authData.tokens.refreshToken);
    refreshUser();
    setAuthState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('authChanged'));
    setAuthState('login');
  };

  // Passer à dashboard si user est chargé
  useEffect(() => {
    if (loading) return;
    if (user && authState !== 'dashboard') {
      setAuthState('dashboard');
    } else if (!user && authState === 'dashboard') {
      // Ne revenir à login que si on était sur le dashboard (déconnexion)
      setAuthState('login');
    }
  }, [user, loading, authState]);

  // removed unused local switch helpers; inline handlers are used below

  return (
    <div className="App">
      {/* Sélecteur de langue global - visible uniquement en desktop */}
      <div className="hidden md:block fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <LanguageSwitcher />
      </div>

      {authState === 'login' && (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToRegister={isProduction ? undefined : () => setAuthState('register')} 
        />
      )}
      {authState === 'register' && !isProduction && (
        <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setAuthState('login')} />
      )}
      {authState === 'dashboard' && user && (
        <TenantProvider>
          <UIConfigProvider>
            <NotificationProvider>
              <ModalProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Routes>
                    <Route path="/*" element={<Dashboard user={user} onLogout={handleLogout} />} />
                  </Routes>
                </BrowserRouter>
              </ModalProvider>
            </NotificationProvider>
          </UIConfigProvider>
        </TenantProvider>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;