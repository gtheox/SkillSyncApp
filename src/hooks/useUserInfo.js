import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usuarioApi } from '../api/usuarioApi';
import { useAuth } from '../contexts/AuthContext';

// Cache de informações de usuários (idUsuario -> {nome, email})
const userInfoCache = new Map();

/**
 * Hook para buscar informações do usuário (nome e email) pelo idUsuario
 * Usa o endpoint de usuários da API
 */
export const useUsersInfo = () => {
  const { user: currentUser } = useAuth();
  
  // Buscar informações de usuários específicos conforme necessário
  // Para não-admin, buscar usuários individualmente quando necessário
  // Para admin, buscar todos de uma vez
  const { data: usuariosData } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuarioApi.getAll(),
    enabled: currentUser?.role === 'ADMIN', // Apenas admin pode buscar todos
    retry: false, // Não tentar novamente se falhar (403 para não-admin)
  });

  // Criar mapeamento de idUsuario -> {nome, email}
  const usersMap = React.useMemo(() => {
    const map = new Map();
    
    // Adicionar usuário atual ao cache se disponível
    if (currentUser?.idUsuario) {
      map.set(currentUser.idUsuario, {
        idUsuario: currentUser.idUsuario,
        nome: currentUser.nome || null,
        email: currentUser.email || null,
      });
    }

    // Processar usuários da API
    if (usuariosData) {
      const usuarios = Array.isArray(usuariosData) ? usuariosData : (usuariosData?.data || usuariosData?.Data || []);
      usuarios.forEach(usuario => {
        const idUsuario = usuario.idUsuario || usuario.IdUsuario;
        if (idUsuario) {
          map.set(idUsuario, {
            idUsuario: idUsuario,
            nome: usuario.nome || usuario.Nome || null,
            email: usuario.email || usuario.Email || null,
          });
        }
      });
    }

    return map;
  }, [usuariosData, currentUser]);

  return usersMap;
};

/**
 * Hook para buscar informações de um usuário específico por ID
 */
export const useUserInfo = (idUsuario) => {
  const { data: usuarioData, isLoading, isError } = useQuery({
    queryKey: ['usuario', idUsuario],
    queryFn: () => usuarioApi.getById(idUsuario),
    enabled: !!idUsuario,
    retry: 1, // Tentar apenas uma vez se falhar
  });

  const userInfo = React.useMemo(() => {
    if (!usuarioData) return null;
    return {
      idUsuario: usuarioData.idUsuario || usuarioData.IdUsuario,
      nome: usuarioData.nome || usuarioData.Nome || null,
      email: usuarioData.email || usuarioData.Email || null,
    };
  }, [usuarioData]);

  return { data: userInfo, isLoading, isError };
};

/**
 * Função auxiliar para buscar informações do usuário pelo idUsuario
 */
export const getUserInfo = (idUsuario, usersMap) => {
  if (!idUsuario) return null;
  return usersMap?.get(idUsuario) || userInfoCache.get(idUsuario) || null;
};

/**
 * Função para atualizar cache de informações do usuário
 */
export const setUserInfo = (idUsuario, nome, email) => {
  if (idUsuario) {
    const info = { idUsuario, nome, email };
    userInfoCache.set(idUsuario, info);
  }
};

