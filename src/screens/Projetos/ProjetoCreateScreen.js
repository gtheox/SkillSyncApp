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
import { projetoApi } from '../../api/projetoApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import HabilidadesSelector from '../../components/HabilidadesSelector';

const ProjetoCreateScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [habilidadesRequisitadas, setHabilidadesRequisitadas] = useState([]);
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => projetoApi.create(data),
    onSuccess: (projeto) => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      Alert.alert('Sucesso', 'Projeto criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ProjetoDetails', { id: projeto.idProjeto }),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao criar projeto. Tente novamente.'
      );
    },
  });

  const validate = () => {
    const newErrors = {};

    if (!titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (orcamento && isNaN(parseFloat(orcamento))) {
      newErrors.orcamento = 'Orçamento deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    const data = {
      titulo,
      descricao,
      orcamento: orcamento ? parseFloat(orcamento) : undefined,
      habilidadesRequisitadas: habilidadesRequisitadas.length > 0 ? habilidadesRequisitadas : undefined,
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
            label="Título"
            placeholder="Título do projeto"
            value={titulo}
            onChangeText={setTitulo}
            error={errors.titulo}
          />

          <Input
            label="Descrição"
            placeholder="Descrição do projeto"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            error={errors.descricao}
          />

          <Input
            label="Orçamento (opcional)"
            placeholder="0.00"
            value={orcamento}
            onChangeText={setOrcamento}
            keyboardType="decimal-pad"
            error={errors.orcamento}
          />

          <HabilidadesSelector
            label="Habilidades Requisitadas (opcional)"
            selectedIds={habilidadesRequisitadas}
            onSelectionChange={setHabilidadesRequisitadas}
          />

          <Button
            title="Criar Projeto"
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

export default ProjetoCreateScreen;