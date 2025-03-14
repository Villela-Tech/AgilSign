import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TermoCompromisso from './components/TermoCompromisso';
import TermoURL from './components/TermoURL';
import AssinarTermo from './components/AssinarTermo';
import VisualizarTermo from './components/VisualizarTermo';
import Dashboard from './components/Dashboard';

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de login */}
        <Route path="/" element={<Login />} />

        {/* Rotas protegidas (requerem autenticação) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Criar novo termo */}
        <Route path="/termo/novo" element={
          <ProtectedRoute>
            <TermoCompromisso />
          </ProtectedRoute>
        } />

        {/* Visualizar URL gerada após criar termo */}
        <Route path="/termo/:id/url" element={
          <ProtectedRoute>
            <TermoURL />
          </ProtectedRoute>
        } />

        {/* Visualizar detalhes do termo */}
        <Route path="/termo/:id" element={
          <ProtectedRoute>
            <VisualizarTermo />
          </ProtectedRoute>
        } />

        {/* Rota pública para assinar termo */}
        <Route path="/assinar/:id" element={<AssinarTermo />} />

        {/* Redirecionar rotas não encontradas para o dashboard */}
        <Route path="*" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
} 