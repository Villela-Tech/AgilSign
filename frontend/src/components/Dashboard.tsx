import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TermoService, TermoDetalhes } from '../services/api';
import TermoCompromisso from './TermoCompromisso';
import UrlModal from './UrlModal';
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
  onClick?: () => void;
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
  const [showForm, setShowForm] = useState(false);
  const [selectedTermo, setSelectedTermo] = useState<TermoDetalhes | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedUrlAcesso, setSelectedUrlAcesso] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>('visaoGeral');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 8 itens por linha, 2 linhas
  const maxPagesToShow = 5;

  useEffect(() => {
    carregarTermos();
  }, []);

  const carregarTermos = async () => {
    try {
      const data = await TermoService.listar();
      // Converter TermoCompromisso[] para TermoDetalhes[]
      const termosDetalhes = data.map(termo => ({
        id: termo.id.toString(),
        nome: termo.nome || '',
        sobrenome: termo.sobrenome || '',
        email: termo.email || '',
        equipamento: termo.equipamento || '',
        status: termo.status === 'cancelado' ? 'pendente' : termo.status || 'pendente',
        dataCriacao: termo.created_at || new Date().toISOString(),
        urlAcesso: termo.urlAcesso || '',
        created_at: termo.created_at || new Date().toISOString(),
        updated_at: termo.updated_at || new Date().toISOString()
      }));
      setTermos(termosDetalhes);
      setError(null);
      return termosDetalhes;
    } catch (err) {
      console.error('Erro ao carregar termos:', err);
      setTermos([]);
      setError('Erro ao carregar os termos. Por favor, tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (): DashboardStats => {
    if (!Array.isArray(termos) || termos.length === 0) {
      return {
        pendentes: 0,
        assinados: 0,
        recentes: 0,
        total: 0
      };
    }

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

  const filteredTermos = Array.isArray(termos) ? termos.filter(termo => {
    const matchesSearch = (
      termo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      termo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      termo.equipamento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = filterStatus === 'todos' || termo.status === filterStatus;

    return matchesSearch && matchesStatus;
  }) : [];
  
  // Cálculo para paginação
  const indexOfLastTermo = currentPage * itemsPerPage;
  const indexOfFirstTermo = indexOfLastTermo - itemsPerPage;
  const currentTermos = filteredTermos.slice(indexOfFirstTermo, indexOfLastTermo);
  const totalPages = Math.ceil(filteredTermos.length / itemsPerPage);

  // Se a página atual é maior que o total de páginas e existem itens, ajustar para a última página
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredTermos, totalPages, currentPage]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const formatarData = (data: string) => {
    try {
      // Verificar se a data é válida
      if (!data) {
        return 'Data não disponível';
      }
      
      // Converter a string de data para objeto Date
      const dataObj = new Date(data);
      
      // Verificar se a data é válida após conversão
      if (isNaN(dataObj.getTime())) {
        console.warn('Data inválida:', data);
        return 'Data inválida';
      }
      
      // Formatar data e hora no padrão brasileiro: dd/mm/aaaa HH:MM
      return dataObj.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error, data);
      return 'Data inválida';
    }
  };

  const handleCriarNovoTermo = () => {
    navigate('/termo/novo');
  };

  const handleVisualizarTermo = (id: string) => {
    navigate(`/termo/${id}`);
  };

  const handleGerarLink = (e: React.MouseEvent, termo: TermoDetalhes) => {
    e.stopPropagation();
    setSelectedUrlAcesso(termo.urlAcesso);
    setShowUrlModal(true);
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

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);

    if (menuId === 'criarTermo') {
      setShowForm(true);
    } else if (menuId === 'usuarios') {
      navigate('/users');
    } else {
      setShowForm(false);
      if (menuId === 'visaoGeral') {
        setFilterStatus('todos');
      } else if (menuId === 'termosPendentes') {
        setFilterStatus('pendente');
      }
    }
  };

  const handleUrlGenerated = (url: string, id?: number) => {
    console.log("handleUrlGenerated chamado com URL:", url, "ID:", id);
    
    // Garantir que a modal seja mostrada com a URL
    if (url) {
      console.log("Exibindo modal com URL fornecida:", url);
      setSelectedUrlAcesso(url);
      setShowUrlModal(true);
      setShowForm(false);
      carregarTermos(); // Atualiza a lista de termos após criar um novo
      return;
    }
    
    // Se não tem URL mas tem ID, buscar o termo
    if (id) {
      console.log("Procurando termo com ID:", id);
      const termoStringId = id.toString();
      const termo = termos.find(t => t.id === termoStringId);
      
      if (termo && termo.urlAcesso) {
        console.log("Termo encontrado, mostrando modal com URL:", termo.urlAcesso);
        setSelectedUrlAcesso(termo.urlAcesso);
        setShowUrlModal(true);
        setShowForm(false);
      } else {
        // Se não encontrou, tentamos buscar o termo diretamente da API
        TermoService.buscarPorId(id)
          .then(termoData => {
            if (termoData && termoData.urlAcesso) {
              console.log("Termo obtido da API, mostrando modal com URL:", termoData.urlAcesso);
              setSelectedUrlAcesso(termoData.urlAcesso);
              setShowUrlModal(true);
              setShowForm(false);
              
              // Atualizar a lista de termos
              carregarTermos();
            }
          })
          .catch(error => {
            console.error("Erro ao buscar termo:", error);
          });
      }
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: '📊',
      text: 'Visão Geral',
      isActive: activeMenu === 'visaoGeral',
      onClick: () => handleMenuClick('visaoGeral')
    },
    {
      icon: '📝',
      text: 'Criar Termo',
      isActive: activeMenu === 'criarTermo',
      onClick: () => handleMenuClick('criarTermo')
    },
    {
      icon: '✍️',
      text: 'Termos Pendentes',
      isActive: activeMenu === 'termosPendentes',
      onClick: () => handleMenuClick('termosPendentes')
    },
    {
      text: 'Administrador',
      type: 'section'
    },
    {
      icon: '👥',
      text: 'Usuários',
      isActive: activeMenu === 'usuarios',
      onClick: () => handleMenuClick('usuarios')
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
                  onClick={() => item.onClick ? item.onClick() : item.path && navigate(item.path)}
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
    <motion.div className="app-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                onClick={() => item.onClick && item.onClick()}
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
        {showForm ? (
          <div className="form-section">
            <TermoCompromisso
              onComplete={() => setShowForm(false)}
              onUrlGenerated={handleUrlGenerated}
            />
          </div>
        ) : (
          <>
            
            <div className="filters-header">
              <div className="dashboard-filters">
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'todos' | 'pendente' | 'assinado')}
                  className="status-filter"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendente">Pendentes</option>
                  <option value="assinado">Assinados</option>
                </select>
              </div>
            </div>

            <div className="risk-metrics">
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
            </div>

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
              <>
                <motion.div
                  className="termos-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {currentTermos.map((termo) => (
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
                        <h3>{`${termo.nome} ${termo.sobrenome}`}</h3>
                        <span className={`status-badge ${termo.status}`}>
                          {termo.status === 'pendente' ? 'Pendente' : 'Assinado'}
                        </span>
                      </div>
                      <div className="termo-details">
                        <p>
                          <strong>Equipamento:</strong> {termo.equipamento}
                        </p>
                        <p>
                          <strong>Data:</strong> {formatarData(termo.dataCriacao)}
                        </p>
                      </div>
                      <div className="termo-footer">
                        {termo.status === 'pendente' ? (
                          <>
                            <div className="termo-actions">
                              <button
                                className="action-button link-button"
                                onClick={(e) => handleGerarLink(e, termo)}
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
                            </div>
                            <button className="visualizar-button">
                              Visualizar
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="termo-actions"></div>
                            <button className="visualizar-button">
                              Visualizar
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {filteredTermos.length > 0 && (
                  <div className="pagination">
                    <button 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="page-button"
                    >
                      &laquo;
                    </button>
                    
                    {(() => {
                      let startPage: number = 1;
                      let endPage: number = 1;
                      if (totalPages <= maxPagesToShow) {
                        startPage = 1;
                        endPage = totalPages;
                      } else {
                        const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
                        const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
                        
                        if (currentPage <= maxPagesBeforeCurrentPage) {
                          startPage = 1;
                          endPage = maxPagesToShow;
                        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                          startPage = totalPages - maxPagesToShow + 1;
                          endPage = totalPages;
                        } else {
                          startPage = currentPage - maxPagesBeforeCurrentPage;
                          endPage = currentPage + maxPagesAfterCurrentPage;
                        }
                      }
                      
                      return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                        const pageNumber = startPage + i;
                        return (
                          <button 
                            key={pageNumber} 
                            onClick={() => paginate(pageNumber)}
                            className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      });
                    })()}
                    
                    <button 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="page-button"
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </>
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
        {showUrlModal && selectedUrlAcesso && (
          <UrlModal
            urlAcesso={selectedUrlAcesso}
            onClose={() => {
              setShowUrlModal(false);
              setSelectedUrlAcesso(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
