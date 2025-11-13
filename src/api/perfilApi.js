import apiService from './apiService';

export const perfilApi = {
  // Listar perfis
  getAll: async () => {
    const response = await apiService.get('/perfis');
    return response.data;
  },

  // Buscar perfil por ID
  getById: async (id) => {
    const response = await apiService.get(`/perfis/${id}`);
    return response.data;
  },

  // Criar perfil
  create: async (data) => {
    const response = await apiService.post('/perfis', data);
    return response.data;
  },

  // Atualizar perfil
  update: async (id, data) => {
    const response = await apiService.put(`/perfis/${id}`, data);
    return response.data;
  },

  // Deletar perfil
  delete: async (id) => {
    const response = await apiService.delete(`/perfis/${id}`);
    return response.data;
  },
};
