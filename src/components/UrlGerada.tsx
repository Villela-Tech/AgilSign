import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './UrlGerada.css';

const UrlGerada: React.FC = () => {
  const [copiado, setCopiado] = useState(false);
  const { id } = useParams();
  const url = `${window.location.origin}/assinar/${id}`;

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
    <div className="url-container">
      <img src="/images/logo.png" alt="Logo" className="logo" />
      
      <div className="url-card">
        <h2>Copiar URL</h2>
        
        <div className="url-display">
          <span>{url.replace(window.location.origin, '')}</span>
          <button onClick={handleCopiar} className="copy-button">
            {copiado ? '✓' : '📋'}
          </button>
        </div>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default UrlGerada; 