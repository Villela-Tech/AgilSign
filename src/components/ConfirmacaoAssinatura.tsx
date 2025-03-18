import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TermoService, TermoDetalhes } from '../services/api';
import './ConfirmacaoAssinatura.css';

const ConfirmacaoAssinatura: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [termo, setTermo] = useState<TermoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarTermo = async () => {
      try {
        if (!id) return;
        const data = await TermoService.buscarPorId(id);
        
        if (data.status !== 'assinado') {
          setError('Este termo ainda não foi assinado.');
          return;
        }
        
        setTermo(data);
      } catch (err) {
        setError('Erro ao carregar o termo. Por favor, tente novamente.');
        console.error('Erro ao carregar termo:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarTermo();
  }, [id]);

  const handleVoltar = () => {
    // Se o usuário entrou pelo link de assinatura, volta para a tela inicial
    navigate('/');
  };

  const handleVisualizarTermo = () => {
    if (termo) {
      navigate(`/visualizar/${termo.id}`);
    }
  };

  if (loading) {
    return (
      <div className="confirmacao-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !termo) {
    return (
      <div className="confirmacao-container">
        <div className="error-message">
          {error || 'Termo não encontrado'}
          <button onClick={handleVoltar} className="voltar-button">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmacao-container">
      <h1 className="logo-text">AgilSign</h1>
      
      <div className="confirmacao-card">
        <div className="success-icon">✓</div>
        <h2 className="confirmacao-title">Assinatura Confirmada!</h2>
        <p className="confirmacao-message">
          Seu documento foi assinado com sucesso.
        </p>
        
        <div className="confirmacao-details">
          <div className="detail-item">
            <span className="detail-label">Nome:</span>
            <span className="detail-value">{termo.nome} {termo.sobrenome}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{termo.email}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Data:</span>
            <span className="detail-value">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        
        <div className="assinatura-preview">
          <img src={termo.assinatura} alt="Assinatura" />
        </div>
        
        <div className="confirmacao-actions">
          <button onClick={handleVoltar} className="voltar-button">
            Concluir
          </button>
          <button onClick={handleVisualizarTermo} className="visualizar-button">
            Visualizar Termo
          </button>
        </div>
      </div>
      
      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default ConfirmacaoAssinatura; 