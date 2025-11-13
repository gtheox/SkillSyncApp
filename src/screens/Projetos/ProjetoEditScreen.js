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
import { projetoApi } from '../../api/projetoApi';
import { habilidadeApi } from '../../api/habilidadeApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import HabilidadesSelector from '../../components/HabilidadesSelector';

const ProjetoEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [status, setStatus] = useState('ABERTO');
  const [habilidadesRequisitadas, setHabilidadesRequisitadas] = useState([]);
  const [errors, setErrors] = useState({});

  const {
    data: projeto,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['projeto', id],
    queryFn: () => projetoApi.getById(id),
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
    if (projeto && habilidadesMap.size > 0) {
      setTitulo(projeto.titulo || projeto.Titulo || '');
      setDescricao(projeto.descricao || projeto.Descricao || '');
      setOrcamento((projeto.orcamento || projeto.Orcamento)?.toString() || '');
      setStatus(projeto.status || projeto.Status || 'ABERTO');
      
      // Converter nomes de habilidades para IDs (garantir que sejam números)
      const habilidadesNomes = projeto.habilidadesRequisitadas || projeto.HabilidadesRequisitadas || [];
      const habilidadesIds = habilidadesNomes
        .map(nome => {
          if (!nome) return null;
          const id = habilidadesMap.get(nome);
          if (id === undefined || id === null) return null;
          return typeof id === 'number' ? id : parseFloat(id);
        })
        .filter(id => id !== null && !isNaN(id) && id > 0);
      setHabilidadesRequisitadas(habilidadesIds);
    } else if (projeto && !isLoadingHabilidades) {
      // Se o projeto está carregado mas habilidades ainda não, apenas atualizar outros campos
      setTitulo(projeto.titulo || projeto.Titulo || '');
      setDescricao(projeto.descricao || projeto.Descricao || '');
      setOrcamento((projeto.orcamento || projeto.Orcamento)?.toString() || '');
      setStatus(projeto.status || projeto.Status || 'ABERTO');
    }
  }, [projeto, habilidadesMap, isLoadingHabilidades]);

  const updateMutation = useMutation({
    mutationFn: (data) => projetoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['projeto', id] });
      Alert.alert('Sucesso', 'Projeto atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao atualizar projeto. Tente novamente.'
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

  const handleUpdate = () => {
    if (!validate()) return;

    const data = {
      titulo,
      descricao,
      orcamento: orcamento ? parseFloat(orcamento) : undefined,
      status,
      habilidadesRequisitadas: habilidadesRequisitadas.length > 0 ? habilidadesRequisitadas : undefined,
    };

    updateMutation.mutate(data);
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
            label="Orçamento"
            placeholder="0.00"
            value={orcamento}
            onChangeText={setOrcamento}
            keyboardType="decimal-pad"
            error={errors.orcamento}
          />

          <Input
            label="Status"
            placeholder="ABERTO, EM_ANDAMENTO, CONCLUIDO, CANCELADO"
            value={status}
            onChangeText={setStatus}
          />

          <HabilidadesSelector
            label="Habilidades Requisitadas (opcional)"
            selectedIds={habilidadesRequisitadas}
            onSelectionChange={setHabilidadesRequisitadas}
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

export default ProjetoEditScreen;