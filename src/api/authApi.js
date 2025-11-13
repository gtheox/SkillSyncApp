import apiService from './apiService';

export const authApi = {
  // Login
  login: async (email, senha) => {
    const response = await apiService.post('/auth/login', { email, senha });
    return response.data;
  },

  // Register
  register: async (nome, email, senha, role) => {
    const response = await apiService.post('/auth/register', {
      nome,
      email,
      senha,
      role,
    });
    return response.data;
  },
};
