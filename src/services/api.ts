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

export interface AtualizarStatusDTO {
  status: 'pendente' | 'assinado';
  assinatura?: string;
}

export const TermoService = {
  // Criar novo termo
  async criar(data: TermoData): Promise<TermoResponse> {
    const response = await api.post<TermoResponse>('/termos', data);
    return response.data;
  },

  // Buscar termo por ID
  async buscarPorId(id: string): Promise<TermoDetalhes> {
    const response = await api.get<TermoDetalhes>(`/termos/${id}`);
    return response.data;
  },

  // Listar todos os termos
  async listar(): Promise<TermoDetalhes[]> {
    const response = await api.get<TermoDetalhes[]>('/termos');
    return response.data;
  },

  // Atualizar status do termo
  async atualizarStatus(id: string, data: AtualizarStatusDTO): Promise<TermoDetalhes> {
    const response = await api.patch<TermoDetalhes>(`/termos/${id}/status`, data);
    return response.data;
  },

  // Gerar URL de acesso para assinatura
  gerarUrlAcesso(id: string): string {
    return `${FRONTEND_URL}/assinar/${id}`;
  }
};

export default api; 