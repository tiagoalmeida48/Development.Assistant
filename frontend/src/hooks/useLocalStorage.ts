import { useState, useEffect } from 'react';

/**
 * Hook customizado para sincronizar estado do React com localStorage
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial caso não exista no localStorage
 * @returns [valor, função para atualizar valor]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicializa o estado a partir do localStorage ou valor inicial
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Atualiza localStorage quando o valor muda
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
