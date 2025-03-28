import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TermoService, UserService, Usuario } from '../../services/api';
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
  responsavelId?: number;
}

const initialFormData: FormData = {
  nome: '',
  sobrenome: '',
  email: 'no-email@example.com',
  equipamento: '',
  equipe: '',
  numeroSerie: '',
  patrimonio: '',
  responsavelId: undefined
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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Carregar usuários e termo ao iniciar
  useEffect(() => {
    console.log("EditarTermo - Componente montado");
    console.log("EditarTermo - ID recebido:", id);
    
    const carregarDados = async () => {
      if (!id) {
        console.error("EditarTermo - ID não informado");
        setError("ID do termo não informado");
        setLoading(false);
        return;
      }
      
      try {
        // Carregar usuários
        setLoadingUsuarios(true);
        const usuariosData = await UserService.listar();
        setUsuarios(usuariosData);
        setLoadingUsuarios(false);
        
        // Carregar termo
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
          patrimonio: termo.patrimonio || '',
        });
        
        // Mostrar campo de patrimônio se estiver preenchido
        if (termo.patrimonio) {
          setShowPatrimonio(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados. Por favor, tente novamente.");
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // Verificar se numeroSerie está preenchido
      if (!formData.numeroSerie.trim()) {
        setError('Número de série é obrigatório');
        setSaving(false);
        return;
      }
      
      const formValues = { 
        ...formData,
        // Garantir que o numeroSerie seja enviado com trim
        numeroSerie: formData.numeroSerie.trim(),
        // Incluir patrimônio apenas se estiver preenchido
        patrimonio: showPatrimonio && formData.patrimonio?.trim() ? formData.patrimonio.trim() : undefined,
        status: 'pendente' as const
      };
      
      if (!id) {
        throw new Error("ID do termo não informado");
      }
      
      // Log detalhado para debug
      console.log("Enviando dados para atualização do termo:", JSON.stringify(formValues, null, 2));
      
      const response = await TermoService.atualizar(Number(id), formValues);
      console.log("Resposta do servidor:", JSON.stringify(response, null, 2));
      
      if (response) {
        setSuccess("Termo de compromisso atualizado com sucesso!");
        
        // Redirecionar para a tela de login após um breve delay
        setTimeout(() => {
          navigate('/login');
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
                disabled={saving}
                placeholder="Ex: Desenvolvimento"
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
              type="button" 
              className="cancel-button"
              onClick={handleVoltar}
              disabled={saving}
            >
              Cancelar
            </button>
            {saving ? (
              <div className="loading-container">
                <Lottie
                  animationData={loadingAnimation}
                  style={{ width: 30, height: 30 }}
                />
                <span>Salvando...</span>
              </div>
            ) : (
              <button 
                type="submit" 
                className="salvar-button"
                disabled={saving}
              >
                Salvar Alterações
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditarTermo; 