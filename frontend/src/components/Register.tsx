import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (authService.isAuthenticated()) {
      // Verificar se é administrador
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            setIsAdmin(true);
          } else {
            // Redirecionar usuários não administradores
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Erro ao verificar tipo de usuário:', error);
          navigate('/dashboard');
        }
      } else {
        // Se não houver informações do usuário, redirecionar para login
        navigate('/');
      }
    } else {
      // Se não estiver autenticado, redirecionar para login
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validações básicas
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    
    if (!password) {
      setError('Senha é obrigatória');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authService.register(name, email, password, role);
      console.log('Registro bem sucedido!');
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      
      // Limpar o formulário
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('user');
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao registrar usuário');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Se não for um administrador, não renderizar nada (redirecionamento é feito no useEffect)
  if (!isAdmin) {
    return <div className="loading-container">Verificando permissões...</div>;
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Cadastrar Novo Usuário</h2>
        <p>Preencha os dados para cadastrar um novo usuário no sistema</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            Usuário criado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Nome completo</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <span className="input-icon">👤</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <span className="input-icon">✉️</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <input
                type="password"
                id="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <div className="input-with-icon">
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          <div className="role-selector">
            <label>Tipo de Usuário:</label>
            <div className="role-options">
              <label className={role === 'user' ? 'active' : ''}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  disabled={loading}
                />
                <span>Usuário</span>
              </label>
              <label className={role === 'admin' ? 'active' : ''}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  disabled={loading}
                />
                <span>Administrador</span>
              </label>
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Processando...' : 'Cadastrar Usuário'}
          </button>
        </form>

        <div className="back-link">
          <button 
            className="back-button" 
            onClick={() => {
              // Verifica a rota anterior para decidir para onde voltar
              if (window.location.pathname === '/users/new') {
                navigate('/users');
              } else {
                navigate('/dashboard');
              }
            }}
            disabled={loading}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register; 