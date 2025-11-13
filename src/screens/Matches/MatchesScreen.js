import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { projetoApi } from '../../api/projetoApi';
import { perfilApi } from '../../api/perfilApi';
import Loading from '../../components/Loading';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

const MatchesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projetoId, matches: initialMatches } = route.params || {};
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const {
    data: matchesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['matches', projetoId],
    queryFn: () => projetoApi.gerarMatches(projetoId),
    enabled: !!projetoId && !initialMatches,
  });

  const matches = initialMatches?.matches || matchesData?.matches || [];

  // Buscar perfis completos para os matches
  const perfilIds = useMemo(() => 
    matches.map(m => m.id_perfil), 
    [matches]
  );

  const {
    data: perfis = [],
    isLoading: isLoadingPerfis,
  } = useQuery({
    queryKey: ['perfis'],
    queryFn: () => perfilApi.getAll(),
    enabled: matches.length > 0,
  });

  // Combinar matches com informações dos perfis
  const matchesComPerfis = useMemo(() => {
    return matches.map(match => {
      const perfil = perfis.find(p => p.idPerfil === match.id_perfil);
      return {
        ...match,
        perfil,
      };
    }).filter(m => m.perfil); // Filtrar apenas matches com perfil encontrado
  }, [matches, perfis]);

  useEffect(() => {
    if (isError) {
      Alert.alert('Erro', 'Erro ao gerar matches. Tente novamente.');
      navigation.goBack();
    }
  }, [isError]);

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleContact = (perfil) => {
    // Por enquanto, apenas navegar para os detalhes do perfil
    // Depois podemos adicionar email/whatsapp se a API retornar
    navigation.navigate('PerfilDetails', { id: perfil.idPerfil });
  };

  const renderMatch = ({ item, index }) => {
    const { perfil } = item;
    if (!perfil) return null;

    return (
      <Card style={styles.card}>
        <View style={styles.matchHeader}>
          <View style={styles.matchHeaderLeft}>
            <Ionicons name="person-circle" size={32} color={theme.colors.primary} />
            <View style={styles.matchTitleContainer}>
              <Text style={styles.matchTitle}>
                {perfil.tituloProfissional || `Perfil #${item.id_perfil}`}
              </Text>
              {perfil.valorHora && (
                <Text style={styles.matchPrice}>
                  {formatCurrency(perfil.valorHora)}/hora
                </Text>
              )}
            </View>
          </View>
          <View style={[
            styles.scoreContainer,
            item.score_compatibilidade >= 80 && styles.scoreContainerHigh,
            item.score_compatibilidade >= 60 && item.score_compatibilidade < 80 && styles.scoreContainerMedium,
          ]}>
            <Text style={styles.scoreText}>{item.score_compatibilidade}%</Text>
          </View>
        </View>
        
        <Text style={styles.matchResumo} numberOfLines={2}>
          {perfil.resumo || 'Sem resumo disponível'}
        </Text>

        {perfil.habilidades && perfil.habilidades.length > 0 && (
          <View style={styles.habilidades}>
            {perfil.habilidades.slice(0, 4).map((habilidade, idx) => (
              <View key={idx} style={styles.habilidadeTag}>
                <Text style={styles.habilidadeText}>{habilidade}</Text>
              </View>
            ))}
            {perfil.habilidades.length > 4 && (
              <Text style={styles.moreSkills}>+{perfil.habilidades.length - 4}</Text>
            )}
          </View>
        )}

        <View style={styles.justificativaContainer}>
          <Text style={styles.justificativaLabel}>Justificativa:</Text>
          <Text style={styles.justificativa}>{item.justificativa}</Text>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact(perfil)}
        >
          <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.contactButtonText}>Ver detalhes e contato</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card>
    );
  };

  if ((isLoading || isLoadingPerfis) && !initialMatches) {
    return <Loading message="Gerando matches..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="star" size={28} color={theme.colors.accent} />
          <View>
            <Text style={styles.headerTitle}>Matches Encontrados</Text>
            <Text style={styles.headerSubtitle}>
              {matchesComPerfis.length} {matchesComPerfis.length === 1 ? 'match encontrado' : 'matches encontrados'}
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={matchesComPerfis}
        renderItem={renderMatch}
        keyExtractor={(item, index) => `${item.id_perfil}-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum match encontrado"
            message="Não foram encontrados perfis compatíveis com este projeto"
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  list: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  matchHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  matchTitleContainer: {
    flex: 1,
  },
  matchTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
  },
  matchPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  matchResumo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  scoreContainer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreContainerHigh: {
    backgroundColor: theme.colors.success,
  },
  scoreContainerMedium: {
    backgroundColor: theme.colors.warning,
  },
  scoreText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
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
  moreSkills: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  justificativaContainer: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  justificativaLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  justificativa: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  contactButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    flex: 1,
    textAlign: 'center',
  },
});

export default MatchesScreen;