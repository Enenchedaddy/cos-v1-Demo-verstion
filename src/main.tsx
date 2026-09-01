import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import LoginPage from './components/LoginPage.tsx';
import AuthConfirmationPage from './components/AuthConfirmationPage.tsx';
import PasswordRecoveryPage from './components/PasswordRecoveryPage.tsx';
import PasswordSetupPage from './components/PasswordSetupPage.tsx';
import UserProvisioningPage from './components/UserProvisioningPage.tsx';
import { AuthorizationProvider } from './auth/AuthorizationProvider';
import { LegacyWorkspaceRedirect, ProtectedRoute, PublicLoginRoute } from './auth/RouteGuards';
import { normalizeLegacyWorkspace } from './auth/authorization';
import './index.css';

function AppEntryRoute() {
  const legacyWorkspace = normalizeLegacyWorkspace(new URLSearchParams(window.location.search).get('workspace'));
  if (legacyWorkspace) return <LegacyWorkspaceRedirect workspace={legacyWorkspace} />;
  return <ProtectedRoute><App initialPlatform="gateway" /></ProtectedRoute>;
}

const routes: Record<string, ComponentType> = {
  '/': () => <PublicLoginRoute><LoginPage /></PublicLoginRoute>,
  '/login': () => <PublicLoginRoute><LoginPage /></PublicLoginRoute>,
  '/password-recovery': () => <PublicLoginRoute><PasswordRecoveryPage /></PublicLoginRoute>,
  '/auth/confirm': AuthConfirmationPage,
  '/password-update': PasswordSetupPage,
  '/auth/complete': PasswordSetupPage,
  '/app': AppEntryRoute,
  '/app/sales-marketing': () => <ProtectedRoute workspace="sales-marketing"><App initialPlatform="sales-marketing" /></ProtectedRoute>,
  '/app/management': () => <ProtectedRoute workspace="management"><App initialPlatform="management" /></ProtectedRoute>,
  '/app/users': () => <ProtectedRoute permission="users.view"><UserProvisioningPage /></ProtectedRoute>,
};

const RoutedApp: ComponentType = routes[window.location.pathname] ?? (() => <PublicLoginRoute><LoginPage /></PublicLoginRoute>);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthorizationProvider>
      <RoutedApp />
    </AuthorizationProvider>
  </StrictMode>,
);
