import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/api';

interface HistoryItem {
  id: number;
  valueInput: string;
}

interface UseInputHistoryOptions {
  id: string; // ID do campo para identificar o histórico
}

/**
 * Hook customizado para gerenciar histórico de inputs com autocomplete via API
 * @param options - Configurações do histórico
 * @returns Objeto com valor, histórico, sugestões e funções de controle
 */
export function useInputHistory(options: UseInputHistoryOptions) {
  const { id } = options;
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<HistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef(false); // Flag para evitar reabrir modal ao selecionar

  // Carrega histórico do backend com filtro opcional
  const loadHistory = useCallback(async (filterValue?: string) => {
    try {
      setLoading(true);
      const data = await api.inputHistory.getAll(id, filterValue);
      const historyItems: HistoryItem[] = data.map(item => ({
        id: item.id,
        valueInput: item.valueInput
      }));
      setSuggestions(historyItems);
    } catch (error) {
      console.error('Erro ao carregar histórico da API:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Carrega histórico inicial (sem filtro)
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Atualiza sugestões quando o valor muda (com debounce)
  useEffect(() => {
    // Limpa o timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Se o valor está vazio, carrega todos os itens
    if (!value.trim()) {
      loadHistory();
      return;
    }

    // Debounce de 300ms para não fazer muitas requisições
    debounceTimerRef.current = setTimeout(() => {
      loadHistory(value.trim());
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, loadHistory]);

  // Atualiza sugestões baseado no input
  const handleInputChange = useCallback((newValue: string, shouldOpenSuggestions = true) => {
    setValue(newValue);
    // Abre o modal ao digitar se houver conteúdo e não estiver selecionando
    if (newValue.trim() && shouldOpenSuggestions && !isSelectingRef.current) {
      setShowSuggestions(true);
    }
    // Reset flag após um pequeno delay
    if (isSelectingRef.current) {
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
    }
  }, []);

  // Seleciona uma sugestão (não usado mais, mantido para compatibilidade)
  const selectSuggestion = useCallback((suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
  }, []);

  // Limpa histórico
  const clearHistory = useCallback(async () => {
    try {
      if (suggestions.length > 0) {
        const ids = suggestions.map(item => item.id);
        await api.inputHistory.delete(ids);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Erro ao limpar histórico na API:', error);
    }
  }, [suggestions]);

  // Remove um item específico do histórico
  const removeFromHistory = useCallback(async (itemToRemove: HistoryItem) => {
    try {
      await api.inputHistory.delete([itemToRemove.id]);

      // Atualiza estado local após remoção bem-sucedida
      setSuggestions(prev => prev.filter(item => item.id !== itemToRemove.id));
    } catch (error) {
      console.error('Erro ao remover item da API:', error);
    }
  }, []);

  return {
    value,
    setValue: handleInputChange,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    clearHistory,
    removeFromHistory,
    loadHistory: () => loadHistory(), // Recarrega sem filtro
    loading
  };
}
