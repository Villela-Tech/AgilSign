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
  email: '',
  equipamento: '',
  equipe: '',
  numeroSerie: '',
  data: ''
};

const TermoCompromisso: React.FC = () => {
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
    setError(null); // Limpa erro quando usuário começa a digitar
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
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email inválido');
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
      // Prepara os dados conforme a interface TermoData
      const termoData = {
        nome: formData.nome.trim(),
        sobrenome: formData.sobrenome.trim(),
        email: formData.email.trim(),
        equipamento: `${formData.equipamento.trim()} (S/N: ${formData.numeroSerie.trim()})`,
        equipe: formData.equipe.trim(),
        data: formData.data
      };

      console.log('Enviando dados:', termoData); // Log para debug

      const response = await TermoService.criar(termoData);
      
      console.log('Resposta do servidor:', response); // Log para debug

      if (response && response.id) {
        navigate(`/visualizar/${response.id}`);
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
      <img src="/images/logo.png" alt="Logo" className="logo" />

      <div className="termo-form">
        <h2 className="termo-title">Termo de Compromisso</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome *</label>
              <input
                type="text"
                id="sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="equipamento">Equipamento *</label>
            <input
              type="text"
              id="equipamento"
              name="equipamento"
              value={formData.equipamento}
              onChange={handleChange}
              required
              disabled={loading}
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroSerie">Nº Série *</label>
            <input
              type="text"
              id="numeroSerie"
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="data">Data *</label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Gerando URL...' : 'Gerar URL'}
          </button>
        </form>
      </div>

      <p className="copyright">© Desenvolvido por Villela Tech</p>
    </div>
  );
};

export default TermoCompromisso; 