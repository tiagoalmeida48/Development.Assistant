import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Home, Database, Copy, Code2 } from 'lucide-react'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              Development Assistant
            </Link>
            <div className="flex gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/compare-database"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                <Database className="h-4 w-4" />
                Comparar BD
              </Link>
              <Link
                to="/copy-project"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                <Copy className="h-4 w-4" />
                Copiar Projeto
              </Link>
              <Link
                to="/poco-class"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                <Code2 className="h-4 w-4" />
                POCO Classes
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
