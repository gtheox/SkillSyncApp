import React, { useState } from 'react';
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
import { projetoApi } from '../../api/projetoApi';
import { habilidadeApi } from '../../api/habilidadeApi';
import { useUserInfo, useUsersInfo, getUserInfo } from '../../hooks/useUserInfo';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

// Componente para exibir informações do contratante
const ContratanteInfo = ({ userId, usersMap }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { data: userInfo, isLoading } = useUserInfo(userId); // Buscar individualmente se não estiver no map
  
  const info = userInfo || getUserInfo(userId, usersMap);
  
  if (isLoading) {
    return (
      <View style={styles.contratanteInfo}>
        <Text style={styles.contratanteText}>Carregando...</Text>
      </View>
    );
  }
  
  if (!info || (!info.nome && !info.email)) return null;
  
  return (
    <View style={styles.contratanteInfo}>
      <Ionicons name="person-outline" size={14} color={theme.colors.textLight} />
      {info.nome && (
        <>
          <Text style={styles.contratanteText}>{info.nome}</Text>
          {info.email && <Text style={styles.contratanteSeparator}> • </Text>}
        </>
      )}
      {info.email && (
        <Text style={styles.contratanteEmail}>{info.email}</Text>
      )}
    </View>
  );
};

const ProjetosScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  // TODOS OS HOOKS DEVEM SER CHAMADOS NO TOPO - ANTES DE QUALQUER RETORNO CONDICIONAL
  // Filtro de habilidades para freelancers
  const [habilidadesFiltro, setHabilidadesFiltro] = useState([]);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [mostrarMeusProjetos, setMostrarMeusProjetos] = useState(false);
  
  // Verificar permissões e roles
  const isAdmin = user?.role === 'ADMIN';
  const isContratante = user?.role === 'CONTRATANTE';
  const isFreelancer = user?.role === 'FREELANCER';
  const canCreate = isAdmin || isContratante;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  // Buscar projetos usando TanStack Query
  const {
    data: projetosData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['projetos'],
    queryFn: () => projetoApi.getAll(1, 100),
  });

  // Buscar habilidades disponíveis (para filtro de freelancers)
  const {
    data: habilidadesData,
    isLoading: isLoadingHabilidades,
  } = useQuery({
    queryKey: ['habilidades'],
    queryFn: () => habilidadeApi.getAll(),
    enabled: isFreelancer,
  });

  // Buscar informações de usuários (para mostrar nome/email do contratante)
  const usersMap = useUsersInfo();

  // Mutação para deletar projeto
  const deleteMutation = useMutation({
    mutationFn: (id) => projetoApi.delete(id),
    onSuccess: () => {
      // Invalidar a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      Alert.alert('Sucesso', 'Projeto excluído com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', 'Erro ao excluir projeto. Tente novamente.');
      console.error('Error deleting projeto:', error);
    },
  });

  // Processar dados dos projetos
  const projetos = React.useMemo(() => {
    const projetosList = projetosData?.Data || projetosData?.data || (Array.isArray(projetosData) ? projetosData : []);
    
    // Filtrar "Meus Projetos" se contratante estiver com o filtro ativo
    if (isContratante && mostrarMeusProjetos && user?.idUsuario) {
      return projetosList.filter(p => p.idUsuarioContratante === user.idUsuario || p.IdUsuarioContratante === user.idUsuario);
    }
    
    return projetosList;
  }, [projetosData, mostrarMeusProjetos, isContratante, user?.idUsuario]);

  // Processar habilidades disponíveis (apenas do banco de dados)
  const habilidadesDisponiveis = React.useMemo(() => {
    if (!habilidadesData) return [];
    // A API retorna array de habilidades do banco
    const habilidadesList = Array.isArray(habilidadesData) ? habilidadesData : (habilidadesData?.data || habilidadesData?.Data || []);
    return habilidadesList.map(h => {
      // Retornar nome da habilidade
      if (typeof h === 'string') return h;
      return h.nome || h.Nome || h.nmHabilidade || h.NmHabilidade || null;
    }).filter(Boolean).sort();
  }, [habilidadesData]);

  // Filtrar projetos por habilidades (apenas para freelancers)
  const projetosFiltrados = React.useMemo(() => {
    let filtered = projetos;
    
    // Filtro de habilidades para freelancers
    if (isFreelancer && habilidadesFiltro.length > 0) {
      filtered = projetos.filter(projeto => {
        const habilidades = projeto.habilidadesRequisitadas || projeto.HabilidadesRequisitadas || [];
        if (habilidades.length === 0) return false;
        // Verificar se pelo menos uma habilidade do filtro está no projeto
        return habilidades.some(habilidade =>
          habilidadesFiltro.some(filtro => 
            habilidade.toLowerCase().includes(filtro.toLowerCase()) ||
            filtro.toLowerCase().includes(habilidade.toLowerCase())
          )
        );
      });
    }
    
    return filtered;
  }, [projetos, habilidadesFiltro, isFreelancer]);

  // Funções auxiliares - DEVEM SER DEFINIDAS ANTES DE SEREM USADAS
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

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este projeto?',
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

  const renderProjeto = ({ item }) => {
    // Normalizar campos do projeto
    const projeto = {
      idProjeto: item.idProjeto || item.IdProjeto,
      titulo: item.titulo || item.Titulo,
      descricao: item.descricao || item.Descricao,
      orcamento: item.orcamento || item.Orcamento,
      status: item.status || item.Status,
      dataPublicacao: item.dataPublicacao || item.DataPublicacao,
      idUsuarioContratante: item.idUsuarioContratante || item.IdUsuarioContratante,
      habilidadesRequisitadas: item.habilidadesRequisitadas || item.HabilidadesRequisitadas || [],
      contratanteNome: item.contratanteNome || item.ContratanteNome || item.nomeContratante || item.NomeContratante,
      contratanteEmail: item.contratanteEmail || item.ContratanteEmail || item.emailContratante || item.EmailContratante,
    };
    
    // Verificar se o projeto pertence ao usuário (para contratantes)
    const isOwner = isContratante && projeto.idUsuarioContratante === user?.idUsuario;
    // Admin pode editar/excluir qualquer projeto, contratante apenas os seus
    const canEditThis = isAdmin || (isContratante && isOwner);
    const canDeleteThis = isAdmin || (isContratante && isOwner);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProjetoDetails', { id: projeto.idProjeto })}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="briefcase-outline" size={24} color={theme.colors.primary} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.title}>{projeto.titulo}</Text>
              {/* Mostrar informações do contratante para freelancers */}
              {isFreelancer && projeto.idUsuarioContratante && (
                <ContratanteInfo userId={projeto.idUsuarioContratante} usersMap={usersMap} />
              )}
            </View>
          </View>
          <Text style={styles.descricao} numberOfLines={2}>
            {projeto.descricao}
          </Text>
          <View style={styles.info}>
            {projeto.orcamento && (
              <View style={styles.infoItem}>
                <Ionicons name="cash-outline" size={16} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{formatCurrency(projeto.orcamento)}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{projeto.status}</Text>
            </View>
            {projeto.dataPublicacao && (
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{formatDate(projeto.dataPublicacao)}</Text>
              </View>
            )}
          </View>
          {projeto.habilidadesRequisitadas && projeto.habilidadesRequisitadas.length > 0 && (
            <View style={styles.habilidades}>
              {projeto.habilidadesRequisitadas.slice(0, 3).map((habilidade, index) => (
                <View key={index} style={styles.habilidadeTag}>
                  <Text style={styles.habilidadeText}>{habilidade}</Text>
                </View>
              ))}
              {projeto.habilidadesRequisitadas.length > 3 && (
                <Text style={styles.moreSkills}>+{projeto.habilidadesRequisitadas.length - 3}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
        {(canEditThis || canDeleteThis) && (
          <View style={styles.actions}>
            {canEditThis && (
              <Button
                title="Editar"
                onPress={() => navigation.navigate('ProjetoEdit', { id: projeto.idProjeto })}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            {canDeleteThis && (
              <Button
                title="Excluir"
                onPress={() => handleDelete(projeto.idProjeto)}
                variant="danger"
                style={styles.actionButton}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  // Renderizar loading e error DEPOIS de todos os hooks
  if (isLoading) {
    return <Loading message="Carregando projetos..." />;
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Erro ao carregar projetos</Text>
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
          <Ionicons name="briefcase" size={28} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>
            {mostrarMeusProjetos ? 'Meus Projetos' : 'Projetos'}
          </Text>
          {projetosFiltrados.length !== projetos.length && (
            <Text style={styles.filterBadge}>
              ({projetosFiltrados.length}/{projetos.length})
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {isContratante && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                mostrarMeusProjetos && styles.filterButtonActive,
              ]}
              onPress={() => setMostrarMeusProjetos(!mostrarMeusProjetos)}
            >
              <Ionicons 
                name={mostrarMeusProjetos ? "folder" : "folder-outline"} 
                size={20} 
                color={mostrarMeusProjetos ? theme.colors.white : theme.colors.primary} 
              />
            </TouchableOpacity>
          )}
          {isFreelancer && habilidadesDisponiveis.length > 0 && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                habilidadesFiltro.length > 0 && styles.filterButtonActive,
              ]}
              onPress={() => setMostrarFiltro(!mostrarFiltro)}
            >
              <Ionicons 
                name={mostrarFiltro ? "filter" : "filter-outline"} 
                size={20} 
                color={habilidadesFiltro.length > 0 ? theme.colors.white : theme.colors.primary} 
              />
              {habilidadesFiltro.length > 0 && (
                <View style={[styles.filterBadgeIcon, { backgroundColor: theme.colors.error }]}>
                  <Text style={styles.filterBadgeText}>{habilidadesFiltro.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {canCreate && (
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => navigation.navigate('ProjetoCreate')}
            >
              <Ionicons name="add" size={20} color={theme.colors.white} />
              <Text style={styles.newButtonText}>Novo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {mostrarFiltro && isFreelancer && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filtrar por habilidades:</Text>
          {habilidadesDisponiveis.length === 0 ? (
            <Text style={styles.filterEmptyText}>
              {isLoadingHabilidades ? 'Carregando habilidades...' : 'Nenhuma habilidade disponível'}
            </Text>
          ) : (
            <>
              <View style={styles.filterChips}>
                {habilidadesDisponiveis.map((habilidade, index) => {
                  const habilidadeNome = typeof habilidade === 'string' ? habilidade : (habilidade.nmHabilidade || habilidade.NmHabilidade || habilidade);
                  if (!habilidadeNome) return null;
                  
                  const isSelected = habilidadesFiltro.includes(habilidadeNome);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterChip,
                        isSelected && styles.filterChipSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setHabilidadesFiltro(habilidadesFiltro.filter(h => h !== habilidadeNome));
                        } else {
                          setHabilidadesFiltro([...habilidadesFiltro, habilidadeNome]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextSelected,
                        ]}
                      >
                        {habilidadeNome}
                      </Text>
                      {isSelected && (
                        <Ionicons name="close-circle" size={16} color={theme.colors.white} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {habilidadesFiltro.length > 0 && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => setHabilidadesFiltro([])}
                >
                  <Text style={styles.clearFilterText}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      <FlatList
        data={projetosFiltrados}
        renderItem={renderProjeto}
        keyExtractor={(item) => {
          const id = item.idProjeto || item.IdProjeto;
          return id ? id.toString() : Math.random().toString();
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={
              mostrarMeusProjetos 
                ? "Você ainda não tem projetos cadastrados"
                : habilidadesFiltro.length > 0 
                ? "Nenhum projeto encontrado com essas habilidades" 
                : "Nenhum projeto encontrado"
            }
            message={
              mostrarMeusProjetos
                ? "Crie seu primeiro projeto para começar"
                : habilidadesFiltro.length > 0 
                ? "Tente ajustar os filtros" 
                : "Crie um novo projeto para começar"
            }
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
  filterBadge: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  filterButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterBadgeIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontWeight: theme.fontWeight.medium,
  },
  filterChipTextSelected: {
    color: theme.colors.white,
  },
  clearFilterButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  clearFilterText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  filterEmptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
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
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  descricao: {
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
  contratanteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  contratanteText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  contratanteEmail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  contratanteSeparator: {
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
    backgroundColor: theme.colors.primaryLight,
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
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
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

export default ProjetosScreen;