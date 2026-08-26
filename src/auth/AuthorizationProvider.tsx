import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import {
  hasPermission as permissionIncludes,
  resolveAllowedWorkspaces,
  toAuthorizationSnapshot,
  type AuthorizationProfile,
  type AuthorizationRole,
  type WorkspaceId,
} from './authorization';

export type AuthorizationStatus =
  | 'loading'
  | 'unauthenticated'
  | 'authorizing'
  | 'authorized'
  | 'profile-unavailable'
  | 'error'
  | 'unconfigured';

interface AuthorizationContextValue {
  status: AuthorizationStatus;
  user: User | null;
  profile: AuthorizationProfile | null;
  role: AuthorizationRole | null;
  permissions: readonly string[];
  allowedWorkspaces: readonly WorkspaceId[];
  error: string | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessWorkspace: (workspace: WorkspaceId) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null);

const EMPTY_AUTHORIZATION = {
  profile: null,
  role: null,
  permissions: [] as readonly string[],
  allowedWorkspaces: [] as readonly WorkspaceId[],
  error: null,
};

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthorizationStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [authorization, setAuthorization] = useState(EMPTY_AUTHORIZATION);

  const clearAuthorization = useCallback((nextStatus: AuthorizationStatus, message: string | null = null) => {
    setAuthorization({ ...EMPTY_AUTHORIZATION, error: message });
    setStatus(nextStatus);
  }, []);

  const resolveAuthorization = useCallback(async (nextUser: User | null) => {
    setUser(nextUser);
    if (!isSupabaseConfigured) {
      clearAuthorization('unconfigured', 'Supabase authentication is not configured for this environment.');
      return;
    }
    if (!nextUser) {
      clearAuthorization('unauthenticated');
      return;
    }

    setStatus('authorizing');
    setAuthorization(EMPTY_AUTHORIZATION);
    try {
      const { data, error } = await supabase.rpc('get_my_authorization');
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      const snapshot = rows.length === 1 ? toAuthorizationSnapshot(rows[0], nextUser.id) : null;
      if (!snapshot) {
        clearAuthorization('profile-unavailable', 'Your account does not have an active COS authorization profile.');
        return;
      }
      setAuthorization({
        profile: snapshot.profile,
        role: snapshot.role,
        permissions: snapshot.permissions,
        allowedWorkspaces: resolveAllowedWorkspaces(snapshot.permissions),
        error: null,
      });
      setStatus('authorized');
    } catch {
      clearAuthorization('error', 'We could not verify your workspace access. Please try again or contact an administrator.');
    }
  }, [clearAuthorization]);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      void resolveAuthorization(null);
      return undefined;
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setUser(null);
        clearAuthorization('error', 'We could not restore your workspace session.');
        return;
      }
      void resolveAuthorization(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) void resolveAuthorization(session?.user ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [clearAuthorization, resolveAuthorization]);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setUser(null);
      clearAuthorization('error', 'We could not restore your workspace session.');
      return;
    }
    await resolveAuthorization(data.session?.user ?? null);
  }, [clearAuthorization, resolveAuthorization]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    clearAuthorization('unauthenticated');
    if (error) throw error;
  }, [clearAuthorization]);

  const value = useMemo<AuthorizationContextValue>(() => ({
    status,
    user,
    profile: authorization.profile,
    role: authorization.role,
    permissions: authorization.permissions,
    allowedWorkspaces: authorization.allowedWorkspaces,
    error: authorization.error,
    isAuthenticated: user !== null,
    hasPermission: (permission) => permissionIncludes(authorization.permissions, permission),
    canAccessWorkspace: (workspace) => authorization.allowedWorkspaces.includes(workspace),
    refresh,
    signOut,
  }), [authorization, refresh, signOut, status, user]);

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
}

export function useAuthorization(): AuthorizationContextValue {
  const context = useContext(AuthorizationContext);
  if (!context) throw new Error('useAuthorization must be used within AuthorizationProvider.');
  return context;
}
