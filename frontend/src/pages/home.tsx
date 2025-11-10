import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
} from '@mui/material'
import {
  Storage as DatabaseIcon,
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  People as UsersIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'

export default function HomePage() {
  const features = [
    {
      title: 'Comparar Bancos de Dados',
      description: 'Compare estruturas e dados entre dois bancos',
      icon: DatabaseIcon,
      href: '/compare-database' as const,
      color: '#2563eb',
    },
    {
      title: 'Copiar Projeto',
      description: 'Copie projetos e renomeie namespaces',
      icon: CopyIcon,
      href: '/copy-project' as const,
      color: '#8b5cf6',
    },
    {
      title: 'Gerar Classes',
      description: 'Gere classes e camadas de arquitetura',
      icon: CodeIcon,
      href: '/generate-class' as const,
      color: '#10b981',
    },
    {
      title: 'Usuários',
      description: 'Gerencie os usuários do sistema',
      icon: UsersIcon,
      href: '/users' as const,
      color: '#f59e0b',
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ferramentas de desenvolvimento para aumentar sua produtividade
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.href} to={feature.href} style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: feature.color,
                      width: 56,
                      height: 56,
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ fontSize: 32 }} />
                  </Avatar>

                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" fontWeight={600} color="primary">
                      Acessar ferramenta
                    </Typography>
                    <ArrowIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </Box>
    </Container>
  )
}
