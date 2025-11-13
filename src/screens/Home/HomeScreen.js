import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { projetoApi } from '../../api/projetoApi';
import Card from '../../components/Card';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const isContratante = user?.role === 'CONTRATANTE';
  
  // Buscar projetos do usuário para exibir na HomeScreen (apenas contratantes)
  const {
    data: projetosData,
    isLoading: isLoadingProjetos,
  } = useQuery({
    queryKey: ['projetos'],
    queryFn: () => projetoApi.getAll(1, 100),
    enabled: isContratante,
  });
  
  // A API retorna PagedResponse com propriedade Data (maiúscula) ou array direto
  const projetos = projetosData?.Data || projetosData?.data || (Array.isArray(projetosData) ? projetosData : []);
  const meusProjetos = projetos.filter(p => p.idUsuarioContratante === user?.idUsuario);

  const handleLogout = async () => {
    Alert.alert(
      'Confirmar logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  const isFreelancer = user?.role === 'FREELANCER';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons 
              name={isFreelancer ? 'person' : isContratante ? 'business' : 'person-circle'} 
              size={36} 
              color={theme.colors.white} 
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Olá, {(() => {
                // Usar o nome do usuário se existir e for válido
                if (user?.nome && user.nome.trim() && user.nome.trim().length > 0) {
                  const nomeCompleto = user.nome.trim();
                  // Pegar primeiro nome
                  const firstName = nomeCompleto.split(' ')[0];
                  // Verificar se o primeiro nome não é igual à primeira parte do email
                  const emailPart = user?.email?.split('@')[0] || '';
                  if (firstName.toLowerCase() !== emailPart.toLowerCase() || nomeCompleto.split(' ').length > 1) {
                    return firstName;
                  }
                }
                // Fallback: usar email se não tiver nome válido
                const emailPart = user?.email?.split('@')[0] || 'Usuário';
                // Capitalizar primeira letra
                return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase();
              })()}!
            </Text>
            <Text style={styles.subtitle}>
              {isFreelancer
                ? 'Encontre projetos ideais para você'
                : isContratante
                ? 'Encontre freelancers ideais para seus projetos'
                : 'Bem-vindo ao SkillSync'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Card de boas-vindas */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeIconContainer}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="sparkles" size={40} color={theme.colors.primary} />
          </View>
        </View>
        <Text style={styles.cardTitle}>Bem-vindo ao SkillSync</Text>
        <Text style={styles.cardText}>
          Plataforma de matchmaking entre freelancers e projetos usando Inteligência Artificial.
        </Text>
      </View>

      {/* Card de Matchmaking para Contratantes */}
      {isContratante && meusProjetos.length > 0 && (
        <View style={styles.matchCard}>
          <View style={styles.matchCardHeader}>
            <View style={styles.matchCardIcon}>
              <Ionicons name="star" size={36} color={theme.colors.white} />
            </View>
            <View style={styles.matchCardContent}>
              <Text style={styles.matchCardTitle}>Gerar Matches</Text>
              <Text style={styles.matchCardSubtitle}>
                Encontre os melhores freelancers para seus projetos usando IA
              </Text>
            </View>
          </View>
          <View style={styles.matchCardProjects}>
            <Text style={styles.matchCardProjectsTitle}>Seus Projetos:</Text>
            {meusProjetos.slice(0, 3).map((projeto) => (
              <View key={projeto.idProjeto} style={styles.matchProjectItem}>
                <Ionicons name="briefcase-outline" size={20} color={theme.colors.white} />
                <TouchableOpacity
                  style={styles.matchProjectTextContainer}
                  onPress={() => {
                    navigation.navigate('ProjetosTab', {
                      screen: 'ProjetoDetails',
                      params: { id: projeto.idProjeto },
                    });
                  }}
                >
                  <Text style={styles.matchProjectText} numberOfLines={1}>
                    {projeto.titulo}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.matchButton}
                  onPress={() => {
                    navigation.navigate('ProjetosTab', {
                      screen: 'ProjetoDetails',
                      params: { id: projeto.idProjeto },
                    });
                  }}
                >
                  <Ionicons name="star" size={16} color={theme.colors.accent} />
                  <Text style={styles.matchButtonText}>Match</Text>
                </TouchableOpacity>
              </View>
            ))}
            {meusProjetos.length > 3 && (
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => navigation.navigate('ProjetosTab')}
              >
                <Text style={styles.seeMoreText}>
                  Ver todos os {meusProjetos.length} projetos
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>Funcionalidades</Text>
        
        {isContratante && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProjetosTab')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight + '20' }]}>
              <Ionicons name="briefcase" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Meus Projetos</Text>
              <Text style={styles.actionText}>
                {meusProjetos.length > 0 
                  ? `${meusProjetos.length} projeto${meusProjetos.length > 1 ? 's' : ''} cadastrado${meusProjetos.length > 1 ? 's' : ''}`
                  : 'Gerenciar e criar novos projetos'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}

        {isFreelancer && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('PerfisTab', { screen: 'MeuPerfil' })}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
              <Ionicons name="person-circle" size={32} color={theme.colors.secondary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Meu Perfil</Text>
              <Text style={styles.actionText}>
                Gerenciar seu perfil profissional
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}

        {!isFreelancer && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('PerfisTab')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
              <Ionicons name="people" size={32} color={theme.colors.secondary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Perfis de Freelancers</Text>
              <Text style={styles.actionText}>
                Ver perfis de freelancers disponíveis
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}

        {!isContratante && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProjetosTab')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight + '20' }]}>
              <Ionicons name="folder-open" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Projetos Disponíveis</Text>
              <Text style={styles.actionText}>
                Ver projetos disponíveis
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('DicasTab')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.accent + '20' }]}>
            <Ionicons name="bulb" size={32} color={theme.colors.accent} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Dicas de IA</Text>
            <Text style={styles.actionText}>
              Dicas geradas por inteligência artificial
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('About')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
            <Ionicons name="information-circle" size={32} color={theme.colors.info} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Sobre o App</Text>
            <Text style={styles.actionText}>
              Informações do aplicativo
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: theme.colors.primary,
    ...theme.shadow.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: theme.fontWeight.medium,
  },
  logoutButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  welcomeIconContainer: {
    marginBottom: theme.spacing.md,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  cardText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 24,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    marginTop: 0,
    ...theme.shadow.lg,
  },
  matchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  matchCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  matchCardContent: {
    flex: 1,
  },
  matchCardTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  matchCardSubtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
  },
  matchCardProjects: {
    marginTop: theme.spacing.md,
  },
  matchCardProjectsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  matchProjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  matchProjectTextContainer: {
    flex: 1,
  },
  matchProjectText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  matchButtonText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  seeMoreText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
  actions: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
});

export default HomeScreen;