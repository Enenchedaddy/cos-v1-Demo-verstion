import type { ComponentType } from 'react';
import App from '../App';
import { normalizeLegacyWorkspace } from '../auth/authorization';
import { LegacyWorkspaceRedirect, ProtectedRoute, PublicLoginRoute } from '../auth/RouteGuards';
import ClientApprovalPortal from '../content-social/ClientApprovalPortal';
import AuthConfirmationPage from '../components/AuthConfirmationPage';
import LoginPage from '../components/LoginPage';
import PasswordRecoveryPage from '../components/PasswordRecoveryPage';
import PasswordSetupPage from '../components/PasswordSetupPage';
import UserProvisioningPage from '../components/UserProvisioningPage';

function AppEntryRoute() {
  const legacyWorkspace = normalizeLegacyWorkspace(new URLSearchParams(window.location.search).get('workspace'));
  if (legacyWorkspace) return <LegacyWorkspaceRedirect workspace={legacyWorkspace} />;
  return <ProtectedRoute><App initialPlatform="gateway" /></ProtectedRoute>;
}

function PublicLoginPage() {
  return <PublicLoginRoute><LoginPage /></PublicLoginRoute>;
}

const routes: Record<string, ComponentType> = {
  '/': PublicLoginPage,
  '/login': PublicLoginPage,
  '/password-recovery': () => <PublicLoginRoute><PasswordRecoveryPage /></PublicLoginRoute>,
  '/auth/confirm': AuthConfirmationPage,
  '/password-update': PasswordSetupPage,
  '/auth/complete': PasswordSetupPage,
  '/app': AppEntryRoute,
  '/app/sales-marketing': () => <ProtectedRoute workspace="sales-marketing"><App initialPlatform="sales-marketing" /></ProtectedRoute>,
  '/app/management': () => <ProtectedRoute workspace="management"><App initialPlatform="management" /></ProtectedRoute>,
  '/app/users': () => <ProtectedRoute permission="users.view"><UserProvisioningPage /></ProtectedRoute>,
};

/**
 * Client approvals are deliberately outside the authenticated application
 * shell. Possession of the short-lived, one-time token is the authorization
 * mechanism enforced by the database function.
 */
export function resolveClientApprovalToken(search: string): string | null {
  const params = new URLSearchParams(search);
  return params.get('token') ?? params.get('client_approval');
}

export default function AppRouter() {
  const approvalToken = resolveClientApprovalToken(window.location.search);
  if (approvalToken && (window.location.pathname === '/client-approval' || window.location.pathname.startsWith('/app'))) {
    return <ClientApprovalPortal token={approvalToken} />;
  }

  const Route = routes[window.location.pathname] ?? PublicLoginPage;
  return <Route />;
}
