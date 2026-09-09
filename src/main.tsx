import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './app/AppRouter';
import { AuthorizationProvider } from './auth/AuthorizationProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthorizationProvider>
      <AppRouter />
    </AuthorizationProvider>
  </StrictMode>,
);
