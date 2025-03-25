import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TermoService } from '../../services/api';
import '../TermoCompromisso/TermoCompromisso.css';
import './EditarTermo.css';
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
  patrimonio?: string;
}

const initialFormData: FormData = {
  nome: '',
  sobrenome: '',
  email: 'no-email@example.com',
  equipamento: '',
  equipe: '',
  numeroSerie: '',
  patrimonio: ''
};

const EditarTermo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPatrimonio, setShowPatrimonio] = useState(false);
  
  // Carregar dados do termo ao iniciar
  useEffect(() => {
    console.log("EditarTermo - Componente montado");
    console.log("EditarTermo - ID recebido:", id);
    
    const carregarTermo = async () => {
      if (!id) {
        console.error("EditarTermo - ID não informado");
        setError("ID do termo não informado");
        setLoading(false);
        return;
      }
      
      try {
        console.log("EditarTermo - Buscando termo com ID:", id);
        const termo = await TermoService.buscarPorId(Number(id));
        console.log("EditarTermo - Termo encontrado:", termo);
        
        if (!termo) {
          console.error("EditarTermo - Termo não encontrado");
          setError("Termo não encontrado");
          setLoading(false);
          return;
        }
        
        // Verificar se o termo está pendente
        if (termo.status !== 'pendente') {
          setError("Não é possível editar um termo que já foi assinado");
          setLoading(false);
          return;
        }
        
        // Preencher o formulário com os dados do termo
        setFormData({
          nome: termo.nome || '',
          sobrenome: termo.sobrenome || '',
          email: termo.email || '',
          equipamento: termo.equipamento || '',
          equipe: termo.equipe || '',
          numeroSerie: termo.numeroSerie || '',
          patrimonio: termo.patrimonio || ''
        });
        
        // Mostrar campo de patrimônio se estiver preenchido
        if (termo.patrimonio) {
          setShowPatrimonio(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar termo:", error);
        setError("Erro ao carregar dados do termo. Por favor, tente novamente.");
        setLoading(false);
      }
    };
    
    carregarTermo();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setSaving(true);
    try {
      const formValues = { 
        ...formData,
        status: 'pendente' as const
      };
      
      if (!id) {
        throw new Error("ID do termo não informado");
      }
      
      console.log("Enviando dados para atualização do termo:", formValues);
      const response = await TermoService.atualizar(Number(id), formValues);
      console.log("Resposta do servidor:", response);
      
      if (response) {
        setSuccess("Termo de compromisso atualizado com sucesso!");
        
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          navigate(`/visualizar/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao atualizar termo:", error);
      setError("Ocorreu um erro ao atualizar o termo de compromisso. Por favor, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate(`/visualizar/${id}`);
  };

  const togglePatrimonio = () => {
    setShowPatrimonio(!showPatrimonio);
    if (!showPatrimonio) {
      // Focar no campo de patrimônio quando ele for exibido
      setTimeout(() => {
        const patrimonioInput = document.getElementById("patrimonio");
        if (patrimonioInput) {
          patrimonioInput.focus();
        }
      }, 100);
    } else {
      // Limpar o valor quando esconder o campo
      setFormData(prev => ({
        ...prev,
        patrimonio: ''
      }));
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="termo-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Sidebar />
        <div className="termo-form loading-state">
          <Lottie
            animationData={loadingAnimation}
            style={{ width: 150, height: 150 }}
          />
          <p>Carregando dados do termo...</p>
        </div>
      </motion.div>
    );
  }

  if (error && !formData.nome) {
    return (
      <motion.div 
        className="termo-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Sidebar />
        <div className="termo-form error-state">
          <div className="error-message">
            {error}
          </div>
          <button className="form-button" onClick={() => navigate('/dashboard')}>
            Voltar para Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="termo-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <Sidebar />
      <div className="termo-form">
        <div className="form-header">
          <h2 className="termo-title">EDITAR TERMO DE COMPROMISSO</h2>
        </div>

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
          <h3 className="section-title">DADOS PESSOAIS</h3>

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
                disabled={saving}
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
                disabled={saving}
                placeholder="Digite seu sobrenome"
              />
            </div>
          </div>

          <h3 className="section-title">DADOS DO EQUIPAMENTO</h3>

          <div className="form-group">
            <label htmlFor="equipamento">Equipamento</label>
            <input
              type="text"
              id="equipamento"
              name="equipamento"
              value={formData.equipamento}
              onChange={handleChange}
              required
              disabled={saving}
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
                disabled={saving}
                placeholder="Ex: SN123456"
              />
            </div>
            <div className="form-group">
              <label htmlFor="equipe">Equipe ou Departamento</label>
              <input
                type="text"
                id="equipe"
                name="equipe"
                value={formData.equipe}
                onChange={handleChange}
                disabled={saving}
                placeholder="Ex: TI"
              />
            </div>
          </div>

          <div className="form-group patrimonio-group">
            <div className="patrimonio-label-container">
              <label>Patrimônio (opcional)</label>
              <button 
                type="button" 
                className={`toggle-patrimonio ${showPatrimonio ? 'active' : ''}`}
                onClick={togglePatrimonio}
                disabled={saving}
                aria-label={showPatrimonio ? 'Ocultar campo de patrimônio' : 'Mostrar campo de patrimônio'}
              >
                {showPatrimonio ? '−' : '+'}
              </button>
            </div>
            
            {showPatrimonio && (
              <div className="patrimonio-input-container">
                <input
                  type="text"
                  id="patrimonio"
                  name="patrimonio"
                  value={formData.patrimonio || ''}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Ex: PAT123456"
                  className="patrimonio-input"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="form-button primary"
              disabled={saving}
            >
              {saving ? (
                <Lottie
                  animationData={loadingAnimation}
                  style={{ width: 30, height: 30 }}
                />
              ) : (
                "Salvar Alterações"
              )}
            </button>
            <button 
              type="button" 
              className="form-button secondary"
              onClick={handleVoltar} 
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditarTermo; 