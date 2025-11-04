import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoginButton from './components/LoginButton';
import AuthCallback from './pages/AuthCallback';

//Rota para Login
const router = createBrowserRouter([
  { path: '/', element: <LoginButton /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/auth/callback', element: <AuthCallback /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
