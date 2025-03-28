import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const userName = localStorage.getItem('userName');

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, vamos limpar os dados locais e redirecionar
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 style={{ color: '#2563eb' }}>AgilSign</h1>
        {userName && <p className="user-name">Olá, {userName}</p>}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h2>GERAL</h2>
          <ul>
            <li>
              <Link to="/dashboard" className="nav-item">
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13.2V17.8C3 20.1196 3 21.2794 3.58579 22.1213C4.17157 22.9632 5.17157 22.9632 7.17157 22.9632H16.8284C18.8284 22.9632 19.8284 22.9632 20.4142 22.1213C21 21.2794 21 20.1196 21 17.8V13.2M3 13.2V9.4C3 7.08043 3 5.92064 3.58579 5.07875C4.17157 4.23686 5.17157 4.23686 7.17157 4.23686H16.8284C18.8284 4.23686 19.8284 4.23686 20.4142 5.07875C21 5.92064 21 7.08043 21 9.4V13.2M3 13.2H21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 4.23686V22.9632" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                Visão Geral
              </Link>
            </li>
            <li>
              <Link to="/termo/novo" className="nav-item">
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Criar Termo
              </Link>
            </li>
            <li>
              <Link to="/terms/pending" className="nav-item">
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Termos Pendentes
              </Link>
            </li>
          </ul>
        </div>

        {isAdmin && (
          <div className="nav-section">
            <h2>ADMINISTRADOR</h2>
            <ul>
              <li>
                <Link to="/users" className="nav-item">
                  <span className="nav-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 3.46776C17.4817 4.20411 18.5 5.73314 18.5 7.5C18.5 9.26686 17.4817 10.7959 16 11.5322M18 16.7664C19.5115 17.4503 20.8725 18.565 22 20M2 20C3.94649 17.5226 6.58918 16 9.5 16C12.4108 16 15.0535 17.5226 17 20M14 7.5C14 9.98528 11.9853 12 9.5 12C7.01472 12 5 9.98528 5 7.5C5 5.01472 7.01472 3 9.5 3C11.9853 3 14 5.01472 14 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Usuários
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <span className="nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 