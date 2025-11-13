import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar a URL da API
// Em produção: usar a URL do Render
// Em desenvolvimento: usar o IP local da máquina
const API_BASE_URL = __DEV__
  ? 'https://skillsync-api-t4l2.onrender.com/api/v1' // URL de produção (mesma para dev também)
  : 'https://skillsync-api-t4l2.onrender.com/api/v1';

// Criar instância do axios
const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 segundos
});

// Interceptor de requisição para adicionar token
apiService.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@skillsync:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem('@skillsync:token');
      await AsyncStorage.removeItem('@skillsync:user');
    }
    return Promise.reject(error);
  }
);

export default apiService;
