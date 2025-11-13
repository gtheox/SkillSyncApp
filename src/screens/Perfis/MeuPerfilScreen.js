import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { perfilApi } from '../../api/perfilApi';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

const MeuPerfilScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);

  // Buscar todos os perfis e filtrar pelo idUsuario do usuário logado
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

  // Processar dados dos perfis
  const perfis = React.useMemo(() => {
    const perfisList = Array.isArray(perfisData) ? perfisData : (perfisData?.data || perfisData?.Data || []);
    return perfisList;
  }, [perfisData]);

  // Buscar perfil do usuário logado
  const meuPerfil = React.useMemo(() => {
    if (!user?.idUsuario || !perfis || perfis.length === 0) return null;
    
    // Normalizar campos e buscar perfil do usuário logado
    return perfis.find(p => {
      const idUsuario = p.idUsuario || p.IdUsuario;
      return idUsuario === user.idUsuario;
    });
  }, [perfis, user?.idUsuario]);

  // Funções auxiliares
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

  // Renderizar loading e error DEPOIS de todos os hooks
  if (isLoading) {
    return <Loading message="Carregando seu perfil..." />;
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Erro ao carregar perfil</Text>
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

  // Se não tiver perfil, mostrar mensagem
  if (!meuPerfil) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyTitle}>Você ainda não tem um perfil</Text>
          <Text style={styles.emptyMessage}>
            Crie seu perfil de freelancer para começar a receber propostas de projetos
          </Text>
          <Button
            title="Criar Perfil"
            onPress={() => navigation.navigate('PerfilCreate')}
            style={styles.button}
          />
        </View>
      </ScrollView>
    );
  }

  // Normalizar campos do perfil
  const perfil = {
    idPerfil: meuPerfil.idPerfil || meuPerfil.IdPerfil,
    idUsuario: meuPerfil.idUsuario || meuPerfil.IdUsuario,
    tituloProfissional: meuPerfil.tituloProfissional || meuPerfil.TituloProfissional,
    resumo: meuPerfil.resumo || meuPerfil.Resumo,
    valorHora: meuPerfil.valorHora || meuPerfil.ValorHora,
    dataUltimaAtualizacao: meuPerfil.dataUltimaAtualizacao || meuPerfil.DataUltimaAtualizacao,
    habilidades: meuPerfil.habilidades || meuPerfil.Habilidades || [],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={theme.colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{perfil.tituloProfissional || 'Sem título'}</Text>
            <Text style={styles.subtitle}>Meu Perfil</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.resumo}>{perfil.resumo || 'Sem resumo'}</Text>
        </View>

        <View style={styles.info}>
          {perfil.valorHora && (
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Valor por Hora</Text>
                <Text style={styles.infoValue}>{formatCurrency(perfil.valorHora)}</Text>
              </View>
            </View>
          )}
          {perfil.dataUltimaAtualizacao && (
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Última Atualização</Text>
                <Text style={styles.infoValue}>{formatDate(perfil.dataUltimaAtualizacao)}</Text>
              </View>
            </View>
          )}
        </View>

        {perfil.habilidades && perfil.habilidades.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.habilidades}>
              {perfil.habilidades.map((habilidade, index) => (
                <View key={index} style={styles.habilidadeTag}>
                  <Text style={styles.habilidadeText}>{habilidade}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Editar Perfil"
            onPress={() => navigation.navigate('PerfilEdit', { id: perfil.idPerfil })}
            variant="primary"
            style={styles.editButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  resumo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  info: {
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textDark,
  },
  habilidades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  habilidadeTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  habilidadeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  editButton: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  button: {
    minWidth: 150,
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
});

export default MeuPerfilScreen;

