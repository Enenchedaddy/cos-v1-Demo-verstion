import {StrictMode, useEffect, useState} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LoginPage from './components/LoginPage.tsx';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import './index.css';

const routes: Record<string, ComponentType> = {
  '/': LoginPage,
  '/login': LoginPage,
  '/app': App,
};

function AuthenticatedRoute() {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'unconfigured'>('checking');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('unconfigured');
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setStatus(data.session ? 'authenticated' : 'unauthenticated');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (status === 'checking') return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">Checking workspace session…</div>;
  if (status === 'unauthenticated') {
    window.location.replace('/login');
    return null;
  }
  if (status === 'unconfigured') return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] px-6 text-center text-sm text-slate-600">Supabase authentication is not configured for this environment.</div>;
  return <App />;
}

const RoutedApp: ComponentType = window.location.pathname === '/app'
  ? AuthenticatedRoute
  : routes[window.location.pathname] ?? LoginPage;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoutedApp />
  </StrictMode>,
);
