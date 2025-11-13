import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import { habilidadeApi } from '../api/habilidadeApi';
import { Ionicons } from '@expo/vector-icons';
import Loading from './Loading';

const HabilidadesSelector = ({ selectedIds = [], onSelectionChange, label = 'Habilidades' }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selected, setSelected] = useState(selectedIds);

  // Sincronizar selectedIds quando mudar externamente (ex: quando carregar perfil/projeto)
  // Normalizar para garantir que sejam números
  React.useEffect(() => {
    if (selectedIds && Array.isArray(selectedIds)) {
      const normalized = selectedIds
        .map(id => {
          if (typeof id === 'number') return id;
          if (typeof id === 'string') return parseFloat(id);
          return null;
        })
        .filter(id => id !== null && !isNaN(id) && id > 0);
      setSelected(normalized);
    } else if (!selectedIds || selectedIds.length === 0) {
      setSelected([]);
    }
  }, [selectedIds]);

  // Buscar habilidades do banco de dados
  const {
    data: habilidadesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['habilidades'],
    queryFn: () => habilidadeApi.getAll(),
  });

  // Processar habilidades da API - garantir que IDs sejam sempre números
  const habilidades = React.useMemo(() => {
    if (!habilidadesData) return [];
    const habilidadesList = Array.isArray(habilidadesData) ? habilidadesData : (habilidadesData?.data || habilidadesData?.Data || []);
    return habilidadesList.map(h => {
      const id = h.idHabilidade || h.IdHabilidade || h.id || h.id_habilidade;
      const nome = h.nome || h.Nome || h.nmHabilidade || h.NmHabilidade || h.nome_habilidade || h;
      // Garantir que ID seja sempre número
      const idNumber = typeof id === 'number' ? id : (typeof id === 'string' ? parseFloat(id) : null);
      return { id: idNumber, nome };
    }).filter(h => h.id && !isNaN(h.id) && h.id > 0 && h.nome);
  }, [habilidadesData]);

  // Normalizar selectedIds para garantir que sejam números
  const selectedNumbers = React.useMemo(() => {
    return selected.map(id => {
      if (typeof id === 'number') return id;
      if (typeof id === 'string') return parseFloat(id);
      return null;
    }).filter(id => id !== null && !isNaN(id) && id > 0);
  }, [selected]);

  const toggleHabilidade = (id) => {
    // Garantir que id seja número
    const idNumber = typeof id === 'number' ? id : parseFloat(id);
    if (isNaN(idNumber) || idNumber <= 0) return;
    
    const newSelected = selectedNumbers.includes(idNumber)
      ? selectedNumbers.filter((selId) => selId !== idNumber)
      : [...selectedNumbers, idNumber];
    
    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  const renderHabilidade = ({ item }) => {
    // item.id já é número (garantido no useMemo acima)
    const isSelected = selectedNumbers.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.habilidadeChip,
          isSelected && styles.habilidadeChipSelected,
        ]}
        onPress={() => toggleHabilidade(item.id)}
      >
        <Text
          style={[
            styles.habilidadeText,
            isSelected && styles.habilidadeTextSelected,
          ]}
        >
          {item.nome}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.white}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Loading message="Carregando habilidades..." />
      </View>
    );
  }

  if (isError || habilidades.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.errorText}>
          Erro ao carregar habilidades. Tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>
        Selecione as habilidades relevantes ({selected.length} selecionadas)
      </Text>
      <FlatList
        data={habilidades}
        renderItem={renderHabilidade}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.sm,
  },
  habilidadeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  habilidadeChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habilidadeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontWeight: theme.fontWeight.medium,
  },
  habilidadeTextSelected: {
    color: theme.colors.white,
  },
  checkIcon: {
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
});

export default HabilidadesSelector;

