import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './UrlGerada.css';

interface UrlGeradaProps {
  urlAcesso: string;
  onClose: () => void;
}

const UrlGerada: React.FC<UrlGeradaProps> = ({ urlAcesso, onClose }) => {
  const [copiado, setCopiado] = useState(false);
  const url = `${window.location.origin}/assinar/${urlAcesso}`;

  console.log("URL Gerada:", url);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar URL:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Copiar URL</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>A URL gerada é:</p>
          <div className="url-display">
            <span>{url.replace(window.location.origin, '')}</span>
            <button onClick={handleCopiar} className="copy-button">
              {copiado ? '✓' : '📋'}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="close-button-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlGerada; 