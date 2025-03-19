import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FRONTEND_URL } from '../services/api';
import './UrlGerada.css';

interface UrlGeradaProps {
  url: string;
  onClose: () => void;
}

const UrlGerada: React.FC<UrlGeradaProps> = ({ onClose }) => {
  const [copiado, setCopiado] = useState(false);
  const { id } = useParams<{ id: string }>();
  const url = `${FRONTEND_URL}/assinar/${id}`;

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
            <span>{url}</span>
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