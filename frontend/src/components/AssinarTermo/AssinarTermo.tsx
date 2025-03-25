import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { TermoService, TermoDetalhes, AtualizarStatusDTO } from '../../services/api';
import './AssinarTermo.css';

const AssinarTermo: React.FC = () => {
  const params = useParams<{ id: string }>();
  const urlAcesso = params.id;
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(true);
  const [termo, setTermo] = useState<TermoDetalhes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarTermo = async () => {
      try {
        if (!urlAcesso) {
          setError('URL de acesso inválida');
          return;
        }

        console.log('[AssinarTermo] Iniciando busca do termo. URL:', urlAcesso);
        const data = await TermoService.buscarPorUrl(urlAcesso);
        
        if (!data) {
          setError('Termo não encontrado');
          return;
        }

        if (data.status === 'assinado') {
          setError('Este termo já foi assinado');
          return;
        }

        setTermo(data);
        setError(null);
      } catch (error: any) {
        console.error('[AssinarTermo] Erro ao carregar termo:', error);
        if (error.response?.status === 404) {
          setError('Termo não encontrado. Verifique se a URL está correta.');
        } else {
          setError('Erro ao carregar termo. Por favor, tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    carregarTermo();
  }, [urlAcesso]);

  const handleLimpar = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError('Por favor, forneça uma assinatura válida.');
      return;
    }

    try {
      if (!urlAcesso) {
        setError('URL de acesso inválida');
        return;
      }

      const updateData: AtualizarStatusDTO = {
        status: 'assinado',
        assinatura: signatureRef.current.toDataURL()
      };

      await TermoService.atualizarStatus(urlAcesso, updateData);
      alert('Termo assinado com sucesso!');
      window.close();
    } catch (error: any) {
      console.error('[AssinarTermo] Erro ao assinar:', error);
      if (error.response?.status === 404) {
        setError('Termo não encontrado. Verifique se a URL está correta.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Dados inválidos para assinatura.');
      } else {
        setError('Erro ao assinar o termo. Por favor, tente novamente mais tarde.');
      }
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
          <h1 className="logo-text">AgilSign</h1>
          <div className="error-message">
            <p>{error || 'Termo não encontrado'}</p>
            <button onClick={() => window.close()} className="voltar-button">
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assinar-container">
      <h1 className="logo-text">AgilSign</h1>
      
      <div className="assinar-card">
        <h2 className="assinar-title">Assinatura Digital</h2>
        
        <div className="termo-info">
          <p><strong>Nome:</strong> {termo.nome} {termo.sobrenome}</p>
          <p><strong>Equipamento:</strong> {termo.equipamento}</p>
        </div>
        
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
          />
          <div className="signature-actions">
            <button type="button" onClick={handleLimpar} className="limpar-button">
              Limpar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="assinar-button"
            >
              Confirmar Assinatura
            </button>
          </div>
        </div>
      </div>

      <p className="copyright">Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default AssinarTermo;