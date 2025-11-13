import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { perfilApi } from '../../api/perfilApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import HabilidadesSelector from '../../components/HabilidadesSelector';

const PerfilCreateScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  const [tituloProfissional, setTituloProfissional] = useState('');
  const [resumo, setResumo] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => perfilApi.create(data),
    onSuccess: (perfil) => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      Alert.alert('Sucesso', 'Perfil criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('PerfilDetails', { id: perfil.idPerfil }),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao criar perfil. Tente novamente.'
      );
    },
  });

  const validate = () => {
    const newErrors = {};

    if (!tituloProfissional.trim()) {
      newErrors.tituloProfissional = 'Título profissional é obrigatório';
    }

    if (!resumo.trim()) {
      newErrors.resumo = 'Resumo é obrigatório';
    }

    if (!valorHora.trim()) {
      newErrors.valorHora = 'Valor por hora é obrigatório';
    } else if (isNaN(parseFloat(valorHora))) {
      newErrors.valorHora = 'Valor deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    const data = {
      tituloProfissional,
      resumo,
      valorHora: parseFloat(valorHora),
      habilidades: habilidades.length > 0 ? habilidades : undefined,
    };

    createMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Input
            label="Título Profissional"
            placeholder="Ex: Desenvolvedor Full Stack"
            value={tituloProfissional}
            onChangeText={setTituloProfissional}
            error={errors.tituloProfissional}
          />

          <Input
            label="Resumo"
            placeholder="Descreva sua experiência profissional"
            value={resumo}
            onChangeText={setResumo}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            error={errors.resumo}
          />

          <Input
            label="Valor por Hora"
            placeholder="0.00"
            value={valorHora}
            onChangeText={setValorHora}
            keyboardType="decimal-pad"
            error={errors.valorHora}
          />

          <HabilidadesSelector
            label="Habilidades"
            selectedIds={habilidades}
            onSelectionChange={setHabilidades}
          />

          <Button
            title="Criar Perfil"
            onPress={handleCreate}
            loading={createMutation.isLoading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

export default PerfilCreateScreen;