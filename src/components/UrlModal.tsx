import React, { useState } from 'react';
import './UrlModal.css';

interface UrlModalProps {
  termoId: string;
  onClose: () => void;
}

const UrlModal: React.FC<UrlModalProps> = ({ termoId, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // Define a URL base baseada no ambiente
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://ville5113.c44.integrator.host'
    : window.location.origin;
    
  const url = `${baseUrl}/assinar/${termoId}`;

  console.log('Ambiente:', process.env.NODE_ENV);
  console.log('URL base:', baseUrl);
  console.log('URL gerada:', url);

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