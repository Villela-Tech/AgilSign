import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { TermoService, TermoDetalhes, AtualizarStatusDTO } from '../services/api';
import './AssinarTermo.css';

const AssinarTermo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [termo, setTermo] = useState<TermoDetalhes | null>(null);
  const [signed, setSigned] = useState(false);

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

  const handleLimpar = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSigned(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureRef.current || !termo) return;

    if (signatureRef.current.isEmpty()) {
      alert('Por favor, assine o documento antes de enviar.');
      return;
    }

    try {
      const updateData: AtualizarStatusDTO = {
        status: 'assinado',
        assinatura: signatureRef.current.toDataURL()
      };
      
      await TermoService.atualizarStatus(termo.id, updateData);
      navigate(`/visualizar/${termo.id}`);
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      setError('Erro ao salvar assinatura. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="assinar-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error || !termo) {
    return (
      <div className="assinar-container">
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
    <div className="assinar-container">
      <h1 className="logo-text">AgilSign</h1>
      
      <div className="assinar-card">
        <h2 className="assinar-title">Assinatura Digital</h2>
        
        <div className="signature-instructions">
          <p>Use seu dedo ou mouse para assinar abaixo</p>
          <p className="signature-note">Assine da maneira mais similar à sua assinatura usual</p>
        </div>

        <div className="signature-container">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'signature-canvas',
              width: window.innerWidth > 500 ? 500 : window.innerWidth - 40,
              height: 200
            }}
            onEnd={() => setSigned(true)}
          />
          <div className="signature-actions">
            <button type="button" onClick={handleLimpar} className="limpar-button">
              Limpar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="assinar-button"
              disabled={!signed}
            >
              Confirmar Assinatura
            </button>
          </div>
        </div>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default AssinarTermo; 