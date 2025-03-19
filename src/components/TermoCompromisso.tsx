import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TermoService } from '../services/api';
import './TermoCompromisso.css';

interface FormData {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  equipe: string;
  numeroSerie: string;
  data: string;
}

const initialFormData: FormData = {
  nome: '',
  sobrenome: '',
  email: 'no-email@example.com',
  equipamento: '',
  equipe: '',
  numeroSerie: '',
  data: ''
};

interface Props {
  onComplete?: () => void;
  onUrlGenerated?: (url: string, id: string) => void;
}

const TermoCompromisso: React.FC<Props> = ({ onComplete, onUrlGenerated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';
    setFormData(prev => ({
      ...prev,
      [name]: formattedDate
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.sobrenome.trim()) {
      setError('Sobrenome é obrigatório');
      return false;
    }
    if (!formData.equipamento.trim()) {
      setError('Equipamento é obrigatório');
      return false;
    }
    if (!formData.numeroSerie.trim()) {
      setError('Número de série é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const termoData = {
        nome: formData.nome.trim(),
        sobrenome: formData.sobrenome.trim(),
        email: formData.email,
        equipamento: `${formData.equipamento.trim()} (S/N: ${formData.numeroSerie.trim()})`,
        equipe: formData.equipe.trim(),
        data: formData.data
      };

      const response = await TermoService.criar(termoData);

      if (response && response.id) {
        const url = TermoService.gerarLinkAssinatura(response.id);
        
        if (onUrlGenerated) {
          onUrlGenerated(url, response.id);
        } else {
          window.location.href = url;
        }
        
        if (onComplete) {
          onComplete();
        }
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar URL. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="termo-container">
      <div className="termo-form">
        <h2 className="termo-title">DADOS PESSOAIS</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Digite seu nome"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input
                type="text"
                id="sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Digite seu sobrenome"
              />
            </div>
          </div>

          <h2 className="termo-title">DADOS DO EQUIPAMENTO</h2>

          <div className="form-group">
            <label htmlFor="equipamento">Equipamento</label>
            <input
              type="text"
              id="equipamento"
              name="equipamento"
              value={formData.equipamento}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ex: Headset"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numeroSerie">Número de Série</label>
              <input
                type="text"
                id="numeroSerie"
                name="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: ABC123XYZ"
              />
            </div>
            <div className="form-group">
              <label htmlFor="equipe">Equipe</label>
              <input
                type="text"
                id="equipe"
                name="equipe"
                value={formData.equipe}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ex: Desenvolvimento"
              />
            </div>
          </div>   

          <div className="form-group">
            <label htmlFor="data">Data</label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleDateChange}
              required
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Gerar URL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TermoCompromisso; 