import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TermoService, TermoDetalhes } from '../services/api';
import './Dashboard.css';

interface DashboardStats {
  pendentes: number;
  assinados: number;
  recentes: number;
  total: number;
}

interface MenuItem {
  icon?: string;
  text: string;
  path?: string;
  isActive?: boolean;
  type?: 'section';
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
    navigate('/termo/novo');
  };

  const handleVisualizarTermo = (id: string) => {
    navigate(`/termo/${id}`);
  };

  const handleGerarLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/termo/${id}/url`);
  };

  const handleExcluirTermo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const confirmarExclusao = async () => {
    if (confirmDelete) {
      try {
        await TermoService.excluir(confirmDelete);
        carregarTermos();
        setError(null);
      } catch (err: any) {
        const mensagem = err.response?.data?.message || 'Erro ao excluir o termo. Por favor, tente novamente.';
        if (err.response?.status === 403) {
          setError('Não é possível excluir termos já assinados.');
        } else if (err.response?.status === 404) {
          setError('Termo não encontrado.');
        } else {
          setError(mensagem);
        }
        console.error('Erro ao excluir termo:', err);
      } finally {
        setConfirmDelete(null);
      }
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: '📊',
      text: 'Visão Geral',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    {
      icon: '📝',
      text: 'Criar Termo',
      path: '/termo/novo',
      isActive: location.pathname === '/termo/novo'
    },
    {
      icon: '✍️',
      text: 'Termos Pendentes',
      path: '/dashboard?status=pendente',
      isActive: location.pathname === '/dashboard' && filterStatus === 'pendente'
    },
    {
      text: 'Relatórios',
      type: 'section'
    },
    {
      icon: '📈',
      text: 'Estatísticas',
      path: '/dashboard?view=stats',
      isActive: location.pathname === '/dashboard' && location.search.includes('stats')
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
      color: '#51C5EA',
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
      color: '#51C5EA',
      label: 'Total de Termos',
      value: `${stats.total}`,
      percentage: '100%'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="app-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
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
                <button
                  key={index}
                  onClick={() => item.path && navigate(item.path)}
                  className={`nav-item ${item.isActive ? 'active' : ''}`}
                >
                  {item.icon && <span className="nav-icon">{item.icon}</span>}
                  <span className="nav-text">{item.text}</span>
                </button>
              )
            ))}
          </nav>
        </div>
        <div className="main-content">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Carregando termos...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
              <button
                key={index}
                onClick={() => item.path && navigate(item.path)}
                className={`nav-item ${item.isActive ? 'active' : ''}`}
              >
                {item.icon && <span className="nav-icon">{item.icon}</span>}
                <span className="nav-text">{item.text}</span>
              </button>
            )
          ))}
        </nav>
      </div>

      <div className="main-content">
        <motion.header 
          className="top-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="user-welcome">
            <img src="/images/logo.png" alt="Logo" className="user-avatar" />
            <div className="welcome-text">
              <h2>Bem-vindo ao AgilSign</h2>
              <p>Gerencie seus termos de forma eficiente</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="global-search"
                placeholder="Buscar termos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={handleCriarNovoTermo} className="novo-termo-button">
              <span>+</span> Criar Novo Termo
            </button>
          </div>
        </motion.header>

        <motion.div 
          className="risk-metrics"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {riskMetrics.map((metric, index) => (
            <motion.div
              key={index}
              className="risk-card"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <div className="risk-icon" style={{ backgroundColor: `${metric.color}20`, color: metric.color }}>
                {metric.icon}
              </div>
              <div className="risk-info">
                <h3 className="risk-value">{metric.value}</h3>
                <p className="risk-label">{metric.label}</p>
                <span className="risk-percentage">{metric.percentage}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="dashboard-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'todos' | 'pendente' | 'assinado')}
            className="status-filter"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="assinado">Assinados</option>
          </select>
        </motion.div>

        {error ? (
          <motion.div 
            className="dashboard-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
          >
            <p>{error}</p>
            <button onClick={carregarTermos}>Tentar novamente</button>
          </motion.div>
        ) : filteredTermos.length === 0 ? (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>Nenhum termo encontrado</p>
          </motion.div>
        ) : (
          <motion.div 
            className="termos-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTermos.map((termo) => (
              <motion.div
                key={termo.id}
                className={`termo-card ${termo.status}`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                onClick={() => handleVisualizarTermo(termo.id)}
              >
                <div className="termo-header">
                  <h3>{termo.nome}</h3>
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
                  {termo.status === 'pendente' ? (
                    <div className="termo-actions">
                      <button 
                        className="action-button link-button"
                        onClick={(e) => handleGerarLink(e, termo.id)}
                        title="Gerar Link"
                      >
                        🔗
                      </button>
                      <button 
                        className="action-button delete-button"
                        onClick={(e) => handleExcluirTermo(e, termo.id)}
                        title="Excluir Termo"
                      >
                        🗑️
                      </button>
                      <button className="visualizar-button">
                        Visualizar Termo
                      </button>
                    </div>
                  ) : (
                    <button className="visualizar-button">
                      Visualizar Termo
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            className="confirm-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="confirm-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3 className="confirm-title">Excluir Termo</h3>
              <p className="confirm-message">
                Tem certeza que deseja excluir este termo? Esta ação não pode ser desfeita.
              </p>
              <div className="confirm-actions">
                <button 
                  className="confirm-button cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-button ok"
                  onClick={confirmarExclusao}
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard; 
