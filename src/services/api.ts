import axios from 'axios';

// URL base da API
export const API_URL = 'http://localhost:3001/api';
// URL base do frontend
export const FRONTEND_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL
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

  // Gerar URL de acesso para assinatura
  gerarUrlAcesso(id: string): string {
    return `${FRONTEND_URL}/assinar/${id}`;
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/termos/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf'
      }
    });
    const blobData = response.data as ArrayBuffer;
    return new Blob([blobData], { type: 'application/pdf' });
  },

  gerarLinkAssinatura: (id: string): string => {
    return `${FRONTEND_URL}/assinar/${id}`;
  },

  gerarLinkVisualizacao: (id: string): string => {
    return `${FRONTEND_URL}/visualizar/${id}`;
  }
};

export default api; 