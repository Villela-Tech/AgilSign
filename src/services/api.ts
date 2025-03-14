import axios from 'axios';

// URL base da API
export const API_URL = 'http://localhost:3001/api';
// URL base do frontend
export const FRONTEND_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token encontrado:', token);
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('Headers após adicionar token:', config.headers);
  }
  return config;
}, (error) => {
  console.error('Erro no interceptor:', error);
  return Promise.reject(error);
});

export interface TermoData {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  equipe: string;
  data: string;
  urlAcesso?: string;
  assinatura?: string;
}

export interface TermoResponse {
  id: string;
  urlAcesso: string;
}

export interface TermoDetalhes {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  status: 'pendente' | 'assinado';
  dataCriacao: string;
  urlAcesso: string;
  assinatura?: string;
}

export interface CriarTermoDTO {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
}

export interface AtualizarStatusDTO {
  status: 'assinado';
  assinatura: string;
}

export const TermoService = {
  // Criar novo termo
  criar: async (data: CriarTermoDTO): Promise<TermoDetalhes> => {
    const response = await api.post<TermoDetalhes>('/termos', data);
    return response.data;
  },

  // Buscar termo por ID
  buscarPorId: async (id: string): Promise<TermoDetalhes> => {
    const response = await api.get<TermoDetalhes>(`/termos/${id}`);
    return response.data;
  },

  // Listar todos os termos
  listar: async (): Promise<TermoDetalhes[]> => {
    const response = await api.get<TermoDetalhes[]>('/termos');
    return response.data;
  },

  // Atualizar status do termo
  atualizarStatus: async (id: string, data: AtualizarStatusDTO): Promise<TermoDetalhes> => {
    const response = await api.patch<TermoDetalhes>(`/termos/${id}/status`, data);
    return response.data;
  },

  // Excluir termo
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/termos/${id}`);
  },

  // Gerar URL de acesso para assinatura
  gerarUrlAcesso(id: string): string {
    return `${FRONTEND_URL}/assinar/${id}`;
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/termos/${id}/pdf`, {
        responseType: 'arraybuffer'
      });

      return new Blob([response.data as ArrayBuffer], { type: 'application/pdf' });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      throw error;
    }
  },

  gerarLinkAssinatura: (id: string): string => {
    return `${FRONTEND_URL}/assinar/${id}`;
  },

  gerarLinkVisualizacao: (id: string): string => {
    return `${FRONTEND_URL}/visualizar/${id}`;
  }
};

export default api; 