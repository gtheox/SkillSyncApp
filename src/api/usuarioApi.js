import apiService from './apiService';

export const usuarioApi = {
  // Buscar informações do usuário por ID
  getById: async (id) => {
    const response = await apiService.get(`/usuarios/${id}`);
    return response.data;
  },
  
  // Listar todos os usuários (apenas para admin)
  getAll: async () => {
    const response = await apiService.get('/usuarios');
    return response.data;
  },
};
