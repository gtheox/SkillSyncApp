import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import HomeScreen from '../screens/Home/HomeScreen';
import ProjetosScreen from '../screens/Projetos/ProjetosScreen';
import ProjetoDetailsScreen from '../screens/Projetos/ProjetoDetailsScreen';
import ProjetoCreateScreen from '../screens/Projetos/ProjetoCreateScreen';
import ProjetoEditScreen from '../screens/Projetos/ProjetoEditScreen';
import PerfisScreen from '../screens/Perfis/PerfisScreen';
import PerfilDetailsScreen from '../screens/Perfis/PerfilDetailsScreen';
import PerfilCreateScreen from '../screens/Perfis/PerfilCreateScreen';
import PerfilEditScreen from '../screens/Perfis/PerfilEditScreen';
import MeuPerfilScreen from '../screens/Perfis/MeuPerfilScreen';
import DicasScreen from '../screens/Dicas/DicasScreen';
import MatchesScreen from '../screens/Matches/MatchesScreen';
import AboutScreen from '../screens/Home/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de Projetos
const ProjetosStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProjetosList"
        component={ProjetosScreen}
        options={{ title: 'Projetos' }}
      />
      <Stack.Screen
        name="ProjetoDetails"
        component={ProjetoDetailsScreen}
        options={{ title: 'Detalhes do Projeto' }}
      />
      <Stack.Screen
        name="ProjetoCreate"
        component={ProjetoCreateScreen}
        options={{ title: 'Criar Projeto' }}
      />
      <Stack.Screen
        name="ProjetoEdit"
        component={ProjetoEditScreen}
        options={{ title: 'Editar Projeto' }}
      />
      <Stack.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ title: 'Matches Encontrados' }}
      />
    </Stack.Navigator>
  );
};

// Stack de Perfis
const PerfisStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PerfisList"
        component={PerfisScreen}
        options={{ title: 'Perfis' }}
      />
      <Stack.Screen
        name="PerfilDetails"
        component={PerfilDetailsScreen}
        options={{ title: 'Detalhes do Perfil' }}
      />
      <Stack.Screen
        name="PerfilCreate"
        component={PerfilCreateScreen}
        options={{ title: 'Criar Perfil' }}
      />
      <Stack.Screen
        name="PerfilEdit"
        component={PerfilEditScreen}
        options={{ title: 'Editar Perfil' }}
      />
      <Stack.Screen
        name="MeuPerfil"
        component={MeuPerfilScreen}
        options={{ title: 'Meu Perfil' }}
      />
    </Stack.Navigator>
  );
};

// Stack de Dicas
const DicasStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DicasList"
        component={DicasScreen}
        options={{ title: 'Dicas' }}
      />
    </Stack.Navigator>
  );
};

// Stack de Home
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Sobre o App' }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          ...theme.shadow.md,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textDark,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.bold,
          fontSize: theme.fontSize.lg,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProjetosTab"
        component={ProjetosStack}
        options={{
          title: 'Projetos',
          tabBarLabel: 'Projetos',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfisTab"
        component={PerfisStack}
        options={{
          title: 'Perfis',
          tabBarLabel: 'Perfis',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DicasTab"
        component={DicasStack}
        options={{
          title: 'Dicas',
          tabBarLabel: 'Dicas',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
