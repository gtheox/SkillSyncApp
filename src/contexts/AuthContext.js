import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { usuarioApi } from '../api/usuarioApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const [storedToken, storedUser, tempUser] = await Promise.all([
        AsyncStorage.getItem('@skillsync:token'),
        AsyncStorage.getItem('@skillsync:user'),
        AsyncStorage.getItem('@skillsync:user_temp'),
      ]);

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Se tiver nome temporário e não tiver nome válido no usuário salvo, usar o temporário
          if (tempUser && (!parsedUser.nome || parsedUser.nome === parsedUser.email?.split('@')[0])) {
            try {
              const parsedTempUser = JSON.parse(tempUser);
              if (parsedTempUser.email === parsedUser.email?.toLowerCase().trim()) {
                parsedUser.nome = parsedTempUser.nome;
                await AsyncStorage.setItem('@skillsync:user', JSON.stringify(parsedUser));
                await AsyncStorage.removeItem('@skillsync:user_temp');
              }
            } catch (e) {
              console.error('Error parsing temp user in loadStorageData:', e);
            }
          }
          
          // Tentar buscar nome salvo por email se não tiver nome válido
          if (!parsedUser.nome || parsedUser.nome === parsedUser.email?.split('@')[0]) {
            const normalizedEmail = parsedUser.email?.toLowerCase().trim();
            if (normalizedEmail) {
              const savedNome = await AsyncStorage.getItem(`@skillsync:nome:${normalizedEmail}`);
              if (savedNome) {
                parsedUser.nome = savedNome;
                await AsyncStorage.setItem('@skillsync:user', JSON.stringify(parsedUser));
              }
            }
          }
          
          // Se ainda não tiver nome válido, extrair do email
          if (!parsedUser.nome || parsedUser.nome === parsedUser.email?.split('@')[0]) {
            const emailParts = parsedUser.email?.split('@')[0] || 'Usuario';
            parsedUser.nome = emailParts
              .split(/[._-]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            await AsyncStorage.setItem('@skillsync:user', JSON.stringify(parsedUser));
          }
          
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await authApi.login(email, senha);
      // A API pode retornar Token, Email, Role, IdUsuario (PascalCase) ou camelCase
      const authToken = response.token || response.Token;
      const userEmail = response.email || response.Email;
      const role = response.role || response.Role;
      const idUsuario = response.idUsuario || response.IdUsuario;
      const nome = response.nome || response.Nome;

      const normalizedEmail = userEmail.toLowerCase().trim();

      // Buscar nome do usuário - prioridade:
      // 1. Nome salvo por email no AsyncStorage (mais confiável)
      // 2. Nome do registro temporário (salvo durante registro)
      // 3. Nome do usuário armazenado anteriormente (mesmo email)
      // 4. Nome da resposta da API (se existir - mas a API não retorna)
      // 5. Extrair do email
      let userName = null;
      
      // PRIMEIRO: Tentar buscar nome salvo por email (mais confiável)
      const savedNome = await AsyncStorage.getItem(`@skillsync:nome:${normalizedEmail}`);
      if (savedNome && savedNome.trim()) {
        userName = savedNome.trim();
      }
      
      // SEGUNDO: Tentar buscar do registro temporário (nome salvo durante registro)
      if (!userName) {
        const tempUser = await AsyncStorage.getItem('@skillsync:user_temp');
        if (tempUser) {
          try {
            const parsedTempUser = JSON.parse(tempUser);
            if (parsedTempUser.email === normalizedEmail && parsedTempUser.nome) {
              userName = parsedTempUser.nome.trim();
            }
          } catch (e) {
            console.error('Error parsing temp user:', e);
          }
        }
      }
      
      // TERCEIRO: Tentar do usuário armazenado anteriormente
      if (!userName) {
        const storedUser = await AsyncStorage.getItem('@skillsync:user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.email?.toLowerCase().trim() === normalizedEmail && parsedUser.nome) {
              userName = parsedUser.nome.trim();
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
      }
      
      // QUARTO: Tentar nome da resposta da API (se existir)
      if (!userName && nome && nome.trim()) {
        userName = nome.trim();
      }
      
      // QUINTO: Se ainda não tiver nome, extrair do email de forma mais inteligente
      if (!userName || userName.trim().length === 0 || userName === normalizedEmail.split('@')[0]) {
        const emailParts = normalizedEmail.split('@')[0];
        // Converter "joao.silva" para "Joao Silva" ou "joaosilva" para "Joaosilva"
        const extractedName = emailParts
          .split(/[._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        // Usar o nome extraído se não tivermos um nome melhor
        if (!userName || userName === emailParts || userName.length < 3) {
          userName = extractedName;
        }
      }

      // Verificar se temos dados válidos da API
      if (!authToken || !userEmail || !role || idUsuario === undefined || idUsuario === null) {
        console.error('Resposta da API inválida:', response);
        throw new Error('Resposta da API inválida: dados faltando');
      }

      // Salvar nome por email para futuras referências (sempre salvar)
      if (userName && userName.trim()) {
        await AsyncStorage.setItem(`@skillsync:nome:${normalizedEmail}`, userName.trim());
      }

      // Buscar nome do usuário da API se disponível
      let nomeFinal = userName?.trim() || null;
      try {
        const usuarioInfo = await usuarioApi.getById(idUsuario);
        if (usuarioInfo && (usuarioInfo.nome || usuarioInfo.Nome)) {
          nomeFinal = usuarioInfo.nome || usuarioInfo.Nome;
          // Salvar nome para uso futuro
          await AsyncStorage.setItem(`@skillsync:nome:${normalizedEmail}`, nomeFinal);
        }
      } catch (error) {
        // Se não conseguir buscar da API, usar o nome já encontrado
        console.log('Não foi possível buscar nome da API, usando nome local:', error);
      }
      
      // Salvar token e usuário
      await AsyncStorage.setItem('@skillsync:token', authToken);
      const userData = {
        idUsuario,
        email: userEmail,
        nome: nomeFinal || userEmail.split('@')[0], // Fallback para parte do email
        role,
      };
      await AsyncStorage.setItem('@skillsync:user', JSON.stringify(userData));

      // Limpar dados temporários após salvar
      try {
        await AsyncStorage.removeItem('@skillsync:user_temp');
      } catch (e) {
        // Ignorar erro
      }

      setToken(authToken);
      setUser(userData);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (nome, email, senha, role) => {
    try {
      // IMPORTANTE: Salvar o nome ANTES de fazer o registro
      // Isso garante que o nome esteja disponível durante o login
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedNome = nome.trim();
      
      // Salvar nome por email para sempre ter acesso
      await AsyncStorage.setItem(`@skillsync:nome:${normalizedEmail}`, normalizedNome);
      
      // Também salvar em tempUserData para uso imediato
      const tempUserData = {
        nome: normalizedNome,
        email: normalizedEmail,
        role: role.toUpperCase(),
      };
      await AsyncStorage.setItem('@skillsync:user_temp', JSON.stringify(tempUserData));
      
      const response = await authApi.register(nome, email, senha, role);
      
      // Após registro, fazer login automaticamente
      // O nome será recuperado do tempUserData ou do AsyncStorage durante o login
      await login(email, senha);
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      // Não limpar nome salvo por email em caso de erro - pode ser útil para tentativas futuras
      await AsyncStorage.removeItem('@skillsync:user_temp').catch(() => {});
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@skillsync:token');
      await AsyncStorage.removeItem('@skillsync:user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
