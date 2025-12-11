import { Dashboard } from '@dashboard/index';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthResponse, LoginForm, RegisterForm } from './common/auth';
import LanguageSwitcher from './components/LanguageSwitcher';
import { AuthProvider, ModalProvider, NotificationProvider, TenantProvider, UIConfigProvider, useAuth } from './contexts';

type AuthState = 'login' | 'register' | 'dashboard';

// Composant interne pour utiliser le contexte Auth
function AppContent() {
  const { user, refreshUser } = useAuth();
  const [authState, setAuthState] = useState<AuthState>('login');

  const handleLogin = (authData: AuthResponse) => {
    localStorage.setItem('accessToken', authData.tokens.accessToken);
    localStorage.setItem('refreshToken', authData.tokens.refreshToken);
    refreshUser();
    setAuthState('dashboard');
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
    if (user && authState === 'login') {
      setAuthState('dashboard');
    } else if (!user && authState === 'dashboard') {
      setAuthState('login');
    }
  }, [user, authState]);

  // removed unused local switch helpers; inline handlers are used below

  return (
    <div className="App">
      {/* Sélecteur de langue global */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <LanguageSwitcher />
      </div>

      {authState === 'login' && (
        <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setAuthState('register')} />
      )}
      {authState === 'register' && (
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