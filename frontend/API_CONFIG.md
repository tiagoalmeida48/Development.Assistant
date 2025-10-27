# 📡 Configuração da API - Development Assistant

## 📍 Localização dos Arquivos

- **Configuração TypeScript**: `src/config/api.ts`
- **Cliente GraphQL**: `src/api/graphql-client.ts`
- **Variáveis de Ambiente**:
  - `.env` - Configuração local (não commitado)
  - `.env.example` - Template de exemplo
  - `.env.development` - Configurações de desenvolvimento
  - `.env.production` - Configurações de produção

## 🔧 Como Funciona

O endpoint da API é definido dinamicamente através de variáveis de ambiente:

```typescript
// src/config/api.ts
export const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || '/graphql'
```

### Ordem de Prioridade:

1. **VITE_GRAPHQL_URL** (definida no `.env`)
2. **Fallback**: `/graphql` (proxy do Vite em dev, ASP.NET em prod)

## 🌍 Ambientes

### Desenvolvimento Local

**Opção 1: Usar Proxy do Vite (Recomendado)**

```env
# .env ou .env.development
VITE_GRAPHQL_URL=/graphql
```

O `vite.config.ts` faz proxy automático:
```typescript
proxy: {
  '/graphql': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

**Opção 2: Conectar Diretamente ao Backend**

```env
VITE_GRAPHQL_URL=http://localhost:5000/graphql
```

**Opção 3: HTTPS Local**

```env
VITE_GRAPHQL_URL=https://localhost:44304/graphql
```

### Produção

```env
# .env.production
VITE_GRAPHQL_URL=/graphql
```

Em produção, `/graphql` é servido pelo ASP.NET Core automaticamente.

## 🚀 Como Usar

### 1. Copiar Template

```bash
cd frontend
cp .env.example .env
```

### 2. Editar Configurações

Edite o arquivo `.env` com as configurações desejadas:

```env
# Para desenvolvimento local
VITE_GRAPHQL_URL=/graphql
```

### 3. Iniciar Desenvolvimento

```bash
yarn dev
```

### 4. Build para Produção

```bash
yarn build
```

## 📝 Exemplo de Uso no Código

```typescript
import { API_CONFIG } from '@/config/api'

console.log('API Endpoint:', API_CONFIG.endpoint)
console.log('Environment:', API_CONFIG.isDevelopment ? 'dev' : 'prod')
console.log('Timeout:', API_CONFIG.timeout)
```

## 🔍 Debug

Em modo de desenvolvimento, as configurações são logadas no console:

```
🔧 API Configuration: {
  endpoint: '/graphql',
  environment: 'development'
}
```

## ⚠️ Importante

- **NÃO commitar** o arquivo `.env` (já está no `.gitignore`)
- **Sempre commitar** o `.env.example` atualizado
- Em produção, usar sempre `/graphql` (path relativo)
- O ASP.NET Core serve os arquivos estáticos e a API no mesmo domínio

## 🛠️ Troubleshooting

### Erro: "Network Error" ou "Failed to fetch"

**Causa**: URL da API incorreta

**Solução**:
1. Verificar se o backend está rodando (`dotnet run`)
2. Confirmar a porta no `.env` (5000 ou 44304)
3. Verificar CORS no `Program.cs`

### Erro: "404 Not Found" em /graphql

**Causa**: Backend não está rodando ou rota incorreta

**Solução**:
1. Iniciar o backend: `dotnet run`
2. Acessar http://localhost:5000/graphql no navegador
3. Verificar se o GraphQL está configurado no `Program.cs`

### Em produção, API não responde

**Causa**: Path absoluto em vez de relativo

**Solução**:
```env
# ❌ Errado
VITE_GRAPHQL_URL=http://localhost:5000/graphql

# ✅ Correto
VITE_GRAPHQL_URL=/graphql
```

## 📚 Referências

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GraphQL Request](https://github.com/jasonkuhrt/graphql-request)
- [ASP.NET Core Static Files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files)
