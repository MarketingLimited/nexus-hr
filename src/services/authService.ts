import httpClient from '@/lib/httpClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await httpClient.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await httpClient.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};
