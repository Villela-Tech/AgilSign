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
  patrimonio: string;
  responsavelId: string;
  data: string;
}

const initialFormData: FormData = {
  nome: '',
  sobrenome: '',
  email: 'no-email@example.com',
  equipamento: '',
  equipe: '',
  numeroSerie: '',
  patrimonio: '',
  responsavelId: '',
  data: '',
};

interface Props {
  onComplete?: () => void;
  onUrlGenerated?: (url: string, id?: number) => void;
}

const TermoCompromisso: React.FC<Props> = ({ onComplete, onUrlGenerated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPatrimonio, setShowPatrimonio] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Extrair apenas os campos realmente necessários
      const formValues = { 
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        equipamento: formData.equipamento,
        numeroSerie: formData.numeroSerie,
        patrimonio: formData.patrimonio,
        responsavelId: formData.responsavelId,
        status: 'pendente' as const
      };
      
      // Log detalhado para verificar os dados enviados
      console.log("************ DADOS DO TERMO ************");
      console.log("Nome:", formValues.nome);
      console.log("Sobrenome:", formValues.sobrenome);
      console.log("Email:", formValues.email);
      console.log("Equipamento:", formValues.equipamento);
      console.log("Número de Série:", formValues.numeroSerie);
      console.log("Patrimônio:", formValues.patrimonio);
      console.log("Responsável ID:", formValues.responsavelId);
      console.log("Status:", formValues.status);
      console.log("*****************************************");
      
      const response = await TermoService.criar(formValues);
      console.log("Resposta do servidor:", response);
      
      if (response && response.id) {
        setSuccess("Termo de compromisso criado com sucesso!");
        
        // Sinalizar que a lista de termos deve ser atualizada
        localStorage.setItem('termos_updated', 'true');
        
        // Garantir que a modal seja exibida imediatamente após criar o termo
        if (onUrlGenerated && response.urlAcesso) {
          console.log("Chamando onUrlGenerated com URL:", response.urlAcesso, "ID:", response.id);
          onUrlGenerated(response.urlAcesso, response.id);
        }
        
        if (onComplete) {
          onComplete();
        }
        
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao criar termo:", error);
      setError("Ocorreu um erro ao criar o termo de compromisso. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
    setSuccess(null);
    setShowPatrimonio(false);
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

        {success && (
          <div className="success-message">
            {success}
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

          <div className="form-group patrimonio-container">
            <div className="patrimonio-header">
              <button 
                type="button" 
                className="add-patrimonio-btn"
                onClick={() => setShowPatrimonio(!showPatrimonio)}
                disabled={loading}
              >
                {showPatrimonio ? '−' : '+'}
              </button>
              <label htmlFor="patrimonio">Patrimônio (opcional)</label>
            </div>
            {showPatrimonio && (
              <input
                type="text"
                id="patrimonio"
                name="patrimonio"
                value={formData.patrimonio}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ex: PAT12345"
                className="patrimonio-input"
              />
            )}
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