import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 style={{ color: '#2563eb' }}>AgilSign</h1>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h2>GERAL</h2>
          <ul>
            <li>
              <Link to="/dashboard" className="nav-item">
                <span className="nav-icon">📊</span>
                Visão Geral
              </Link>
            </li>
            <li>
              <Link to="/termo/novo" className="nav-item">
                <span className="nav-icon">📝</span>
                Criar Termo
              </Link>
            </li>
            <li>
              <Link to="/terms/pending" className="nav-item">
                <span className="nav-icon">🏆</span>
                Termos Pendentes
              </Link>
            </li>
          </ul>
        </div>
        <div className="nav-section">
          <h2>ADMINISTRADOR</h2>
          <ul>
            <li>
              <Link to="/users" className="nav-item">
                <span className="nav-icon">👥</span>
                Usuários
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar; 