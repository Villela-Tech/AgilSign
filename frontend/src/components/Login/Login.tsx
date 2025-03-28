import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './Login.css';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/Animations/loading.json';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se já estiver autenticado, redireciona para o dashboard
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      console.log('Login bem sucedido:', response);
      
      if (!response.token) {
        throw new Error('Token não recebido do servidor');
      }

      // Salva o token e os dados do usuário
      authService.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userRole', response.user.role);
      
      console.log('Token salvo:', response.token);
      console.log('Usuário salvo:', response.user);
      console.log('Role salvo:', response.user.role);

      // Redireciona para o dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="left-content">
          <h1>Transforme sua gestão documental</h1>
          <p>O AgilSign oferece uma solução completa para gerenciamento, assinatura e controle de documentos digitais de forma segura e eficiente.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9.5 11.5C9.5 12.3 8.8 13 8 13H7V15H5.5V9H8C8.8 9 9.5 9.7 9.5 10.5V11.5M14.5 13.5C14.5 14.3 13.8 15 13 15H10.5V9H13C13.8 9 14.5 9.7 14.5 10.5V13.5M18.5 10.5H17V11.5H18.5V13H17V15H15.5V9H18.5V10.5M7 10.5H8V11.5H7V10.5M12 10.5H13V13.5H12V10.5Z" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Documentos Digitais</h3>
                <p>Gerencie contratos, termos e documentos importantes em uma única plataforma centralizada</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M21.2 15.2L12 20.7L2.8 15.2L1 17L12 23L23 17L21.2 15.2M21.2 11.2L12 16.7L2.8 11.2L1 13L12 19L23 13L21.2 11.2M12 13.5L2.8 8L12 2.5L21.2 8L12 13.5Z" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Assinatura Digital ICP-Brasil</h3>
                <p>Assine documentos com validade jurídica utilizando certificados digitais no padrão ICP-Brasil</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Segurança Avançada</h3>
                <p>Proteção de dados com criptografia de ponta a ponta e conformidade com LGPD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Bem-vindo</h2>
          <p>Acesse sua conta para gerenciar seus documentos</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
              </span>
            </div>

            <div className="forgot-password">
              <span>Esqueceu a senha? <a href="#" style={{marginLeft: '2px'}}>Recuperar acesso</a></span>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <Lottie
                  animationData={loadingAnimation}
                  style={{ width: 30, height: 30 }}
                />
              ) : (
                <>
                  Acessar Sistema
                  <svg viewBox="0 0 24 24">
                    <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 