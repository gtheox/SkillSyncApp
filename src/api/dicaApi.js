import apiService from './apiService';

export const dicaApi = {
  // Listar dicas
  getAll: async () => {
    const response = await apiService.get('/dicas');
    return response.data;
  },

  // Buscar dica por ID
  getById: async (id) => {
    const response = await apiService.get(`/dicas/${id}`);
    return response.data;
  },
};
