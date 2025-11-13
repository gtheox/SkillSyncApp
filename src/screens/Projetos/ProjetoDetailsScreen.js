import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { projetoApi } from '../../api/projetoApi';
import { useUserInfo, useUsersInfo, getUserInfo } from '../../hooks/useUserInfo';
import Loading from '../../components/Loading';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

const ProjetoDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  // TODOS OS HOOKS DEVEM SER CHAMADOS NO TOPO - ANTES DE QUALQUER RETORNO CONDICIONAL
  
  // Verificar permissões (será atualizado após carregar projeto)
  const isAdmin = user?.role === 'ADMIN';
  const isContratante = user?.role === 'CONTRATANTE';
  const isFreelancer = user?.role === 'FREELANCER';
  const showContratanteInfo = isFreelancer || isAdmin; // Freelancers e admins veem informações do contratante

  // Buscar informações de usuários
  const usersMap = useUsersInfo();

  const {
    data: projeto,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['projeto', id],
    queryFn: () => projetoApi.getById(id),
  });

  // Extrair idUsuarioContratante do projeto (antes dos retornos condicionais)
  // Normalizar campos do projeto mesmo antes de verificar loading/error
  const idContratante = React.useMemo(() => {
    if (!projeto) return null;
    // Tentar ambos os formatos (camelCase e PascalCase)
    const userId = projeto.idUsuarioContratante || projeto.IdUsuarioContratante;
    // Se showContratanteInfo for true e tiver userId, retornar o userId
    if (showContratanteInfo && userId) {
      return userId;
    }
    return null;
  }, [projeto, showContratanteInfo]);

  // Buscar informações do contratante (nome e email) - sempre chamar na mesma ordem
  const { data: contratanteInfoData, isLoading: isLoadingContratante } = useUserInfo(idContratante);

  const generateMatchesMutation = useMutation({
    mutationFn: () => projetoApi.gerarMatches(id),
    onSuccess: (data) => {
      setShowMatchLoading(false);
      navigation.navigate('Matches', { projetoId: id, matches: data });
    },
    onError: (error) => {
      setShowMatchLoading(false);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao gerar matches. Tente novamente.'
      );
    },
  });

  // Mostrar modal de loading quando estiver gerando matches
  const [showMatchLoading, setShowMatchLoading] = React.useState(false);

  const handleGenerateMatches = () => {
    setShowMatchLoading(true);
    generateMatchesMutation.mutate();
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

  if (isLoading) {
    return <Loading message="Carregando projeto..." />;
  }

  if (isError || !projeto) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar projeto</Text>
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </View>
    );
  }

  // Normalizar campos do projeto (após garantir que projeto existe)
  const projetoNormalizado = {
    idProjeto: projeto.idProjeto || projeto.IdProjeto,
    idUsuarioContratante: projeto.idUsuarioContratante || projeto.IdUsuarioContratante,
    titulo: projeto.titulo || projeto.Titulo,
    descricao: projeto.descricao || projeto.Descricao,
    categoriaNome: projeto.categoriaNome || projeto.CategoriaNome,
    orcamento: projeto.orcamento || projeto.Orcamento,
    status: projeto.status || projeto.Status,
    dataPublicacao: projeto.dataPublicacao || projeto.DataPublicacao,
    habilidadesRequisitadas: projeto.habilidadesRequisitadas || projeto.HabilidadesRequisitadas || [],
    links: projeto.links || projeto.Links || {},
  };

  // Verificar permissões após carregar projeto
  const canGenerateMatches = isAdmin || isContratante;
  const canEdit = isAdmin || (isContratante && projetoNormalizado.idUsuarioContratante === user?.idUsuario);

  // Processar informações do contratante (após garantir que projeto existe)
  const contratanteInfo = contratanteInfoData || (showContratanteInfo && projetoNormalizado.idUsuarioContratante 
    ? getUserInfo(projetoNormalizado.idUsuarioContratante, usersMap)
    : null);

  return (
    <>
      <Modal
        visible={showMatchLoading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Gerando matches...</Text>
            <Text style={styles.loadingSubtext}>Isso pode levar alguns segundos</Text>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
        <Text style={styles.title}>{projetoNormalizado.titulo}</Text>
        
        {/* Mostrar informações do contratante para freelancers */}
        {showContratanteInfo && (
          isLoadingContratante ? (
            <View style={styles.contratanteInfo}>
              <Text style={styles.contratanteText}>Carregando informações do contratante...</Text>
            </View>
          ) : contratanteInfo && (contratanteInfo.nome || contratanteInfo.email) ? (
            <View style={styles.contratanteInfo}>
              <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
              <View style={styles.contratanteInfoText}>
                <Text style={styles.contratanteLabel}>Contratante:</Text>
                {contratanteInfo.nome && (
                  <Text style={styles.contratanteName}>{contratanteInfo.nome}</Text>
                )}
                {contratanteInfo.email && (
                  <Text style={styles.contratanteEmail}>{contratanteInfo.email}</Text>
                )}
              </View>
            </View>
          ) : null
        )}
        
        <Text style={styles.descricao}>{projetoNormalizado.descricao}</Text>

        <View style={styles.info}>
          {projetoNormalizado.categoriaNome && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Categoria:</Text>
              <Text style={styles.infoValue}>{projetoNormalizado.categoriaNome}</Text>
            </View>
          )}
          {projetoNormalizado.orcamento && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Orçamento:</Text>
              <Text style={styles.infoValue}>{formatCurrency(projetoNormalizado.orcamento)}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{projetoNormalizado.status}</Text>
          </View>
          {projetoNormalizado.dataPublicacao && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data de Publicação:</Text>
              <Text style={styles.infoValue}>{formatDate(projetoNormalizado.dataPublicacao)}</Text>
            </View>
          )}
        </View>

        {projetoNormalizado.habilidadesRequisitadas && projetoNormalizado.habilidadesRequisitadas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades Requisitadas:</Text>
            <View style={styles.habilidades}>
              {projetoNormalizado.habilidadesRequisitadas.map((habilidade, index) => (
                <View key={index} style={styles.habilidadeTag}>
                  <Text style={styles.habilidadeText}>{habilidade}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {projetoNormalizado.links && Object.keys(projetoNormalizado.links).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links:</Text>
            {Object.entries(projetoNormalizado.links).map(([key, value]) => (
              <TouchableOpacity key={key} style={styles.link}>
                <Text style={styles.linkText}>{key}: {value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {(canGenerateMatches || canEdit) && (
        <View style={styles.actions}>
          {canGenerateMatches && (
            <TouchableOpacity
              style={[styles.matchButton, showMatchLoading && styles.matchButtonDisabled]}
              onPress={handleGenerateMatches}
              disabled={showMatchLoading}
            >
              {showMatchLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons name="search" size={20} color={theme.colors.white} />
                  <Text style={styles.matchButtonText}>Gerar Matches</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {canEdit && (
            <Button
              title="Editar"
              onPress={() => navigation.navigate('ProjetoEdit', { id: projetoNormalizado.idProjeto })}
              variant="outline"
              style={styles.button}
            />
          )}
        </View>
      )}
    </ScrollView>
    </>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  card: {
    margin: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  descricao: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  info: {
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textDark,
    marginRight: theme.spacing.sm,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  habilidades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  habilidadeTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  habilidadeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
  },
  link: {
    paddingVertical: theme.spacing.xs,
  },
  linkText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
  },
  actions: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    minHeight: 50,
  },
  matchButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  matchButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    minWidth: 200,
    ...theme.shadow.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  contratanteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  contratanteInfoText: {
    flex: 1,
  },
  contratanteLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  contratanteName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  contratanteEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  contratanteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
});

export default ProjetoDetailsScreen;