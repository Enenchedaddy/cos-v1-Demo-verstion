import {StrictMode} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LoginPage from './components/LoginPage.tsx';
import './index.css';

const routes: Record<string, ComponentType> = {
  '/': LoginPage,
  '/login': LoginPage,
  '/app': App,
};

const RoutedApp = routes[window.location.pathname] ?? LoginPage;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoutedApp />
  </StrictMode>,
);
