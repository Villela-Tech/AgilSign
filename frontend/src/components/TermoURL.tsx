import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TermoService } from '../services/api';
import logo from '../assets/images/Logo.png';
import './TermoURL.css';

const TermoURL: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termo, setTermo] = useState<{ nome: string; email: string; urlAcesso: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const carregarTermo = async () => {
      if (!id) return;
      
      try {
        const data = await TermoService.buscarPorId(id);
        setTermo({
          nome: data.nome,
          email: data.email,
          urlAcesso: data.urlAcesso
        });
      } catch (err) {
        console.error('Erro ao carregar termo:', err);
        setError('Não foi possível carregar os detalhes do termo.');
      } finally {
        setLoading(false);
      }
    };

    carregarTermo();
  }, [id]);

  const urlAssinatura = termo?.urlAcesso ? TermoService.gerarLinkAssinatura(termo.urlAcesso) : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(urlAssinatura);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar URL:', err);
      setError('Não foi possível copiar a URL. Por favor, tente manualmente.');
    }
  };

  const handleVoltar = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="termo-url-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !termo) {
    return (
      <div className="termo-url-container">
        <div className="error-message">
          {error || 'Termo não encontrado'}
        </div>
        <button onClick={handleVoltar} className="voltar-button">
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="termo-url-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>
      <div className="termo-url-card">
        <div className="success-icon">✓</div>
        <h2>Termo Criado com Sucesso!</h2>
        
        <div className="termo-info">
          <p><strong>Nome:</strong> {termo.nome}</p>
          <p><strong>Email:</strong> {termo.email}</p>
        </div>

        <div className="url-section">
          <p className="url-label">Link para assinatura:</p>
          <div className="url-box">
            <input
              type="text"
              value={urlAssinatura}
              readOnly
              className="url-input"
            />
            <button
              onClick={handleCopyUrl}
              className={`copy-button ${copied ? 'copied' : ''}`}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="actions">
          <button onClick={handleVoltar} className="voltar-button">
            Voltar ao Dashboard
          </button>
          <button
            onClick={() => window.open(`/termo/${id}`, '_blank')}
            className="visualizar-button"
          >
            Visualizar Termo
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermoURL; 