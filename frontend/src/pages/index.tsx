import { Link } from '@tanstack/react-router'

export default function HomePage() {
  const features = [
    {
      title: 'Comparar Bancos de Dados',
      description: 'Compare estruturas e dados entre dois bancos de dados',
      icon: '🗄️',
      href: '/compare-database' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
    },
    {
      title: 'Copiar Projeto',
      description: 'Copie projetos e renomeie namespaces automaticamente',
      icon: '📋',
      href: '/copy-project' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
    },
    {
      title: 'Gerar Classes POCO',
      description: 'Gere classes POCO e camadas completas de arquitetura',
      icon: '⚙️',
      href: '/poco-class' as const,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Development Assistant
        </h1>
        <p className="text-gray-600">
          Ferramentas de desenvolvimento para aumentar sua produtividade
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            to={feature.href}
            className="block"
          >
            <div className={`border-2 ${feature.borderColor} ${feature.bgColor} rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer h-full`}>
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className={`text-xl font-semibold mb-2 ${feature.textColor}`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <p className="text-sm text-gray-500">
                Clique para acessar →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Sobre a API GraphQL</h2>
        <p className="text-gray-600 mb-2">
          Esta aplicação utiliza uma API GraphQL moderna para todas as operações.
        </p>
        <p className="text-gray-600">
          Acesse <code className="bg-white px-2 py-1 rounded border">http://localhost:5000/graphql</code> para explorar o playground interativo.
        </p>
      </div>
    </div>
  )
}
