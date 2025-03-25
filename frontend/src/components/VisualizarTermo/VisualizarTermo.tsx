import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TermoService } from '../../services/api';
import { generateTermoRecebimento } from '../../services/pdfService';
import './VisualizarTermo.css';
import Sidebar from '../Sidebar/Sidebar';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/Animations/loading.json';

const VisualizarTermo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [termo, setTermo] = useState<any>(null);

  useEffect(() => {
    const carregarPDF = async () => {
      if (!id) {
        setError('ID do termo não informado');
        setLoading(false);
        return;
      }

      try {
        const termoData = await TermoService.buscarPorId(Number(id));
        
        if (!termoData) {
          setError('Termo não encontrado');
          setLoading(false);
          return;
        }
        
        // Verifica se o termo está assinado
        if (termoData.status !== 'assinado') {
          setError('Este termo ainda está pendente de assinatura e não pode ser visualizado');
          setLoading(false);
          return;
        }
        
        setTermo(termoData);

        // Determinar qual data usar
        let dataExibicao;
        if (termoData.status === 'assinado') {
          // Usa a data de atualização (assinatura) para termos assinados
          const dataAtualizacao = termoData.updatedAt || termoData.updated_at;
          console.log('Data de assinatura (updatedAt):', dataAtualizacao);
          dataExibicao = new Date(dataAtualizacao).toLocaleDateString('pt-BR');
        } else {
          // Usa a data de criação como fallback
          console.log('Data de criação (createdAt):', termoData.createdAt || termoData.created_at);
          dataExibicao = new Date(termoData.createdAt || termoData.created_at).toLocaleDateString('pt-BR');
        }

        // Gerar PDF com o novo design
        const pdfDoc = await generateTermoRecebimento({
          nome: termoData.nome,
          sobrenome: termoData.sobrenome,
          email: termoData.email,
          equipamento: termoData.equipamento,
          numeroSerie: termoData.numeroSerie,
          equipe: termoData.equipe,
          assinatura: termoData.assinatura,
          data: dataExibicao,
          responsavel: 'Arthur Pomiecinski',
          patrimonio: termoData.patrimonio
        });

        const pdfBlob = pdfDoc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setLoading(false);
      } catch (error: any) {
        console.error('Erro ao carregar PDF:', error);
        setError('Erro ao carregar o PDF. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    carregarPDF();

    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const handleVoltar = () => {
    navigate('/dashboard');
  };

  const handleBaixarPDF = () => {
    if (pdfUrl) {
      setDownloadLoading(true);
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `termo-${id}.pdf`;
        link.click();
        setDownloadLoading(false);
      }, 500);
    }
  };
  
  const handleEditar = () => {
    setEditLoading(true);
    setTimeout(() => {
      navigate(`/termo/editar/${id}`);
    }, 500);
  };

  const isPendente = termo && termo.status === 'pendente';

  if (loading) {
    return (
      <div className="visualizar-termo-page">
        <Sidebar />
        <div className="visualizar-termo-container">
          <div className="loading-container">
            <Lottie
              animationData={loadingAnimation}
              style={{ width: 150, height: 150 }}
            />
            <p>Carregando PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualizar-termo-page">
        <Sidebar />
        <div className="visualizar-termo-container">
          <div className="error-container fade-in">
            <div className="error-message">{error}</div>
            <button className="button secondary" onClick={handleVoltar}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visualizar-termo-page">
      <Sidebar />
      <div className="visualizar-termo-container">
        <div className="termo-content">
          <div className="termo-header slide-in">
            <h2>Visualização do Termo</h2>
            {termo && (
              <div className="termo-info">
                <div className={`status-badge ${termo.status}`}>
                  {termo.status === 'pendente' ? 'Pendente' : 'Assinado'}
                </div>
                {termo.status === 'assinado' && (
                  <div className="date-info">
                    Assinado em: {new Date(termo.updatedAt || termo.updated_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="pdf-actions slide-in">
            <button className="button secondary" onClick={handleVoltar}>
              Voltar
            </button>
            
            <div className="action-buttons">
              {isPendente && (
                <button 
                  className="button primary edit-button" 
                  onClick={handleEditar}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <Lottie
                      animationData={loadingAnimation}
                      style={{ width: 30, height: 30 }}
                    />
                  ) : (
                    <>
                      <span className="edit-icon">✏️</span>
                      Editar Termo
                    </>
                  )}
                </button>
              )}
              
              <button 
                className="button primary download-button" 
                onClick={handleBaixarPDF}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <Lottie
                    animationData={loadingAnimation}
                    style={{ width: 30, height: 30 }}
                  />
                ) : (
                  <>
                    <span className="download-icon">↓</span>
                    Baixar PDF
                  </>
                )}
              </button>
            </div>
          </div>
          
          {pdfUrl && (
            <div className="pdf-container scale-in">
              <iframe 
                src={pdfUrl} 
                className="pdf-viewer"
                title="Visualização do Termo"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizarTermo;