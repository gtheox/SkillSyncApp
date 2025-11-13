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
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { dicaApi } from '../../api/dicaApi';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';

const DicasScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const {
    data: dicas = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dicas'],
    queryFn: () => dicaApi.getAll(),
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const renderDica = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(item.titulo || 'Dica', item.conteudo || item.conteudo);
        }}
      >
        <Text style={styles.titulo}>{item.titulo || 'Dica de IA'}</Text>
        <Text style={styles.conteudo} numberOfLines={3}>
          {item.conteudo || 'Sem conteúdo disponível'}
        </Text>
        <View style={styles.info}>
          {item.dataGeracao && (
            <Text style={styles.data}>{formatDate(item.dataGeracao)}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (isLoading) {
    return <Loading message="Carregando dicas..." />;
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar dicas</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dicas de IA</Text>
        <Text style={styles.headerSubtitle}>
          Dicas geradas por inteligência artificial
        </Text>
      </View>
      <FlatList
        data={dicas}
        renderItem={renderDica}
        keyExtractor={(item) => item.idDica.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma dica encontrada"
            message="As dicas aparecerão aqui quando forem geradas"
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  titulo: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  conteudo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  data: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default DicasScreen;