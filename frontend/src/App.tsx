import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedLayout from './components/AnimatedLayout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TermoCompromisso from './components/TermoCompromisso';
import TermoURL from './components/TermoURL';
import AssinarTermo from './components/AssinarTermo';
import VisualizarTermo from './components/VisualizarTermo';
import ConfirmacaoAssinatura from './components/ConfirmacaoAssinatura';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <AnimatedLayout>
            <Login />
          </AnimatedLayout>
        } />
        <Route path="/dashboard" element={
          <AnimatedLayout>
            <Dashboard />
          </AnimatedLayout>
        } />
        <Route path="/termo/novo" element={
          <AnimatedLayout>
            <TermoCompromisso />
          </AnimatedLayout>
        } />
        <Route path="/termo/:id/url" element={
          <AnimatedLayout>
            <TermoURL />
          </AnimatedLayout>
        } />
        <Route path="/assinar/:id" element={
          <AnimatedLayout>
            <AssinarTermo />
          </AnimatedLayout>
        } />
        <Route path="/confirmacao/:id" element={
          <AnimatedLayout>
            <ConfirmacaoAssinatura />
          </AnimatedLayout>
        } />
        <Route path="/visualizar/:id" element={
          <AnimatedLayout>
            <VisualizarTermo />
          </AnimatedLayout>
        } />
        <Route path="/termo/:id" element={
          <AnimatedLayout>
            <VisualizarTermo />
          </AnimatedLayout>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
