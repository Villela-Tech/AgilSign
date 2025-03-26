import axios from 'axios';

export const API_URL = 'https://apiagilsign.villelatech.com.br';

// URL base do frontend
export const FRONTEND_URL = 'http://ville5113.c44.integrator.host';

const config = {
  baseURL: `${API_URL}/api`,
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

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  try {
    // Verifica se a URL atual é uma rota pública
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    console.log('URL atual:', config.url);
    console.log('É rota pública?', isPublicRoute);
    
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Token adicionado ao cabeçalho:', token);
      } else {
        console.log('Token não encontrado no localStorage');
      }
    } else {
      console.log('Rota pública, não adicionando token');
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
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.log('Erro na resposta - Detalhes:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Apenas propaga o erro para ser tratado pelo componente
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
  numeroSerie?: string;
  patrimonio?: string;
  status: 'pendente' | 'assinado';
  assinatura?: string;
  urlAcesso: string;
  dataCriacao: string;
  dataAtualizacao: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TermoCompromisso {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  numeroSerie?: string;
  patrimonio?: string;
  status: 'pendente' | 'assinado';
  assinatura?: string;
  urlAcesso: string;
  dataCriacao: string;
  dataAtualizacao: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CriarTermoDTO {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  numeroSerie: string;
  patrimonio: string;
  responsavelId: string;
  status: 'pendente';
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
    const response = await api.get<TermoCompromisso[]>('/termos');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<any> => {
    const response = await api.get<any>(`/termos/${id}`);
    return response.data;
  },

  criar: async (termo: any): Promise<any> => {
    const response = await api.post<any>('/termos', termo);
    return response.data;
  },

  atualizar: async (id: string | number, termo: any): Promise<any> => {
    const response = await api.put<any>(`/termos/${id}`, termo);
    return response.data;
  },

  assinar: async (id: number): Promise<TermoCompromisso> => {
    const response = await api.post<TermoCompromisso>(`/termos/${id}/assinar`);
    return response.data;
  },

  cancelar: async (id: number): Promise<TermoCompromisso> => {
    const response = await api.post<TermoCompromisso>(`/termos/${id}/cancelar`);
    return response.data;
  },

  // Buscar termo por URL de acesso
  buscarPorUrl: async (urlAcesso: string): Promise<TermoDetalhes> => {
    console.log('[API] buscarPorUrl - Iniciando com urlAcesso:', urlAcesso);
    try {
      const response = await api.get<TermoDetalhes>(`/termos/acesso/${urlAcesso}`);
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
      const response = await api.post<TermoDetalhes>(`/termos/assinar/${urlAcesso}`, {
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
    await api.delete(`/termos/${id}`);
  },

  // Gerar URL de acesso para assinatura
  gerarUrlAcesso(urlAcesso: string): string {
    return `${API_URL}/termos/assinar/${urlAcesso}`;
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    console.log('[API] downloadPDF - Iniciando download para ID:', id);
    try {
      const response = await api.get<ArrayBuffer>(`/termos/${id}/pdf`, {
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
    return `${API_URL}/termos/visualizar/${id}`;
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
    const response = await api.get<Usuario[]>('/users');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Usuario> => {
    const response = await api.get<Usuario>(`/users/${id}`);
    return response.data;
  },

  criar: async (usuario: { name: string; email: string; password: string; role: string }): Promise<Usuario> => {
    const response = await api.post<Usuario>('/users', usuario);
    return response.data;
  },

  atualizar: async (id: number, dados: { name?: string; email?: string; password?: string; role?: string }): Promise<Usuario> => {
    const response = await api.put<Usuario>(`/users/${id}`, dados);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

export default api;