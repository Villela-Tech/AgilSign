import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TermoService } from '../services/api';
import { User } from '../types/User';
import { api } from '../services/api';
import './EditarTermo.css';

interface FormData {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  numeroSerie: string;
  patrimonio: string;
}

const EditarTermo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sobrenome: '',
    email: '',
    equipamento: '',
    numeroSerie: '',
    patrimonio: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPatrimonio, setShowPatrimonio] = useState<boolean>(false);
  const [termoOriginal, setTermoOriginal] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<User[]>('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    const fetchTermoData = async () => {
      try {
        setLoading(true);
        const data = await TermoService.buscarPorId(Number(id));
        
        if (data) {
          setTermoOriginal(data);
          
          // Mostrar campo de patrimônio se já existir
          if (data.patrimonio) {
            setShowPatrimonio(true);
          }
          
          setFormData({
            nome: data.nome || '',
            sobrenome: data.sobrenome || '',
            email: data.email || '',
            equipamento: data.equipamento || '',
            numeroSerie: data.numeroSerie || '',
            patrimonio: data.patrimonio || ''
          });
          
          // Verificar se o termo pode ser editado (apenas se estiver pendente)
          if (data.status !== 'pendente') {
            setError('Este termo não pode ser editado pois já foi assinado.');
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados do termo:', error);
        setError(error.response?.data?.message || 'Erro ao carregar o termo. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchTermoData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePatrimonio = () => {
    setShowPatrimonio(!showPatrimonio);
    if (showPatrimonio) {
      // Se estiver escondendo o campo, limpa o valor
      setFormData(prev => ({
        ...prev,
        patrimonio: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    // Verificação de campos obrigatórios
    if (!formData.nome || !formData.sobrenome || !formData.email || !formData.equipamento || !formData.numeroSerie) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      
      // Preparar dados para envio
      const termoData = {
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        equipamento: formData.equipamento,
        numeroSerie: formData.numeroSerie,
        patrimonio: showPatrimonio ? formData.patrimonio : undefined
      };
      
      // Enviar dados para a API
      await TermoService.atualizar(id!, termoData);
      
      setSuccessMessage('Termo atualizado com sucesso!');
      
      // Redirecionar após alguns segundos
      setTimeout(() => {
        navigate(`/termo/${id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao atualizar termo:', error);
      setError(error.response?.data?.message || 'Erro ao atualizar o termo. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  // Se estiver carregando, mostrar indicador
  if (loading) {
    return (
      <div className="termo-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando dados do termo...</p>
        </div>
      </div>
    );
  }

  // Se houver erro que impede edição
  if (error && termoOriginal?.status !== 'pendente') {
    return (
      <div className="termo-container">
        <div className="error-state">
          <h2>Não é possível editar este termo</h2>
          <p>{error}</p>
          <button 
            className="form-button secondary"
            onClick={() => navigate('/dashboard')}
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="termo-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="termo-form">
        <div className="form-header">
          <h1 className="termo-title">Editar Termo de Compromisso</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <h2 className="section-title">Dados Pessoais</h2>
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
            />
          </div>

          <h2 className="section-title">Dados do Equipamento</h2>
          <div className="form-group">
            <label htmlFor="equipamento">Nome do Equipamento *</label>
            <input
              type="text"
              id="equipamento"
              name="equipamento"
              value={formData.equipamento}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="numeroSerie">Número de Série *</label>
            <input
              type="text"
              id="numeroSerie"
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="patrimonio-label-container">
              <label htmlFor="patrimonio">
                Número de Patrimônio {showPatrimonio ? '' : '(opcional)'}
              </label>
              <button 
                type="button" 
                className={`toggle-patrimonio ${showPatrimonio ? 'active' : ''}`}
                onClick={togglePatrimonio}
                title={showPatrimonio ? "Remover campo" : "Adicionar campo"}
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
                  value={formData.patrimonio}
                  onChange={handleChange}
                  placeholder="Número de patrimônio"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="salvar-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading-spinner-small"></span>
                  <span style={{ marginLeft: '8px' }}>Salvando...</span>
                </>
              ) : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditarTermo; 