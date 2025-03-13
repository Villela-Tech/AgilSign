import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TermoService, TermoDetalhes } from '../services/api';
import './Dashboard.css';

interface DashboardStats {
  pendentes: number;
  assinados: number;
  recentes: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [termos, setTermos] = useState<TermoDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendente' | 'assinado'>('todos');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    carregarTermos();
  }, []);

  const carregarTermos = async () => {
    try {
      const data = await TermoService.listar();
      setTermos(data);
    } catch (err) {
      setError('Erro ao carregar os termos. Por favor, tente novamente.');
      console.error('Erro ao carregar termos:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (): DashboardStats => {
    const hoje = new Date();
    const ultimasHoras = new Date(hoje.getTime() - (24 * 60 * 60 * 1000));

    return {
      pendentes: termos.filter(t => t.status === 'pendente').length,
      assinados: termos.filter(t => t.status === 'assinado').length,
      recentes: termos.filter(t => new Date(t.dataCriacao) > ultimasHoras).length,
      total: termos.length
    };
  };

  const stats = calcularEstatisticas();

  const filteredTermos = termos.filter(termo => {
    const matchesSearch = (
      termo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      termo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      termo.equipamento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = filterStatus === 'todos' || termo.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCriarNovoTermo = () => {
    navigate('/');
  };

  const handleVisualizarTermo = (id: string) => {
    navigate(`/visualizar/${id}`);
  };

  const menuItems = [
    {
      icon: '📊',
      text: 'Visão Geral',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    {
      icon: '📝',
      text: 'Termos',
      path: '/termos',
      isActive: false,
      hasArrow: true
    },
    {
      icon: '✍️',
      text: 'Assinaturas',
      path: '/assinaturas',
      isActive: false
    },
    {
      text: 'Relatórios',
      type: 'section'
    },
    {
      icon: '📈',
      text: 'Estatísticas',
      path: '/estatisticas',
      isActive: false
    },
    {
      icon: '📊',
      text: 'Análises',
      path: '/analises',
      isActive: false,
      hasArrow: true
    },
    {
      text: 'Configurações',
      type: 'section'
    },
    {
      icon: '❓',
      text: 'Ajuda & Suporte',
      path: '/ajuda',
      isActive: false
    },
    {
      icon: '⚙️',
      text: 'Configurações',
      path: '/configuracoes',
      isActive: false
    }
  ];

  const riskMetrics = [
    {
      icon: '📝',
      color: '#FF4B8B',
      label: 'Termos Pendentes',
      value: `${stats.pendentes}`,
      percentage: `${((stats.pendentes / stats.total) * 100).toFixed(0)}%`
    },
    {
      icon: '✅',
      color: '#2F80ED',
      label: 'Termos Assinados',
      value: `${stats.assinados}`,
      percentage: `${((stats.assinados / stats.total) * 100).toFixed(0)}%`
    },
    {
      icon: '🕒',
      color: '#9B51E0',
      label: 'Termos Recentes',
      value: `${stats.recentes}`,
      percentage: `${((stats.recentes / stats.total) * 100).toFixed(0)}%`
    },
    {
      icon: '📊',
      color: '#2D9CDB',
      label: 'Total de Termos',
      value: `${stats.total}`,
      percentage: '100%'
    },
    {
      icon: '📈',
      color: '#27AE60',
      label: 'Taxa de Conclusão',
      value: `${((stats.assinados / stats.total) * 100).toFixed(0)}%`,
      percentage: `${((stats.assinados / stats.total) * 100).toFixed(0)}%`
    }
  ];

  if (loading) {
    return (
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">AgilSign</h1>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span>☰</span>
            </button>
          </div>
          <nav className={`sidebar-nav ${menuOpen ? 'open' : ''}`}>
            {menuItems.map((item, index) => (
              item.type === 'section' ? (
                <div key={index} className="nav-section">
                  {item.text}
                </div>
              ) : (
                <a
                  key={index}
                  href={item.path}
                  className={`nav-item ${item.isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.text}</span>
                  {item.hasArrow && <span className="nav-arrow">›</span>}
                </a>
              )
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="upgrade-card">
              <div className="upgrade-icon">⚡</div>
              <p>Desbloqueie recursos premium para sua empresa.</p>
              <a href="/upgrade" className="upgrade-link">Fazer upgrade →</a>
            </div>
            <button className="access-site-btn">Acessar documentação</button>
          </div>
        </div>
        <div className="main-content">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Carregando termos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">AgilSign</h1>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span>☰</span>
          </button>
        </div>
        <nav className={`sidebar-nav ${menuOpen ? 'open' : ''}`}>
          {menuItems.map((item, index) => (
            item.type === 'section' ? (
              <div key={index} className="nav-section">
                {item.text}
              </div>
            ) : (
              <a
                key={index}
                href={item.path}
                className={`nav-item ${item.isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.text}</span>
                {item.hasArrow && <span className="nav-arrow">›</span>}
              </a>
            )
          ))}
        </nav>
      </div>

      <div className="main-content">
        <header className="top-header">
          <div className="user-welcome">
            <img src="/avatar-placeholder.png" alt="User" className="user-avatar" />
            <div className="welcome-text">
              <h2>Bem-vindo ao AgilSign</h2>
              <p>Gerencie seus termos de forma eficiente</p>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={handleCriarNovoTermo} className="novo-termo-button">
              <span>+</span> Criar Novo Termo
            </button>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar termos..."
                className="global-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="icon-button" title="Notificações">🔔</button>
            <button className="icon-button" title="Ajuda">❔</button>
          </div>
        </header>

        <div className="risk-section">
          <div className="risk-header">
            <h3>Visão Geral dos Termos</h3>
            <select className="time-filter">
              <option value="daily">Hoje</option>
              <option value="weekly">Esta Semana</option>
              <option value="monthly">Este Mês</option>
            </select>
          </div>

          <div className="risk-metrics">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="risk-card">
                <div className="risk-icon" style={{ backgroundColor: metric.color }}>
                  {metric.icon}
                </div>
                <div className="risk-info">
                  <span className="risk-value">{metric.value}</span>
                  <span className="risk-label">{metric.label}</span>
                  <div className="risk-percentage" style={{ color: metric.color }}>
                    {metric.percentage}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="termos-section" style={{ marginTop: '20px' }}>
            <div className="dashboard-header">
              <h1>Termos Recentes</h1>
              <div className="dashboard-filters">
                <div className="status-filter">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'todos' | 'pendente' | 'assinado')}
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="assinado">Assinados</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="dashboard-error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="termos-grid">
              {filteredTermos.length === 0 ? (
                <div className="no-results">
                  <p>Nenhum termo encontrado com os filtros atuais.</p>
                </div>
              ) : (
                filteredTermos.slice(0, 6).map(termo => (
                  <div
                    key={termo.id}
                    className={`termo-card ${termo.status}`}
                    onClick={() => handleVisualizarTermo(termo.id)}
                  >
                    <div className="termo-header">
                      <h3>{termo.nome} {termo.sobrenome}</h3>
                      <span className={`status-badge ${termo.status}`}>
                        {termo.status === 'pendente' ? 'Pendente' : 'Assinado'}
                      </span>
                    </div>

                    <div className="termo-details">
                      <p><strong>Email:</strong> {termo.email}</p>
                      <p><strong>Equipamento:</strong> {termo.equipamento}</p>
                      <p><strong>Data:</strong> {formatarData(termo.dataCriacao)}</p>
                    </div>

                    <div className="termo-footer">
                      <button
                        className="visualizar-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVisualizarTermo(termo.id);
                        }}
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 