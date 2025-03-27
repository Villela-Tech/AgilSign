import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TermoService } from '../../services/api';
import { generateTermoRecebimento } from '../../services/pdfService';
import './VisualizarTermo.css';
import Sidebar from '../Sidebar/Sidebar';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/Animations/loading.json';
import UrlModal from '../UrlModal/UrlModal';

const VisualizarTermo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showLinkLoading, setShowLinkLoading] = useState(false);
  const [termo, setTermo] = useState<any>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedUrlAcesso, setSelectedUrlAcesso] = useState<string | null>(null);

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
        
        // Log para depuração - ver todos os campos disponíveis
        console.log('Dados do termo completos:', JSON.stringify(termoData, null, 2));
        
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
        const responsavel = termoData.responsavelNome || (termoData.responsavelId ? `ID: ${termoData.responsavelId}` : 'Não informado');
        const pdfDoc = await generateTermoRecebimento({
          nome: termoData.nome,
          sobrenome: termoData.sobrenome,
          email: termoData.email,
          equipamento: termoData.equipamento,
          numeroSerie: termoData.numeroSerie,
          equipe: termoData.equipe,
          assinatura: termoData.assinatura,
          data: dataExibicao,
          responsavel: responsavel,
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
    window.location.href = '/dashboard';
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

  const handleShowLink = () => {
    if (termo && termo.urlAcesso) {
      setShowLinkLoading(true);
      setTimeout(() => {
        const linkAssinatura = TermoService.gerarLinkAssinatura(termo.urlAcesso);
        setSelectedUrlAcesso(linkAssinatura);
        setShowUrlModal(true);
        setShowLinkLoading(false);
      }, 500);
    }
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
              </div>
            )}
          </div>
          
          <div className="pdf-actions slide-in">
            <button className="button custom-back-button" onClick={handleVoltar}>
              Voltar
            </button>
            
            <div className="action-buttons">
              {isPendente && (
                <>
                  <button 
                    className="button custom-edit-button" 
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
                        Editar
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="button custom-link-button" 
                    onClick={handleShowLink}
                    disabled={showLinkLoading}
                  >
                    {showLinkLoading ? (
                      <Lottie
                        animationData={loadingAnimation}
                        style={{ width: 30, height: 30 }}
                      />
                    ) : (
                      <>
                        <span className="link-icon">🔗</span>
                        Gerar Link
                      </>
                    )}
                  </button>
                </>
              )}
              
              <button 
                className="button custom-download-button" 
                onClick={handleBaixarPDF}
                disabled={downloadLoading || isPendente}
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
          
          {isPendente && (
            <div className="pending-info-container scale-in">
              <div className="pending-info-card">
                <div className="pending-icon">⏳</div>
                <h3>Termo Pendente de Assinatura</h3>
                <p>Este termo ainda não foi assinado. Veja abaixo uma prévia do documento.</p>
                <p>Compartilhe o link de assinatura para que o destinatário possa assinar o termo.</p>
              </div>
            </div>
          )}
          
          {pdfUrl && (
            <div className="pdf-container scale-in">
              <iframe 
                src={pdfUrl} 
                className="pdf-viewer"
                title="Visualização do Termo"
              />
            </div>
          )}

          {termo && termo.status === 'assinado' && termo.assinatura && (
            <div className="assinatura-container slide-in">
              <h3>Assinatura</h3>
              <div className="assinatura-preview">
                <img src={termo.assinatura} alt="Assinatura do termo" />
              </div>
            </div>
          )}

          {termo && (
            <div className="detalhes-termo-container slide-in">
              <h3>Detalhes do Equipamento</h3>
              <div className="detalhes-grid">
                <div className="detalhe-item">
                  <span className="detalhe-label">Equipamento:</span>
                  <span className="detalhe-valor">{termo.equipamento}</span>
                </div>
                
                <div className="detalhe-item">
                  <span className="detalhe-label">Número de Série:</span>
                  <span className="detalhe-valor">
                    {termo.numeroSerie ? termo.numeroSerie : "Não informado"}
                  </span>
                </div>
                
                {termo.patrimonio && termo.patrimonio.trim() && (
                  <div className="detalhe-item">
                    <span className="detalhe-label">Patrimônio:</span>
                    <span className="detalhe-valor">{termo.patrimonio}</span>
                  </div>
                )}
                
                <div className="detalhe-item">
                  <span className="detalhe-label">Responsável pelo Recebimento:</span>
                  <span className="detalhe-valor">{termo.nome} {termo.sobrenome}</span>
                </div>

                <div className="detalhe-item">
                  <span className="detalhe-label">Responsável pela Entrega:</span>
                  <span className="detalhe-valor">
                    {termo.responsavelNome || (termo.responsavelId ? `ID: ${termo.responsavelId}` : "Não informado")}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {termo && (
            <div className="logs-container slide-in">
              <h3>
                Logs do Termo
                <span className="admin-badge">Admin</span>
              </h3>
              <div className="logs-timeline">
                <div className="log-item">
                  <div className="log-icon creation">📝</div>
                  <div className="log-content">
                    <span className="log-title">Criação do Termo</span>
                    <span className="log-date">
                      {new Date(termo.createdAt || termo.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    {termo.responsavelNome && (
                      <span className="log-details">Por: {termo.responsavelNome}</span>
                    )}
                  </div>
                </div>
                
                {termo.status === 'assinado' && (
                  <div className="log-item">
                    <div className="log-icon signature">✅</div>
                    <div className="log-content">
                      <span className="log-title">Assinatura do Termo</span>
                      <span className="log-date">
                        {new Date(termo.updatedAt || termo.updated_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      <span className="log-details">Por: {termo.nome} {termo.sobrenome}</span>
                    </div>
                  </div>
                )}
                
                {termo.status === 'pendente' && 
                 new Date(termo.createdAt || termo.created_at).getTime() !== new Date(termo.updatedAt || termo.updated_at).getTime() && (
                  <div className="log-item">
                    <div className="log-icon edited">🔄</div>
                    <div className="log-content">
                      <span className="log-title">Última Modificação</span>
                      <span className="log-date">
                        {new Date(termo.updatedAt || termo.updated_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      {termo.responsavelNome && (
                        <span className="log-details">Por: {termo.responsavelNome}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {termo.status === 'pendente' && (
                  <div className="log-item pending">
                    <div className="log-icon pending">⏳</div>
                    <div className="log-content">
                      <span className="log-title">Aguardando Assinatura</span>
                      <span className="log-details">Enviado para: {termo.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showUrlModal && selectedUrlAcesso && (
        <UrlModal
          urlAcesso={selectedUrlAcesso}
          onClose={() => {
            setShowUrlModal(false);
            setSelectedUrlAcesso(null);
          }}
        />
      )}
    </div>
  );
};

export default VisualizarTermo;