import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  version: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  sectionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  commitHash: {
    fontSize: theme.fontSize.md,
    fontFamily: 'monospace',
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
  },
});

const AboutScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // O hash do commit será obtido durante o build
  // Para desenvolvimento, usar uma versão padrão
  const commitHash = Constants.expoConfig?.extra?.commitHash || 'dev-1.0.0';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SkillSync</Text>
        <Text style={styles.version}>Versão 1.0.0</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o App</Text>
          <Text style={styles.sectionText}>
            SkillSync é uma plataforma de matchmaking entre freelancers e projetos utilizando Inteligência Artificial.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hash do Commit</Text>
          <Text style={styles.commitHash}>{commitHash}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvido para</Text>
          <Text style={styles.sectionText}>
            Global Solution - Mobile Application Development
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tecnologias</Text>
          <Text style={styles.sectionText}>
            • React Native com Expo{'\n'}
            • React Navigation{'\n'}
            • TanStack Query{'\n'}
            • Axios{'\n'}
            • AsyncStorage
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AboutScreen;
