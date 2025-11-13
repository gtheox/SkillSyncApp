import apiService from './apiService';

export const habilidadeApi = {
  // Listar habilidades disponíveis
  getAll: async () => {
    const response = await apiService.get('/habilidades');
    return response.data;
  },
};

