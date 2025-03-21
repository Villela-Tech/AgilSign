import React, { useState } from 'react';
import { TermoService } from '../services/api';
import './UrlModal.css';

interface UrlModalProps {
  termoId: string;
  onClose: () => void;
}

const UrlModal: React.FC<UrlModalProps> = ({ termoId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = TermoService.gerarLinkAssinatura(termoId);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar URL:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Link para Assinatura</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
          Compartilhe este link com o usuário para que ele possa assinar o documento digitalmente.
          </p>
          
          <div className="url-box">
            <input
              type="text"
              value={url}
              readOnly
              className="url-input"
            />
            <button
              onClick={handleCopyUrl}
              className={`copy-button ${copied ? 'copied' : ''}`}
            >
              {copied ? 'Copiado ✅ ' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="modal-footer">
      
        </div>
      </div>
    </div>
  );
};

export default UrlModal; 