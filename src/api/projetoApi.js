import apiService from './apiService';

export const projetoApi = {
  // Listar projetos
  getAll: async (pageNumber = 1, pageSize = 10) => {
    const response = await apiService.get('/projetos', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },

  // Buscar projeto por ID
  getById: async (id) => {
    const response = await apiService.get(`/projetos/${id}`);
    return response.data;
  },

  // Criar projeto
  create: async (data) => {
    const response = await apiService.post('/projetos', data);
    return response.data;
  },

  // Atualizar projeto
  update: async (id, data) => {
    const response = await apiService.put(`/projetos/${id}`, data);
    return response.data;
  },

  // Deletar projeto
  delete: async (id) => {
    const response = await apiService.delete(`/projetos/${id}`);
    return response.data;
  },

  // Gerar matches
  gerarMatches: async (projetoId) => {
    const response = await apiService.post(`/projetos/${projetoId}/gerar-matches`);
    return response.data;
  },
};
