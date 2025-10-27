# Development Assistant - Frontend React

## 🚀 Stack Tecnológica 2025

Este projeto utiliza as tecnologias mais modernas do ecossistema React:

### Core
- **React 19** - Última versão com Server Components support
- **TypeScript 5.7** - Type-safety completo
- **Vite 6** - Build tool ultra-rápido com HMR

### UI & Styling
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Componentes acessíveis e customizáveis
- **lucide-react** - Ícones modernos
- **class-variance-authority** - Gerenciamento de variantes de componentes

### Routing & Data Fetching
- **TanStack Router v1.99** - Type-safe routing com file-based routing
- **TanStack Query v5.62** - Server state management assíncrono

### State Management
- **Zustand v5** - State management minimalista e performático

### API
- **GraphQL Request** - Cliente GraphQL leve
- **graphql** - Core GraphQL

## 📁 Estrutura do Projeto

```
wwwroot/
├── src/
│   ├── api/                  # Clientes GraphQL
│   │   └── graphql-client.ts # Queries e mutations
│   ├── components/
│   │   └── ui/              # Componentes shadcn/ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── lib/
│   │   └── utils.ts         # Utilitários (cn helper)
│   ├── pages/               # Páginas da aplicação
│   │   ├── index.tsx        # Home
│   │   ├── compare-database.tsx
│   │   ├── copy-project.tsx
│   │   └── poco-class.tsx
│   ├── stores/              # Zustand stores
│   │   └── useAppStore.ts   # Store global
│   ├── styles/
│   │   └── globals.css      # Estilos globais + Tailwind
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── main.tsx             # Entry point
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── postcss.config.js
```

## 🎯 Funcionalidades Implementadas

### ✅ Já Implementado

1. **Configuração Base**
   - Vite + React + TypeScript
   - TailwindCSS v4 com tema dark/light
   - shadcn/ui components (Button, Card, Input)
   - Zustand store configurado

2. **API GraphQL**
   - Cliente GraphQL configurado
   - Queries: compareDatabases, getTables, databaseTypes
   - Mutations: createPocoClass, copyProject

3. **Types TypeScript**
   - Interfaces completas para todas as entidades
   - Enum DbType
   - Types para resultados de API

4. **Página Home**
   - Cards com links para funcionalidades
   - Design moderno e responsivo

### 🚧 Próximos Passos

1. **Criar Páginas Restantes**:
   - `src/pages/compare-database.tsx`
   - `src/pages/copy-project.tsx`
   - `src/pages/poco-class.tsx`

2. **Configurar TanStack Router**:
   - Criar `src/router.tsx`
   - Configurar rotas
   - Adicionar layout principal

3. **Criar componentes UI adicionais**:
   - Table component
   - Select component
   - Toast/Alert component
   - Loading spinner

4. **Integrar TanStack Query**:
   - Hooks personalizados para queries
   - Cache configuration
   - Optimistic updates

## 🛠️ Instalação e Uso

### Instalação de Dependências

```bash
cd wwwroot
yarn install
```

### Desenvolvimento

```bash
yarn dev
```

Abre em: `http://localhost:3000`

### Build para Produção

```bash
yarn build
```

Output em: `../dist/`

### Lint

```bash
yarn lint
```

## 📝 Exemplo de Implementação - Compare Database Page

```typescript
// src/pages/compare-database.tsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { graphqlClient, graphqlQueries } from '@/api/graphql-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DbType, DatabaseComparisonResult } from '@/types'
import { useAppStore } from '@/stores/useAppStore'

export default function CompareDatabasePage() {
  const [connectionString1, setConnectionString1] = useState('')
  const [connectionString2, setConnectionString2] = useState('')
  const { selectedDbType, setIsLoading, showToast } = useAppStore()

  const compareMutation = useMutation({
    mutationFn: async (variables: {
      connectionString1: string
      connectionString2: string
      dbType: DbType
    }) => {
      return graphqlClient.request<{ compareDatabases: DatabaseComparisonResult }>(
        graphqlQueries.compareDatabases,
        variables
      )
    },
    onSuccess: (data) => {
      showToast('Comparação concluída com sucesso!', 'success')
      // Handle success
    },
    onError: (error) => {
      showToast(`Erro: ${error.message}`, 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    compareMutation.mutate({
      connectionString1,
      connectionString2,
      dbType: selectedDbType,
    })
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Comparar Bancos de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Connection String 1"
              value={connectionString1}
              onChange={(e) => setConnectionString1(e.target.value)}
              required
            />
            <Input
              placeholder="Connection String 2"
              value={connectionString2}
              onChange={(e) => setConnectionString2(e.target.value)}
              required
            />
            <Button type="submit" disabled={compareMutation.isPending}>
              {compareMutation.isPending ? 'Comparando...' : 'Comparar'}
            </Button>
          </form>

          {compareMutation.data && (
            <div className="mt-6">
              {/* Render comparison results */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

## 🎨 Personalização de Tema

Edite `src/styles/globals.css` para alterar cores do tema:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  /* Outros tokens de cor */
}
```

## 📚 Recursos Úteis

- [Vite Documentation](https://vite.dev/)
- [React 19 Docs](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [TailwindCSS](https://tailwindcss.com/)

## 🔧 Configuração do Backend

O frontend está configurado para se conectar ao GraphQL endpoint em:
- Desenvolvimento: `/graphql` (proxy configurado no Vite)
- Produção: Configurar `VITE_GRAPHQL_URL` no `.env`

## 📦 Componentes shadcn/ui Disponíveis

Para adicionar mais componentes:

```bash
# Exemplo: adicionar Select component
npx shadcn@latest add select
```

Componentes recomendados para este projeto:
- `select` - Para selecionar DbType
- `table` - Para mostrar resultados de comparação
- `toast` - Para notificações
- `dialog` - Para modals
- `badge` - Para tags/status
- `skeleton` - Para loading states

## 🚀 Deploy

### Build
```bash
yarn build
```

### Servir com ASP.NET Core
O Vite está configurado para fazer build em `../dist/`, que pode ser servido estaticamente pelo ASP.NET Core.

Adicione ao `Program.cs`:
```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

## 📄 Licença

Este projeto faz parte do Development Assistant.
