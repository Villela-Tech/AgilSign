import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TermoService, UserService, Usuario } from '../../services/api';
import './TermoCompromisso.css';
import Sidebar from '../Sidebar/Sidebar';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/Animations/loading.json';

interface FormData {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  equipe: string;
  numeroSerie: string;
  data: string;
  patrimonio?: string;
}

const initialFormData: FormData = {
  nome: '',
  sobrenome: '',
  email: 'no-email@example.com',
  equipamento: '',
  equipe: '',
  numeroSerie: '',
  data: new Date().toISOString().split('T')[0],
  patrimonio: ''
};

interface Props {
  onComplete?: () => void;
  onUrlGenerated?: (url: string, id: number) => void;
}

const TermoCompromisso: React.FC<Props> = ({ onComplete, onUrlGenerated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPatrimonio, setShowPatrimonio] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Carregar os usuários ao montar o componente
  useEffect(() => {
    const carregarUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const data = await UserService.listar();
        setUsuarios(data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        setError("Erro ao carregar lista de usuários. Por favor, recarregue a página.");
      } finally {
        setLoadingUsuarios(false);
      }
    };

    carregarUsuarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'responsavelId' ? (value ? parseInt(value) : undefined) : value
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
    if (!formData.equipe.trim()) {
      setError('Equipe é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Verificar se numeroSerie está preenchido
      if (!formData.numeroSerie.trim()) {
        setError('Número de série é obrigatório');
        setLoading(false);
        return;
      }

      // Preparar os dados do formulário com números de série e patrimônio
      const formValues = {
        ...formData,
        // Garantir que o numeroSerie seja enviado com trim
        numeroSerie: formData.numeroSerie.trim(),
        // Incluir patrimônio apenas se estiver preenchido
        patrimonio: showPatrimonio && formData.patrimonio?.trim() ? formData.patrimonio.trim() : undefined,
        status: 'pendente' as const
      };

      // Log detalhado para debug
      console.log("Enviando dados para criação do termo:", JSON.stringify(formValues, null, 2));

      const response = await TermoService.criar(formValues);
      console.log("Resposta do servidor:", JSON.stringify(response, null, 2));

      if (response && response.id) {
        setSuccess("Termo de compromisso criado com sucesso!");

        // Sinalizar que a lista de termos deve ser atualizada
        localStorage.setItem('termos_updated', 'true');

        // Garantir que a modal seja exibida imediatamente após criar o termo
        if (onUrlGenerated && response.urlAcesso) {
          console.log("Chamando onUrlGenerated com URL:", response.urlAcesso, "ID:", response.id);
          onUrlGenerated(response.urlAcesso, parseInt(response.id));
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
  };

  return (
    <div className="termo-container">
      <Sidebar />
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
                required
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
                value={formData.patrimonio || ''}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ex: PAT-123456"
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
              onChange={handleChange}
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
            {loading ? (
              <Lottie
                animationData={loadingAnimation}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              'Gerar URL'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TermoCompromisso;