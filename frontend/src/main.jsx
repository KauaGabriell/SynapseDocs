import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

//Importando componentes.
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import LoginError from './pages/LoginError'; 

// Rotas
const router = createBrowserRouter([
  // --- Rotas Públicas (Não têm Sidebar/Header) ---
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/login-error',
    element: <LoginError />,
  },

  // --- Rotas Protegidas (Tudo aqui DENTRO terá Sidebar/Header) ---
  {
    element: <Layout />, 
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);