import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { perfilApi } from '../../api/perfilApi';
import { habilidadeApi } from '../../api/habilidadeApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import HabilidadesSelector from '../../components/HabilidadesSelector';

const PerfilEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  const [tituloProfissional, setTituloProfissional] = useState('');
  const [resumo, setResumo] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [errors, setErrors] = useState({});

  const {
    data: perfil,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['perfil', id],
    queryFn: () => perfilApi.getById(id),
  });

  // Buscar todas as habilidades disponíveis
  const {
    data: habilidadesData,
    isLoading: isLoadingHabilidades,
  } = useQuery({
    queryKey: ['habilidades'],
    queryFn: () => habilidadeApi.getAll(),
  });

  // Mapear nomes de habilidades para IDs
  const habilidadesMap = useMemo(() => {
    if (!habilidadesData) return new Map();
    const habilidadesList = Array.isArray(habilidadesData) 
      ? habilidadesData 
      : (habilidadesData?.data || habilidadesData?.Data || []);
    const map = new Map();
    habilidadesList.forEach(h => {
      const id = h.idHabilidade || h.IdHabilidade || h.id;
      const nome = h.nome || h.Nome || h.nmHabilidade || h.NmHabilidade;
      if (id && nome) {
        map.set(nome, id);
      }
    });
    return map;
  }, [habilidadesData]);

  useEffect(() => {
    if (perfil && habilidadesMap.size > 0) {
      setTituloProfissional(perfil.tituloProfissional || perfil.TituloProfissional || '');
      setResumo(perfil.resumo || perfil.Resumo || '');
      setValorHora((perfil.valorHora || perfil.ValorHora)?.toString() || '');
      
      // Converter nomes de habilidades para IDs (garantir que sejam números)
      const habilidadesNomes = perfil.habilidades || perfil.Habilidades || [];
      const habilidadesIds = habilidadesNomes
        .map(nome => {
          if (!nome) return null;
          const id = habilidadesMap.get(nome);
          if (id === undefined || id === null) return null;
          return typeof id === 'number' ? id : parseFloat(id);
        })
        .filter(id => id !== null && !isNaN(id) && id > 0);
      setHabilidades(habilidadesIds);
    } else if (perfil && !isLoadingHabilidades) {
      // Se o perfil está carregado mas habilidades ainda não, apenas atualizar outros campos
      setTituloProfissional(perfil.tituloProfissional || perfil.TituloProfissional || '');
      setResumo(perfil.resumo || perfil.Resumo || '');
      setValorHora((perfil.valorHora || perfil.ValorHora)?.toString() || '');
    }
  }, [perfil, habilidadesMap, isLoadingHabilidades]);

  const updateMutation = useMutation({
    mutationFn: (data) => perfilApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      queryClient.invalidateQueries({ queryKey: ['perfil', id] });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.'
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

    if (valorHora && isNaN(parseFloat(valorHora))) {
      newErrors.valorHora = 'Valor deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validate()) return;

    const data = {
      tituloProfissional,
      resumo,
      valorHora: valorHora ? parseFloat(valorHora) : undefined,
      habilidades: habilidades.length > 0 ? habilidades : undefined,
    };

    updateMutation.mutate(data);
  };

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
            title="Salvar Alterações"
            onPress={handleUpdate}
            loading={updateMutation.isLoading}
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
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});

export default PerfilEditScreen;