import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { perfilApi } from '../../api/perfilApi';
import { useUserInfo, useUsersInfo, getUserInfo } from '../../hooks/useUserInfo';
import Loading from '../../components/Loading';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

const PerfilDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);

  // TODOS OS HOOKS DEVEM SER CHAMADOS NO TOPO - ANTES DE QUALQUER RETORNO CONDICIONAL
  
  // Verificar se é contratante ou admin (para mostrar informações do freelancer)
  const isContratante = user?.role === 'CONTRATANTE';
  const isAdmin = user?.role === 'ADMIN';
  const showFreelancerInfo = isContratante || isAdmin;

  // Buscar informações de usuários
  const usersMap = useUsersInfo();

  // Buscar perfil
  const {
    data: perfil,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['perfil', id],
    queryFn: () => perfilApi.getById(id),
  });

  // Extrair idUsuario do perfil (antes dos retornos condicionais)
  // Sempre calcular, mesmo se perfil ainda não estiver carregado
  const idUsuarioParaBusca = React.useMemo(() => {
    if (!perfil) return null;
    const userId = perfil.idUsuario || perfil.IdUsuario;
    // Só buscar se showFreelancerInfo for true e tiver idUsuario
    return (showFreelancerInfo && userId) ? userId : null;
  }, [perfil, showFreelancerInfo]);

  // Buscar informações do freelancer (nome e email) - sempre chamar na mesma ordem
  const { data: freelancerInfoData, isLoading: isLoadingFreelancer } = useUserInfo(idUsuarioParaBusca);

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

  // Renderizar loading e error DEPOIS de todos os hooks
  if (isLoading) {
    return <Loading message="Carregando perfil..." />;
  }

  if (isError || !perfil) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </View>
    );
  }

  // Normalizar campos do perfil (após garantir que perfil existe)
  const perfilNormalizado = {
    idPerfil: perfil.idPerfil || perfil.IdProfil,
    idUsuario: perfil.idUsuario || perfil.IdUsuario,
    tituloProfissional: perfil.tituloProfissional || perfil.TituloProfissional,
    resumo: perfil.resumo || perfil.Resumo,
    valorHora: perfil.valorHora || perfil.ValorHora,
    dataUltimaAtualizacao: perfil.dataUltimaAtualizacao || perfil.DataUltimaAtualizacao,
    habilidades: perfil.habilidades || perfil.Habilidades || [],
  };

  // Processar informações do freelancer (após garantir que perfil existe)
  const freelancerInfo = freelancerInfoData || (showFreelancerInfo && perfilNormalizado.idUsuario 
    ? getUserInfo(perfilNormalizado.idUsuario, usersMap)
    : null);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{perfilNormalizado.tituloProfissional || 'Sem título'}</Text>
        
        {/* Mostrar informações do freelancer para contratantes */}
        {showFreelancerInfo && (
          isLoadingFreelancer ? (
            <View style={styles.freelancerInfo}>
              <Text style={styles.freelancerName}>Carregando informações...</Text>
            </View>
          ) : freelancerInfo && (freelancerInfo.nome || freelancerInfo.email) ? (
            <View style={styles.freelancerInfo}>
              <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
              <View style={styles.freelancerInfoText}>
                {freelancerInfo.nome && (
                  <Text style={styles.freelancerName}>{freelancerInfo.nome}</Text>
                )}
                {freelancerInfo.email && (
                  <Text style={styles.freelancerEmail}>{freelancerInfo.email}</Text>
                )}
              </View>
            </View>
          ) : null
        )}
        
        <Text style={styles.resumo}>{perfilNormalizado.resumo || 'Sem resumo'}</Text>

        <View style={styles.info}>
          {perfilNormalizado.valorHora && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Valor por Hora:</Text>
              <Text style={styles.infoValue}>{formatCurrency(perfilNormalizado.valorHora)}</Text>
            </View>
          )}
          {perfilNormalizado.dataUltimaAtualizacao && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Última Atualização:</Text>
              <Text style={styles.infoValue}>{formatDate(perfilNormalizado.dataUltimaAtualizacao)}</Text>
            </View>
          )}
        </View>

        {perfilNormalizado.habilidades && perfilNormalizado.habilidades.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades:</Text>
            <View style={styles.habilidades}>
              {perfilNormalizado.habilidades.map((habilidade, index) => (
                <View key={index} style={styles.habilidadeTag}>
                  <Text style={styles.habilidadeText}>{habilidade}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {perfil.links && Object.keys(perfil.links).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links:</Text>
            {Object.entries(perfil.links).map(([key, value]) => (
              <TouchableOpacity key={key} style={styles.link}>
                <Text style={styles.linkText}>{key}: {value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      <View style={styles.actions}>
        {(isAdmin || (user?.role === 'FREELANCER' && perfilNormalizado.idUsuario === user?.idUsuario)) && (
          <Button
            title="Editar"
            onPress={() => navigation.navigate('PerfilEdit', { id: perfilNormalizado.idPerfil })}
            variant="outline"
            style={styles.button}
          />
        )}
      </View>
    </ScrollView>
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
  resumo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  freelancerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  freelancerInfoText: {
    flex: 1,
  },
  freelancerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  freelancerEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
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
    backgroundColor: theme.colors.secondary,
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
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});

export default PerfilDetailsScreen;