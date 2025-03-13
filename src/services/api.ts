import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

export interface TermoData {
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  assinatura: string;
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
  status: string;
  dataCriacao: string;
  urlAcesso: string;
  assinatura: string;
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
  async atualizarStatus(id: string, status: 'pendente' | 'assinado'): Promise<TermoDetalhes> {
    const response = await api.patch<TermoDetalhes>(`/termos/${id}/status`, { status });
    return response.data;
  }
}; 