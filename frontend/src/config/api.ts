/**
 * Configuração da API
 *
 * Este arquivo gerencia o endpoint da API GraphQL de forma dinâmica:
 * - Em desenvolvimento: usa a variável de ambiente VITE_GRAPHQL_URL ou fallback para /graphql
 * - Em produção: usa /graphql (servido pelo ASP.NET Core)
 */

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

/**
 * Valida e normaliza a URL do endpoint
 * GraphQL Client precisa de URL absoluta, então convertemos paths relativos
 */
function getValidEndpoint(): string {
  let endpoint = import.meta.env.VITE_GRAPHQL_URL || '/graphql'

  // Remove trailing slashes
  endpoint = endpoint.replace(/\/$/, '')

  // Se for uma URL relativa, converter para absoluta usando window.location
  if (!endpoint.startsWith('http')) {
    // Garantir que começa com /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint
    }

    // Converter para URL absoluta
    // Em browser, window.location.origin sempre existe
    if (typeof window !== 'undefined') {
      endpoint = window.location.origin + endpoint
    }
  }

  // Validar URL completa
  try {
    new URL(endpoint)
  } catch (error) {
    console.error('❌ URL inválida configurada:', endpoint)
    const fallback = typeof window !== 'undefined'
      ? window.location.origin + '/graphql'
      : '/graphql'
    console.error('Usando fallback:', fallback)
    return fallback
  }

  return endpoint
}

/**
 * URL base da API GraphQL
 *
 * Prioridade:
 * 1. VITE_GRAPHQL_URL definida no .env
 * 2. /graphql (proxy do Vite em dev ou ASP.NET em prod)
 */
export const GRAPHQL_ENDPOINT = getValidEndpoint()

/**
 * Configurações adicionais da API
 */
export const API_CONFIG = {
  endpoint: GRAPHQL_ENDPOINT,
  isDevelopment,
  isProduction,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Log da configuração atual
 */
console.log('🔧 API Configuration:', {
  endpoint: API_CONFIG.endpoint,
  environment: isDevelopment ? 'development' : 'production',
  mode: import.meta.env.MODE,
  envValue: import.meta.env.VITE_GRAPHQL_URL || '(não definido, usando fallback)'
})

// Validar endpoint no startup
if (API_CONFIG.endpoint.startsWith('http')) {
  console.log('✅ GraphQL Endpoint:', API_CONFIG.endpoint)
} else {
  console.log('⚠️ Endpoint inválido:', API_CONFIG.endpoint)
}

export default API_CONFIG
