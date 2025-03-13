import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TermoCompromisso from './components/TermoCompromisso';
import UrlGerada from './components/UrlGerada';
import AssinarTermo from './components/AssinarTermo';
import VisualizarTermo from './components/VisualizarTermo';
import Dashboard from './components/Dashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TermoCompromisso />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/url/:id" element={<UrlGerada />} />
        <Route path="/assinar/:id" element={<AssinarTermo />} />
        <Route path="/visualizar/:id" element={<VisualizarTermo />} />
      </Routes>
    </BrowserRouter>
  );
} 