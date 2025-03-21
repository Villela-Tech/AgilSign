import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TermoService, TermoDetalhes } from '../services/api';
import './VisualizarTermo.css';

const VisualizarTermo: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [termo, setTermo] = useState<TermoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarTermo = async () => {
      try {
        if (!id) return;
        const data = await TermoService.buscarPorId(id);
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

  const handleDownload = async () => {
    if (!termo) {
      console.error('[VisualizarTermo] Tentativa de download sem termo carregado');
      return;
    }
    
    console.log('[VisualizarTermo] Iniciando download do PDF para termo:', {
      id: termo.id,
      nome: termo.nome,
      status: termo.status
    });
    
    setDownloading(true);
    try {
      const blob = await TermoService.downloadPDF(String(termo.id));
      console.log('[VisualizarTermo] PDF recebido com sucesso');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `termo-${termo.nome.toLowerCase()}-${termo.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[VisualizarTermo] Erro ao baixar termo:', err);
      setError('Não foi possível baixar o termo. Por favor, tente novamente.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDownloading(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="visualizar-container">
        <div className="loading-spinner"></div>
        <p>Carregando termo...</p>
      </div>
    );
  }

  if (error || !termo) {
    return (
      <div className="visualizar-container">
        <div className="error-message">
          {error || 'Termo não encontrado'}
          <button onClick={() => navigate('/dashboard')} className="voltar-button">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="visualizar-container">
      <div className="termo-card">
        <div className="termo-header">
          <h2>Termo de Recebimento</h2>
          <span className={`status-badge ${termo.status}`}>
            {termo.status === 'pendente' ? 'Pendente' : 'Assinado'}
          </span>
        </div>

        <div className="termo-content">
          <div className="termo-section">
            <h3>Dados do Recebedor</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nome:</label>
                <p>{termo.nome} {termo.sobrenome}</p>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <p>{termo.email}</p>
              </div>
            </div>
          </div>

          <div className="termo-section">
            <h3>Equipamento</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Descrição:</label>
                <p>{termo.equipamento}</p>
              </div>
              <div className="info-item">
                <label>Data de Criação:</label>
                <p>{formatarData(termo.dataCriacao)}</p>
              </div>
            </div>
          </div>

          {termo.status === 'assinado' && (
            <div className="termo-section">
              <h3>Assinatura</h3>
              <div className="assinatura-preview">
                <img src={termo.assinatura} alt="Assinatura" />
              </div>
            </div>
          )}
        </div>

        <div className="termo-actions">
          <button onClick={() => navigate('/dashboard')} className="voltar-button">
            Voltar ao Dashboard
          </button>
          <button 
            onClick={handleDownload} 
            className="download-button"
            disabled={termo.status === 'pendente' || downloading}
          >
            {downloading ? (
              <>
                <div className="loading-spinner-small"></div>
                <span>Baixando...</span>
              </>
            ) : (
              <>
                <span>⬇️</span> Baixar Termo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualizarTermo;