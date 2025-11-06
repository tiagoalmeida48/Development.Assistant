/**
 * Utilitários para armazenamento seguro de dados sensíveis
 */

/**
 * Remove informações sensíveis de uma connection string
 * @param connectionString - String de conexão completa
 * @returns String de conexão sanitizada (sem senha)
 */
export function sanitizeConnectionString(connectionString: string): string {
  if (!connectionString) return connectionString;

  // Remove passwords de diferentes formatos
  let sanitized = connectionString;

  // SQL Server / : Password=xxx; ou Pwd=xxx;
  sanitized = sanitized.replace(/password\s*=\s*[^;]+;?/gi, 'Password=***;');
  sanitized = sanitized.replace(/pwd\s*=\s*[^;]+;?/gi, 'Pwd=***;');

  // PostgreSQL: password=xxx
  sanitized = sanitized.replace(/password\s*=\s*[^\s&]+/gi, 'password=***');

  // Oracle: /@password ou /password@
  sanitized = sanitized.replace(/\/[^@\/]+@/g, '/***@');

  // MongoDB: mongodb://user:password@
  sanitized = sanitized.replace(/:([^:@]+)@/g, ':***@');

  return sanitized;
}

/**
 * Verifica se uma string contém informações sensíveis
 * @param value - Valor a verificar
 * @returns true se contém dados sensíveis
 */
export function hasSensitiveData(value: string): boolean {
  if (!value) return false;

  const sensitivePatterns = [
    /password\s*=/i,
    /pwd\s*=/i,
    /token/i,
    /secret/i,
    /apikey/i,
    /api_key/i,
  ];

  return sensitivePatterns.some(pattern => pattern.test(value));
}

/**
 * Armazena valor de forma segura (sanitizado se necessário)
 * @param key - Chave do storage
 * @param value - Valor a armazenar
 * @param sanitize - Se deve sanitizar o valor
 */
export function secureSetItem(key: string, value: string, sanitize: boolean = true): void {
  try {
    const valueToStore = sanitize && hasSensitiveData(value)
      ? sanitizeConnectionString(value)
      : value;

    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Erro ao salvar item seguro "${key}":`, error);
  }
}

/**
 * Recupera valor do storage
 * @param key - Chave do storage
 * @returns Valor armazenado ou null
 */
export function secureGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Erro ao recuperar item seguro "${key}":`, error);
    return null;
  }
}

/**
 * Remove valor do storage
 * @param key - Chave do storage
 */
export function secureRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover item seguro "${key}":`, error);
  }
}

/**
 * Limpa todo o histórico de connection strings
 */
export function clearConnectionHistory(): void {
  try {
    const keys = Object.keys(localStorage);
    const connectionKeys = keys.filter(key =>
      key.includes('connection') ||
      key.includes('conn') ||
      key.includes('db')
    );

    connectionKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Erro ao limpar histórico de conexões:', error);
  }
}
