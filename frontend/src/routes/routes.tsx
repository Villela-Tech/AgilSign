import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login/Login';
import TermoCompromisso from '../components/TermoCompromisso/TermoCompromisso';
import TermoURL from '../components/TermoURL/TermoURL';
import AssinarTermo from '../components/AssinarTermo/AssinarTermo';
import VisualizarTermo from '../components/VisualizarTermo/VisualizarTermo';
import Dashboard from '../components/Dashboard/Dashboard';
import Register from '../components/Register/Register';
import UserManagement from '../components/UserManagement/UserManagement';
import EditarTermo from '../components/EditarTermo/EditarTermo';

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
        
        {/* Gerenciamento de usuários */}
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        {/* Cadastro de novos usuários */}
        <Route path="/users/new" element={
          <ProtectedRoute>
            <Register />
          </ProtectedRoute>
        } />
        
        {/* Criar novo termo */}
        <Route path="/termo/novo" element={
          <ProtectedRoute>
            <TermoCompromisso />
          </ProtectedRoute>
        } />

        {/* Editar termo existente */}
        <Route path="/termo/editar/:id" element={
          <ProtectedRoute>
            <EditarTermo />
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