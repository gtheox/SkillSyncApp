import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { perfilApi } from '../../api/perfilApi';
import { useUserInfo, useUsersInfo, getUserInfo } from '../../hooks/useUserInfo';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

// Componente para exibir informações do freelancer
const FreelancerInfo = ({ userId, usersMap }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { data: userInfo, isLoading } = useUserInfo(userId); // Buscar individualmente se não estiver no map
  
  const info = userInfo || getUserInfo(userId, usersMap);
  
  if (isLoading) {
    return (
      <View style={styles.freelancerInfo}>
        <Text style={styles.freelancerText}>Carregando...</Text>
      </View>
    );
  }
  
  if (!info || (!info.nome && !info.email)) return null;
  
  return (
    <View style={styles.freelancerInfo}>
      <Ionicons name="mail-outline" size={14} color={theme.colors.textLight} />
      {info.nome && (
        <>
          <Text style={styles.freelancerText}>{info.nome}</Text>
          {info.email && <Text style={styles.freelancerSeparator}> • </Text>}
        </>
      )}
      {info.email && (
        <Text style={styles.freelancerEmail}>{info.email}</Text>
      )}
    </View>
  );
};

const PerfisScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  // Verificar permissões
  const isAdmin = user?.role === 'ADMIN';
  const isFreelancer = user?.role === 'FREELANCER';
  const isContratante = user?.role === 'CONTRATANTE';
  const canCreate = isAdmin || isFreelancer;
  // Admin pode editar/excluir qualquer perfil, freelancer apenas o seu
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  const {
    data: perfisData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['perfis'],
    queryFn: () => perfilApi.getAll(),
  });

  // Buscar informações de usuários (admin pode buscar todos, outros buscam individualmente)
  const usersMap = useUsersInfo();

  // A API retorna um array diretamente ou encapsulado
  // A API está configurada para usar camelCase (idPerfil), mas pode retornar PascalCase (IdPerfil)
  const perfisRaw = Array.isArray(perfisData) ? perfisData : (perfisData?.data || perfisData?.Data || []);
  
  // Debug: verificar estrutura dos dados recebidos
  if (perfisRaw.length > 0 && !perfisRaw[0]?.idPerfil && !perfisRaw[0]?.IdPerfil) {
    console.log('Estrutura do primeiro perfil recebido:', JSON.stringify(perfisRaw[0], null, 2));
    console.log('Chaves do primeiro perfil:', Object.keys(perfisRaw[0] || {}));
  }
  
  // Filtrar e normalizar perfis - garantir que todos tenham um ID válido
  const perfis = perfisRaw
    .map((item, index) => {
      // Tentar normalizar o ID de todas as formas possíveis
      // Verificar também se o valor não é undefined/null/empty string
      let idPerfil = item?.idPerfil ?? item?.IdPerfil ?? item?.id_perfil ?? item?.ID_PERFIL;
      
      // Se o valor for undefined, null ou string vazia, tentar extrair do link self
      if ((!idPerfil && idPerfil !== 0) || idPerfil === '' || idPerfil === 'undefined') {
        // Tentar extrair do link self se existir
        const links = item?.links || item?.Links || {};
        const selfLink = links?.self || links?.Self || '';
        if (selfLink) {
          const match = selfLink.match(/\/perfis\/(\d+)/);
          if (match && match[1]) {
            idPerfil = parseFloat(match[1]);
          }
        }
      }
      
      // Se ainda não encontrou ID, pular este item
      if ((!idPerfil && idPerfil !== 0) || idPerfil === '' || isNaN(idPerfil)) {
        console.error(`Perfil no índice ${index} sem ID válido. Item:`, JSON.stringify(item, null, 2));
        console.error('Chaves disponíveis:', Object.keys(item || {}));
        return null;
      }
      
      // Retornar item normalizado com idPerfil garantido
      return {
        ...item,
        idPerfil: idPerfil,
        IdPerfil: idPerfil, // Manter ambos para compatibilidade
      };
    })
    .filter(item => item !== null && item !== undefined && item.idPerfil !== undefined);

  const deleteMutation = useMutation({
    mutationFn: (id) => perfilApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      Alert.alert('Sucesso', 'Perfil excluído com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', 'Erro ao excluir perfil. Tente novamente.');
      console.error('Error deleting perfil:', error);
    },
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const renderPerfil = ({ item }) => {
    // O item já foi normalizado no .map() acima, então idPerfil deve existir
    // Mas vamos garantir normalização completa para todos os campos
    const idPerfil = item.idPerfil || item.IdPerfil;
    const idUsuario = item.idUsuario || item.IdUsuario;
    const tituloProfissional = item.tituloProfissional || item.TituloProfissional || '';
    const resumo = item.resumo || item.Resumo || '';
    const valorHora = item.valorHora !== undefined ? item.valorHora : (item.ValorHora !== undefined ? item.ValorHora : null);
    const dataUltimaAtualizacao = item.dataUltimaAtualizacao || item.DataUltimaAtualizacao;
    const habilidades = Array.isArray(item.habilidades) ? item.habilidades : (Array.isArray(item.Habilidades) ? item.Habilidades : []);
    
    // Se não conseguir encontrar idPerfil mesmo após normalização, pular este item
    if (!idPerfil && idPerfil !== 0) {
      console.error('Perfil sem idPerfil válido após normalização completa. Item:', JSON.stringify(item, null, 2));
      return null;
    }
    
    const perfil = {
      idPerfil: idPerfil,
      idUsuario: idUsuario,
      tituloProfissional: tituloProfissional,
      resumo: resumo,
      valorHora: valorHora,
      dataUltimaAtualizacao: dataUltimaAtualizacao,
      habilidades: habilidades,
    };
    
    // Verificar se o perfil pertence ao usuário (para freelancers)
    const isOwner = isFreelancer && perfil.idUsuario === user?.idUsuario;
    // Admin pode editar/excluir qualquer perfil, freelancer apenas o seu
    const canEditThis = isAdmin || (isFreelancer && isOwner);
    const canDeleteThis = isAdmin || (isFreelancer && isOwner);

    // Usar idPerfil diretamente (já garantido acima)
    const perfilId = perfil.idPerfil;

    return (
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PerfilDetails', { id: perfilId })}
            activeOpacity={0.7}
            style={styles.cardClickableArea}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={24} color={theme.colors.secondary} />
              <View style={styles.cardHeaderText}>
                <Text style={styles.title}>{perfil.tituloProfissional || 'Sem título'}</Text>
                {/* Mostrar informações do freelancer para contratantes */}
                {isContratante && perfil.idUsuario && (
                  <FreelancerInfo userId={perfil.idUsuario} usersMap={usersMap} />
                )}
              </View>
            </View>
            <Text style={styles.resumo} numberOfLines={2}>
              {perfil.resumo || 'Sem resumo'}
            </Text>
            <View style={styles.info}>
              {perfil.valorHora && (
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.infoText}>{formatCurrency(perfil.valorHora)}/hora</Text>
                </View>
              )}
              {perfil.dataUltimaAtualizacao && (
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.infoText}>{formatDate(perfil.dataUltimaAtualizacao)}</Text>
                </View>
              )}
            </View>
            {perfil.habilidades && perfil.habilidades.length > 0 && (
              <View style={styles.habilidades}>
                {perfil.habilidades.slice(0, 3).map((habilidade, index) => (
                  <View key={index} style={styles.habilidadeTag}>
                    <Text style={styles.habilidadeText}>{habilidade}</Text>
                  </View>
                ))}
                {perfil.habilidades.length > 3 && (
                  <Text style={styles.moreSkills}>+{perfil.habilidades.length - 3}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
          
          {(canEditThis || canDeleteThis) && (
            <View style={styles.actions}>
              {canEditThis && (
                <Button
                  title="Editar"
                  onPress={() => navigation.navigate('PerfilEdit', { id: perfilId })}
                  variant="outline"
                  style={styles.actionButton}
                />
              )}
              {canDeleteThis && (
                <Button
                  title="Excluir"
                  onPress={() => handleDelete(perfilId)}
                  variant="danger"
                  style={styles.actionButton}
                />
              )}
            </View>
          )}
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <Loading message="Carregando perfis..." />;
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Erro ao carregar perfis</Text>
          <Text style={styles.errorSubtext}>
            Verifique sua conexão com a internet e tente novamente
          </Text>
          <Button
            title="Tentar novamente"
            onPress={() => refetch()}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people" size={28} color={theme.colors.secondary} />
          <Text style={styles.headerTitle}>Perfis</Text>
        </View>
        <View style={styles.headerRight}>
          {isFreelancer && (
            <TouchableOpacity
              style={styles.meuPerfilButton}
              onPress={() => navigation.navigate('MeuPerfil')}
            >
              <Ionicons name="person" size={20} color={theme.colors.primary} />
              <Text style={styles.meuPerfilButtonText}>Meu Perfil</Text>
            </TouchableOpacity>
          )}
          {canCreate && (
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => navigation.navigate('PerfilCreate')}
            >
              <Ionicons name="add" size={20} color={theme.colors.white} />
              <Text style={styles.newButtonText}>Novo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={perfis}
        renderItem={renderPerfil}
        keyExtractor={(item, index) => {
          // Tentar todas as variações possíveis do ID
          const id = item?.idPerfil || item?.IdPerfil || item?.id_perfil || item?.ID_PERFIL;
          if (id !== undefined && id !== null && id !== '') {
            return id.toString();
          }
          // Fallback: usar índice se não encontrar ID
          console.warn(`Item no índice ${index} sem ID válido. Item:`, JSON.stringify(item, null, 2));
          return `perfil-${index}-${Math.random().toString(36).substr(2, 9)}`;
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum perfil encontrado"
            message="Crie um novo perfil para começar"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
  },
  meuPerfilButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  meuPerfilButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  newButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardClickableArea: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  resumo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  cardHeaderText: {
    flex: 1,
  },
  freelancerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  freelancerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  freelancerEmail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  freelancerSeparator: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginHorizontal: theme.spacing.xs,
  },
  info: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  moreSkills: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  habilidades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  habilidadeTag: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  habilidadeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.fontWeight.bold,
  },
  errorSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    alignSelf: 'center',
    minWidth: 150,
  },
});

export default PerfisScreen;