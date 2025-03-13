import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TermoService, TermoDetalhes } from '../services/api';
import CopiarUrl from './CopiarUrl';
import './VisualizarTermo.css';

const VisualizarTermo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [termo, setTermo] = useState<TermoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarTermo = async () => {
      try {
        if (!id) return;
        const data = await TermoService.buscarPorId(id);
        setTermo(data);
      } catch (error) {
        console.error('Erro ao carregar termo:', error);
        setError('Não foi possível carregar o termo. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    carregarTermo();
  }, [id]);

  if (loading) {
    return (
      <div className="visualizar-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error || !termo) {
    return (
      <div className="visualizar-container">
        <div className="error">
          <p>{error || 'Termo não encontrado'}</p>
          <button onClick={() => navigate('/')} className="voltar-button">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="visualizar-container">
      <img src="/images/logo.png" alt="Logo" className="logo" />
      
      <div className="visualizar-card">
        <h2 className="visualizar-title">Termo de Recebimento</h2>
        
        <div className="termo-info">
          <div className="info-group">
            <h3>Dados do Recebedor</h3>
            <p><strong>Nome:</strong> {termo.nome} {termo.sobrenome}</p>
            <p><strong>Email:</strong> {termo.email}</p>
          </div>

          <div className="info-group">
            <h3>Equipamento</h3>
            <p>{termo.equipamento}</p>
          </div>

          <div className="info-group">
            <h3>Status</h3>
            <p className={`status ${termo.status}`}>{termo.status}</p>
          </div>

          <div className="info-group">
            <h3>Link para Assinatura</h3>
            <CopiarUrl url={`http://localhost:3000/assinar/${termo.id}`} />
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/')} className="voltar-button">
            Voltar ao Início
          </button>
        </div>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default VisualizarTermo; 