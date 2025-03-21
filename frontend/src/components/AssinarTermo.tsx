import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { TermoService, TermoDetalhes, AtualizarStatusDTO } from '../services/api';
import './AssinarTermo.css';

const AssinarTermo: React.FC = () => {
  // O parâmetro está vindo como 'id' em vez de 'urlAcesso'
  const params = useParams<{ id: string }>();
  const urlAcesso = params.id; // Usar o id como urlAcesso
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(true);
  const [termo, setTermo] = useState<TermoDetalhes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assinatura, setAssinatura] = useState<string>('');

  console.log('[AssinarTermo] Componente iniciado');
  console.log('[AssinarTermo] params:', params);
  console.log('[AssinarTermo] urlAcesso do params.id:', urlAcesso);
  console.log('[AssinarTermo] Tipo do urlAcesso:', typeof urlAcesso);
  console.log('[AssinarTermo] URL atual:', window.location.href);

  useEffect(() => {
    const carregarTermo = async () => {
      try {
        if (!urlAcesso) {
          console.log('[AssinarTermo] URL de acesso não fornecido');
          setError('URL de acesso inválida');
          return;
        }

        console.log('[AssinarTermo] Iniciando busca do termo. URL:', urlAcesso);
        const data = await TermoService.buscarPorUrl(urlAcesso);
        
        if (!data) {
          console.log('[AssinarTermo] Nenhum dado retornado do servidor');
          setError('Erro ao carregar termo: dados não encontrados');
          return;
        }

        console.log('[AssinarTermo] Termo carregado com sucesso:', {
          id: data.id,
          nome: data.nome,
          status: data.status
        });
        
        setTermo(data);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
        console.error('[AssinarTermo] Erro ao carregar termo:', {
          message: errorMessage,
          status: error.response?.status,
          url: urlAcesso
        });
        setError(`Erro ao carregar termo: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    console.log('[AssinarTermo] Componente montado. URL de acesso:', urlAcesso);
    carregarTermo();
  }, [urlAcesso]);

  const handleLimpar = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AssinarTermo] Iniciando handleSubmit');
    console.log('[AssinarTermo] urlAcesso:', urlAcesso);
    console.log('[AssinarTermo] assinatura:', assinatura);

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      console.error('[AssinarTermo] Dados inválidos - assinatura vazia');
      setError('Por favor, forneça uma assinatura válida.');
      return;
    }

    try {
      if (!urlAcesso) {
        console.error('[AssinarTermo] urlAcesso não definido');
        setError('URL de acesso inválida');
        return;
      }

      console.log('[AssinarTermo] Enviando assinatura para:', urlAcesso);
      const updateData: AtualizarStatusDTO = {
        status: 'assinado',
        assinatura: signatureRef.current.toDataURL()
      };

      const response = await TermoService.atualizarStatus(urlAcesso, updateData);
      console.log('[AssinarTermo] Resposta do atualizarStatus:', response);
      if (response) {
        alert('Termo assinado com sucesso!');
        window.close();
      } else {
        setError('Erro ao salvar assinatura. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('[AssinarTermo] Erro ao assinar:', err);
      setError('Não foi possível assinar o termo. Por favor, tente novamente.');
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

      <p className="copyright"> Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default AssinarTermo;