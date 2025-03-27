import React, { useEffect, useState } from 'react';
import { UserService, TermoService, Usuario } from '../../services/api';
import { motion } from 'framer-motion';
import './UserStats.css';

interface UserStatItem {
  id: number;
  name: string;
  email: string;
  role: string;
  termCount: number;
}

const UserStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStatItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os usuários
        const users = await UserService.listar();
        
        // Buscar todos os termos
        const termos = await TermoService.listar();
        
        // Calcular estatísticas para cada usuário
        const statsPromises = users.map(async (user) => {
          // Contagem de termos em que o usuário é responsável
          const userTerms = termos.filter(termo => termo.responsavelId === user.id);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            termCount: userTerms.length
          };
        });
        
        const stats = await Promise.all(statsPromises);
        setUserStats(stats);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Erro ao carregar estatísticas de usuários. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar usuários com base na pesquisa
  const filteredUsers = userStats.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="user-stats-loading">
        <p>Carregando estatísticas de usuários...</p>
      </div>
    );
  }

  return (
    <div className="user-stats-container">
      <div className="user-stats-header">
        <h2>Estatísticas de Usuários</h2>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="user-search"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="user-stats-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="summary-card">
              <h3>Total de Usuários</h3>
              <p>{userStats.length}</p>
            </div>
            <div className="summary-card">
              <h3>Total de Termos Atribuídos</h3>
              <p>{userStats.reduce((total, user) => total + user.termCount, 0)}</p>
            </div>
            <div className="summary-card">
              <h3>Média de Termos por Usuário</h3>
              <p>
                {userStats.length 
                  ? (userStats.reduce((total, user) => total + user.termCount, 0) / userStats.length).toFixed(1) 
                  : '0'}
              </p>
            </div>
          </div>

          <motion.div 
            className="user-stats-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="user-stats-table-header">
              <div className="column user-name">Nome</div>
              <div className="column user-email">Email</div>
              <div className="column user-role">Perfil</div>
              <div className="column user-terms">Termos</div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="no-users-found">
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <motion.div 
                  key={user.id} 
                  className="user-stats-item"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="column user-name">{user.name}</div>
                  <div className="column user-email">{user.email}</div>
                  <div className="column user-role">
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </div>
                  <div className="column user-terms">
                    <span className="term-count">{user.termCount}</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default UserStats; 