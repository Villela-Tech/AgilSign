import React, { useState } from 'react';
import { TermoService } from '../services/api';

const CriarTermo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarTermoTeste = async () => {
    setLoading(true);
    setError(null);

    try {
      await TermoService.criar({
        nome: "João",
        sobrenome: "Silva",
        email: "joao@teste.com",
        equipamento: "Notebook Dell"
      });
      alert('Termo criado com sucesso!');
    } catch (err) {
      setError('Erro ao criar termo');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={criarTermoTeste}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#51C5EA',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Criando...' : 'Criar Termo de Teste'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default CriarTermo; 