import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const Card = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return <View style={[styles.card, style]}>{children}</View>;
};

const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
});

export default Card;
