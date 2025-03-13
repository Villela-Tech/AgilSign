import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { TermoService } from '../services/api';
import { generateTermoRecebimento } from '../services/pdfService';
import './AssinarTermo.css';

type SignatureCanvasRef = SignatureCanvas | null;

const AssinarTermo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const sigCanvas = useRef<SignatureCanvasRef>(null);
  const [assinado, setAssinado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [equipamento, setEquipamento] = useState('');

  const handleLimpar = () => {
    sigCanvas.current?.clear();
    setAssinado(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assinado || !sigCanvas.current) {
      alert('Por favor, faça sua assinatura antes de continuar.');
      return;
    }

    try {
      setLoading(true);

      // Obter a assinatura como base64
      const canvas = sigCanvas.current.getCanvas();
      const assinaturaBase64 = canvas.toDataURL('image/png');
      
      // Criar o termo no backend
      const termoData = {
        nome,
        sobrenome,
        email,
        equipamento,
        assinatura: assinaturaBase64,
      };

      const response = await TermoService.criar(termoData);
      
      // Gerar o PDF
      const doc = await generateTermoRecebimento(termoData);
      doc.save('termo-recebimento.pdf');
      
      // Redirecionar para a página de visualização
      navigate(`/visualizar/${response.id}`);
      
    } catch (error) {
      console.error('Erro ao processar termo:', error);
      alert('Ocorreu um erro ao processar o termo. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assinar-container">
      <img src="/images/logo.png" alt="Logo" className="logo" />
      
      <div className="assinar-card">
        <h2 className="assinar-title">Termo de Recebimento</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Sobrenome"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              className="form-input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Equipamento"
              value={equipamento}
              onChange={(e) => setEquipamento(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="signature-area">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'signature-canvas',
                width: 600,
                height: 200,
                style: {
                  width: '100%',
                  maxWidth: '600px',
                  height: '200px'
                }
              }}
              onBegin={() => setAssinado(true)}
            />
            <button 
              type="button" 
              className="limpar-button"
              onClick={handleLimpar}
            >
              Limpar
            </button>
          </div>

          <button 
            type="submit" 
            className="assinar-button"
            disabled={!assinado || loading}
          >
            {loading ? 'Processando...' : 'Assinar e Gerar PDF'}
          </button>
        </form>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default AssinarTermo; 