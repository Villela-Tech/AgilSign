import api from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  },

  async register(name: string, email: string, password: string, role: string = 'user'): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/auth/register', {
        name,
        email,
        password,
        role
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao registrar usuário');
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      // Limpar dados do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      
      // Limpar outros dados de sessão se necessário
      localStorage.removeItem('termos_updated');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }
}; 