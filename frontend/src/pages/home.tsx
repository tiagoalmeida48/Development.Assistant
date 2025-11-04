import { Link } from 'react-router-dom'
import { Database, Copy, Code2 } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      title: 'Comparar Bancos de Dados',
      description: 'Compare estruturas e dados entre dois bancos',
      icon: Database,
      href: '/compare-database' as const,
    },
    {
      title: 'Copiar Projeto',
      description: 'Copie projetos e renomeie namespaces',
      icon: Copy,
      href: '/copy-project' as const,
    },
    {
      title: 'Gerar Classes',
      description: 'Gere classes e camadas de arquitetura',
      icon: Code2,
      href: 'generate-class' as const,
    },
  ]

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6 text-secondary-foreground text-center">
        <h1>Ferramentas de desenvolvimento para aumentar sua produtividade</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.href}
              to={feature.href}
              className="block group"
            >
              <div className="border-2 border-border bg-card rounded-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full transform hover:scale-[1.03] hover:-translate-y-1">
                <div className="bg-secondary w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <div className="text-xs font-medium text-card-foreground flex items-center gap-1.5">
                  Acessar ferramenta
                  <span className="inline-block transition-transform group-hover:translate-x-2">→</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
