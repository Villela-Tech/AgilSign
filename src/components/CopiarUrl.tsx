import React, { useState } from 'react';

interface CopiarUrlProps {
  url: string;
}

const CopiarUrl: React.FC<CopiarUrlProps> = ({ url }) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="url-box">
      <input
        type="text"
        value={url}
        readOnly
        className="url-input"
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <button
        onClick={handleCopiarLink}
        className={`copiar-button ${copiado ? 'copiado' : ''}`}
      >
        {copiado ? 'Copiado!' : 'Copiar Link'}
      </button>
    </div>
  );
};

export default CopiarUrl; 