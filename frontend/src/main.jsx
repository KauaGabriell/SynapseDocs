import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import LoginError from './pages/LoginError';
import ProjectDetails from './pages/ProjectDetails';
import DocumentationPage from './pages/DocumentationPage';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';

const router = createBrowserRouter([
  // --- Rotas Públicas ---
  { path: '/', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/login-error', element: <LoginError /> },
  { path: '/project/:id', element: <ProjectDetails /> },
  { path: '/project/:id/documentation', element: <DocumentationPage /> },
  { path: '/register', element: <Register /> },

  // --- Rotas Protegidas (dashboard + layout inteiro) ---
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
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
