import { useEffect, type ReactNode } from 'react';
import { WORKSPACE_PATHS, type WorkspaceId } from './authorization';
import { useAuthorization } from './AuthorizationProvider';

function LoadingState({ message }: { message: string }) {
  return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] px-6 text-center text-sm text-slate-500">{message}</div>;
}

function AccessState({ title, detail }: { title: string; detail: string }) {
  const { allowedWorkspaces, signOut } = useAuthorization();
  const returnPath = allowedWorkspaces[0] ? WORKSPACE_PATHS[allowedWorkspaces[0]] : '/app';
  return <main className="grid min-h-screen place-items-center bg-[#F5F7FA] px-6"><section className="max-w-md rounded-2xl border border-[#D9E0EA] bg-white p-8 text-center shadow-2xs"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4065B3]">COS access control</p><h1 className="mt-3 text-2xl font-bold text-[#172B4D]">{title}</h1><p className="mt-3 text-sm leading-6 text-[#65758B]">{detail}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" className="min-h-11 rounded-lg bg-[#155EEF] px-4 text-sm font-bold text-white" onClick={() => window.location.assign(returnPath)}>Return to workspace</button><button type="button" className="min-h-11 rounded-lg border border-[#CBD5E2] px-4 text-sm font-bold text-[#344054]" onClick={() => void signOut().finally(() => window.location.assign('/login'))}>Sign out</button></div></section></main>;
}

function LoginRedirect() {
  useEffect(() => { window.location.replace('/login'); }, []);
  return <LoadingState message="Redirecting to sign in…" />;
}

export function ProtectedRoute({ workspace, permission, children }: { workspace?: WorkspaceId; permission?: string; children: ReactNode }) {
  const { status, canAccessWorkspace, error, hasPermission } = useAuthorization();
  if (status === 'loading' || status === 'authorizing') return <LoadingState message="Checking your workspace authorization…" />;
  if (status === 'unauthenticated') return <LoginRedirect />;
  if (status === 'unconfigured') return <AccessState title="Workspace unavailable" detail="Supabase authentication is not configured for this environment." />;
  if (status === 'profile-unavailable') return <AccessState title="Authorization profile unavailable" detail={error ?? 'Your account does not have an active COS authorization profile.'} />;
  if (status === 'error') return <AccessState title="Authorization could not be verified" detail={error ?? 'Access has been denied until your authorization can be confirmed.'} />;
  if (workspace && !canAccessWorkspace(workspace)) {
    return <AccessState title="Access denied" detail="Your account does not have permission to access this workspace." />;
  }
  if (permission && !hasPermission(permission)) {
    return <AccessState title="Access denied" detail="Your account does not have permission to use this controlled operation." />;
  }
  return <>{children}</>;
}

export function PublicLoginRoute({ children }: { children: ReactNode }) {
  const { status, error } = useAuthorization();
  useEffect(() => {
    if (status === 'authorized') window.location.replace('/app');
  }, [status]);
  if (status === 'loading' || status === 'authorizing') return <LoadingState message="Checking your workspace session…" />;
  if (status === 'authorized') return <LoadingState message="Opening your workspace…" />;
  if (status === 'unconfigured') return <AccessState title="Workspace unavailable" detail="Supabase authentication is not configured for this environment." />;
  if (status === 'profile-unavailable') return <AccessState title="Authorization profile unavailable" detail={error ?? 'Your account does not have an active COS authorization profile.'} />;
  if (status === 'error') return <AccessState title="Authorization could not be verified" detail={error ?? 'Access has been denied until your authorization can be confirmed.'} />;
  return <>{children}</>;
}

export function LegacyWorkspaceRedirect({ workspace }: { workspace: WorkspaceId }) {
  useEffect(() => { window.location.replace(WORKSPACE_PATHS[workspace]); }, [workspace]);
  return <LoadingState message="Opening your workspace…" />;
}
