import * as React from 'react';
import { cn } from '@/utils';
import { useInputHistory } from '@/hooks/useInputHistory';
import { Clock, X, Trash2 } from 'lucide-react';

interface InputWithHistoryProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  id: string; // ID do campo (será usado para identificar o histórico na API)
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface InputWithHistoryRef extends HTMLInputElement {
  reloadHistory: () => void;
}

export const InputWithHistory = React.forwardRef<HTMLInputElement, InputWithHistoryProps>(
  ({ className, id, value: externalValue, onValueChange, ...props }, ref) => {
    const {
      value: internalValue,
      setValue,
      suggestions,
      showSuggestions,
      setShowSuggestions,
      clearHistory,
      removeFromHistory,
      loading
    } = useInputHistory({ id });

    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const currentValue = externalValue !== undefined ? externalValue : internalValue;

    React.useImperativeHandle(ref, () => ({
      ...inputRef.current!
    }));

    React.useEffect(() => {
      if (externalValue !== undefined && externalValue !== internalValue) {
        setValue(externalValue);
      }
    }, [externalValue, setValue, internalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      setValue(newValue);

      onValueChange?.(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    const handleSuggestionClick = (e: React.MouseEvent, suggestion: { id: number; valueInput: string }) => {
      e.preventDefault();
      e.stopPropagation();

      // Fecha o modal imediatamente
      setShowSuggestions(false);

      // Atualiza o valor (passando false para não reabrir o modal)
      setValue(suggestion.valueInput, false);

      // Notifica o componente pai
      onValueChange?.(suggestion.valueInput);
    };

    const handleRemoveItem = (e: React.MouseEvent, item: { id: number; valueInput: string }) => {
      e.preventDefault();
      e.stopPropagation();
      removeFromHistory(item);
    };

    const handleFocus = () => {
      setValue(currentValue);
      setShowSuggestions(true);
    };

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowSuggestions]);

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={cn(
            'flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-base shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          {...props}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-80 overflow-hidden"
          >
            <div className="py-1">
              <div className="px-3 py-1 text-xs text-muted-foreground font-medium">
                Histórico Recente
              </div>
              {loading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Carregando histórico...
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="group relative flex items-center hover:bg-accent transition-colors"
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => handleSuggestionClick(e, suggestion)}
                      className="flex-1 px-3 py-2 text-left text-sm flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate">{suggestion.valueInput}</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => handleRemoveItem(e, suggestion)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-2 text-destructive hover:text-destructive/80 transition-opacity"
                      title="Remover do histórico"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
              <div className="border-t mt-1 pt-1">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clearHistory();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar Todo Histórico
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

InputWithHistory.displayName = 'InputWithHistory';
