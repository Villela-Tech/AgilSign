import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserService, Usuario } from '../services/api';
import { authService } from '../services/auth.service';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formulário de edição
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    carregarUsuarios();
    verificarPermissoes();
  }, []);

  const verificarPermissoes = () => {
    // Verificar se o usuário está autenticado e é admin
    if (authService.isAuthenticated()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
          setCurrentUserId(user.id);
          if (user.role !== 'admin') {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Erro ao verificar tipo de usuário:', error);
          navigate('/dashboard');
        }
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await UserService.listar();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar a lista de usuários. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirUsuario = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const confirmarExclusao = async () => {
    if (confirmDelete) {
      try {
        await UserService.excluir(confirmDelete);
        setSuccess('Usuário excluído com sucesso');
        carregarUsuarios();
        setError(null);
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err: any) {
        const mensagem = err.response?.data?.message || 'Erro ao excluir o usuário. Por favor, tente novamente.';
        setError(mensagem);
        console.error('Erro ao excluir usuário:', err);
      } finally {
        setConfirmDelete(null);
      }
    }
  };

  const handleEditarUsuario = (user: Usuario) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword('');
    setConfirmPassword('');
    setShowEditForm(true);
  };

  const handleCriarNovoUsuario = () => {
    navigate('/users/new');
  };

  const handleSubmitEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    // Validações
    if (editPassword && editPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const dadosAtualizados: { name?: string; email?: string; role?: string; password?: string } = {};
      
      if (editName !== selectedUser.name) dadosAtualizados.name = editName;
      if (editEmail !== selectedUser.email) dadosAtualizados.email = editEmail;
      if (editRole !== selectedUser.role) dadosAtualizados.role = editRole;
      if (editPassword) dadosAtualizados.password = editPassword;
      
      await UserService.atualizar(selectedUser.id, dadosAtualizados);
      await carregarUsuarios();
      setShowEditForm(false);
      setError(null);
      setSuccess('Usuário atualizado com sucesso');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao atualizar o usuário. Por favor, tente novamente.';
      setError(mensagem);
      console.error('Erro ao atualizar usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => 
    usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="user-management-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>Gerenciamento de Usuários</h1>
        <div className="user-management-actions">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="global-search"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="create-button"
            onClick={handleCriarNovoUsuario}
          >
            <span>➕</span> Novo Usuário
          </button>
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            <span>↩</span> Voltar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)}>Fechar</button>
        </div>
      )}

      {showEditForm && selectedUser && (
        <motion.div
          className="edit-user-form"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="form-header">
            <h2>Editar Usuário</h2>
            <button 
              className="close-button"
              onClick={() => {
                setShowEditForm(false);
                setError(null);
              }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmitEdicao}>
            <div className="form-group">
              <label htmlFor="editName">Nome:</label>
              <input
                id="editName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="editEmail">Email:</label>
              <input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="editRole">Perfil:</label>
              <select
                id="editRole"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                required
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="editPassword">Nova Senha (deixe em branco para manter a atual):</label>
              <input
                id="editPassword"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha:</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!editPassword}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setShowEditForm(false);
                  setError(null);
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="users-list">
        {filteredUsuarios.length === 0 ? (
          <div className="no-results">
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map(usuario => (
                  <tr key={usuario.id} className={currentUserId === usuario.id ? 'current-user' : ''}>
                    <td className="user-name">{usuario.name}</td>
                    <td className="user-email">{usuario.email}</td>
                    <td>
                      <span className={`role-badge ${usuario.role}`}>
                        {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td>{formatarData(usuario.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        className="edit-button"
                        onClick={() => handleEditarUsuario(usuario)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {/* Não permitir exclusão do próprio usuário */}
                      {currentUserId !== usuario.id && (
                        <button
                          className="delete-button"
                          onClick={(e) => handleExcluirUsuario(e, usuario.id)}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <h3 className="confirm-title">Excluir Usuário</h3>
              <p className="confirm-message">
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
    </div>
  );
};

export default UserManagement; 