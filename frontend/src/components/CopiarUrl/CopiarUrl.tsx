import React, { useState } from 'react';
import { TermoService } from '../../services/api';
import './CopiarUrl.css';

interface CopiarUrlProps {
  id: string;
}

const CopiarUrl: React.FC<CopiarUrlProps> = ({ id }) => {
  const [copiado, setCopiado] = useState(false);

  // Gera a URL de acesso usando o serviço
  const url = TermoService.gerarUrlAcesso(id);

  const handleCopiarClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar URL:', err);
      alert('Não foi possível copiar o link automaticamente. Por favor, copie manualmente.');
    }
  };

  return (
    <div className="copiar-url">
      <div className="url-display" onClick={() => handleCopiarClick()}>
        {url}
      </div>
      <button onClick={handleCopiarClick} className="copiar-button">
        {copiado ? 'Link Copiado!' : 'Copiar Link'}
      </button>
    </div>
  );
};

export default CopiarUrl; 