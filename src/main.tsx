import {StrictMode} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LoginPage from './components/LoginPage.tsx';
import SignupPage from './components/SignupPage.tsx';
import './index.css';

const routes: Record<string, ComponentType> = {
  '/': LoginPage,
  '/login': LoginPage,
  '/signup': SignupPage,
  '/app': App,
};

const params = new URLSearchParams(window.location.search);
const queryRoute = params.get('view') === 'app'
  ? App
  : params.get('auth') === 'signup'
    ? SignupPage
    : params.get('auth') === 'login'
      ? LoginPage
      : null;
const RoutedApp = queryRoute ?? routes[window.location.pathname] ?? LoginPage;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoutedApp />
  </StrictMode>,
);
