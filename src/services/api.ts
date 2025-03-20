import axios from 'axios';
import https from 'https';

export const API_URL = 'https://apiagilsign.villelatech.com.br';

// URL base do frontend
export const FRONTEND_URL = 'https://ville5113.c44.integrator.host';

const config = {
  baseURL: `${API_URL}/api`,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Permite certificados SSL auto-assinados
  })
};

export const api = axios.create(config);

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token adicionado ao cabeçalho:', token);
    } else {
      console.log('Token não encontrado no localStorage');
    }
    console.log('Configuração da requisição:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  } catch (error) {
    console.error('Erro ao processar token:', error);
    return config;
  }
}, (error) => {
  console.error('Erro no interceptor de requisição:', error);
  return Promise.reject(error);
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    if (error.response?.status === 401) {
      console.log('Token inválido ou expirado, redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
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
  status: 'pendente';
}

export interface AtualizarStatusDTO {
  status: 'assinado';
  assinatura: string;
}

export const TermoService = {
  // Criar novo termo
  criar: async (data: CriarTermoDTO): Promise<TermoDetalhes> => {
    try {
      console.log('Enviando dados para criar termo:', data);
      console.log('URL da requisição:', `${API_URL}/api/termos`);
      
      const response = await api.post<TermoDetalhes>('/termos', data);
      
      console.log('Resposta completa do servidor:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      if (!response.data) {
        throw new Error('Resposta do servidor não contém dados');
      }

      if (!response.data.id) {
        throw new Error('Resposta do servidor não contém ID');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado ao criar termo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      if (error.response?.status === 404) {
        throw new Error('Endpoint não encontrado. Verifique a URL da API.');
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Erro ao criar termo. Por favor, tente novamente.');
    }
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
    return `${API_URL}/api/assinar/${id}`;
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
    return `${API_URL}/api/assinar/${id}`;
  },

  gerarLinkVisualizacao: (id: string): string => {
    return `${API_URL}/api/visualizar/${id}`;
  }
};

export default api; 