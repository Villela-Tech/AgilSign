import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { generateTermoRecebimento } from './pdfService';

export const API_URL = 'https://apiagilsign.villelatech.com.br';

// URL base do frontend
export const FRONTEND_URL = 'https://ville5113.c44.integrator.host';

const config = {
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const api = axios.create(config);

// Lista de rotas públicas (incluindo o prefixo /api)
const publicRoutes = [
  '/api/termos/acesso/',
  '/api/termos/assinar/'
];

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Adicionar timestamp para evitar cache
    config.params = {
      ...(config.params || {}),
      _t: new Date().getTime()
    };
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Se receber unauthorized, limpar token e redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface TermoData {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  equipe: string;
  data: string;
  urlAcesso?: string;
  assinatura?: string;
  patrimonio?: string;
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
  created_at: string;
  updated_at: string;
  patrimonio?: string;
  numeroSerie?: string;
  responsavelId?: number;
  responsavelNome?: string;
}

export interface TermoCompromisso {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  equipe?: string;
  numeroSerie?: string;
  data?: string;
  status: 'pendente' | 'assinado' | 'cancelado';
  urlAcesso?: string;
  urlDocumento?: string;
  created_at: string;
  updated_at: string;
  patrimonio?: string;
  responsavelId?: number;
  responsavelNome?: string;
}

export interface CriarTermoDTO {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  equipe: string;
  numeroSerie: string;
  data: string;
  status: 'pendente';
  patrimonio?: string;
  responsavelId?: number;
}

export interface AtualizarStatusDTO {
  status: 'assinado';
  assinatura: string;
}

interface ApiResponse {
  message: string;
  termo: TermoDetalhes;
}

export const TermoService = {
  listar: async (): Promise<TermoCompromisso[]> => {
    const response = await api.get<TermoCompromisso[]>('/api/termos');
    return response.data;
  },

  listarPorResponsavel: async (responsavelId: number): Promise<TermoCompromisso[]> => {
    const response = await api.get<TermoCompromisso[]>(`/api/termos/responsavel/${responsavelId}`);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<any> => {
    const response = await api.get<any>(`/api/termos/${id}`);
    return response.data;
  },

  criar: async (termo: any): Promise<any> => {
    const response = await api.post<any>('/api/termos', termo);
    return response.data;
  },

  atualizar: async (id: number, termo: any): Promise<any> => {
    const response = await api.put<any>(`/api/termos/${id}`, termo);
    return response.data;
  },

  assinar: async (id: number): Promise<TermoCompromisso> => {
    const response = await api.post<TermoCompromisso>(`/api/termos/${id}/assinar`);
    return response.data;
  },

  cancelar: async (id: number): Promise<TermoCompromisso> => {
    const response = await api.post<TermoCompromisso>(`/api/termos/${id}/cancelar`);
    return response.data;
  },

  // Buscar termo por URL de acesso
  buscarPorUrl: async (urlAcesso: string): Promise<TermoDetalhes> => {
    console.log('[API] buscarPorUrl - Iniciando com urlAcesso:', urlAcesso);
    try {
      const response = await api.get<TermoDetalhes>(`/api/termos/acesso/${urlAcesso}`);
      console.log('[API] buscarPorUrl - Resposta:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] buscarPorUrl - Erro:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Atualizar status do termo
  atualizarStatus: async (urlAcesso: string, data: AtualizarStatusDTO): Promise<TermoDetalhes> => {
    console.log('[API] atualizarStatus - Iniciando com urlAcesso:', urlAcesso);
    console.log('[API] atualizarStatus - Dados:', data);
    try {
      const response = await api.post<TermoDetalhes>(`/api/termos/assinar/${urlAcesso}`, {
        assinatura: data.assinatura
      });
      console.log('[API] atualizarStatus - Resposta:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] atualizarStatus - Erro:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Excluir termo
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/api/termos/${id}`);
  },

  // Gerar URL de acesso para assinatura
  gerarUrlAcesso(urlAcesso: string): string {
    return `${API_URL}/api/termos/assinar/${urlAcesso}`;
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    console.log('[API] downloadPDF - Iniciando download para ID:', id);
    try {
      const response = await api.get<ArrayBuffer>(`/api/termos/${id}/pdf`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      console.log('[API] downloadPDF - PDF recebido com sucesso');
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('[API] downloadPDF - Erro:', error);
      throw error;
    }
  },

  gerarLinkAssinatura: (urlAcesso: string): string => {
    // Usar o domínio atual do frontend
    const baseUrl = window.location.origin;
    console.log('[API] gerarLinkAssinatura - baseUrl:', baseUrl);
    console.log('[API] gerarLinkAssinatura - urlAcesso:', urlAcesso);
    return `${baseUrl}/assinar/${urlAcesso}`;
  },

  gerarLinkVisualizacao: (id: string): string => {
    return `${API_URL}/api/termos/visualizar/${id}`;
  }
};

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const UserService = {
  listar: async (): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>('/api/users');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Usuario> => {
    const response = await api.get<Usuario>(`/api/users/${id}`);
    return response.data;
  },

  criar: async (usuario: { name: string; email: string; password: string; role: string }): Promise<Usuario> => {
    const response = await api.post<Usuario>('/api/users', usuario);
    return response.data;
  },

  atualizar: async (id: number, dados: { name?: string; email?: string; password?: string; role?: string }): Promise<Usuario> => {
    const response = await api.put<Usuario>(`/api/users/${id}`, dados);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  }
};

export default api;