// Tema Light (padrão)
export const lightTheme = {
  colors: {
    primary: '#4F46E5', // Indigo
    primaryDark: '#4338CA',
    primaryLight: '#6366F1',
    secondary: '#10B981', // Green
    secondaryDark: '#059669',
    accent: '#F59E0B', // Amber
    background: '#FFFFFF',
    backgroundLight: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceLight: '#F3F4F6',
    text: '#111827',
    textLight: '#6B7280',
    textDark: '#374151',
    border: '#E5E7EB',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// Tema Dark
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    background: '#111827',
    backgroundLight: '#1F2937',
    surface: '#1F2937',
    surfaceLight: '#374151',
    text: '#F9FAFB',
    textLight: '#D1D5DB',
    textDark: '#F3F4F6',
    border: '#374151',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#78350F',
    info: '#3B82F6',
    infoLight: '#1E3A8A',
  },
};

// Exportar tema padrão
export default lightTheme;
