// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { graphqlClient, graphqlMutations } from '@/api/graphql-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Copy, Loader2, FolderInput, FolderOutput } from 'lucide-react'

function CopyProjectPage() {
  const [sourceProjectPath, setSourceProjectPath] = useState('')
  const [destinationProjectPath, setDestinationProjectPath] = useState('')
  const [oldNamespace, setOldNamespace] = useState('')
  const [newNamespace, setNewNamespace] = useState('')

  const copyMutation = useMutation({
    mutationFn: async (variables) => {
      return await graphqlClient.request(graphqlMutations.copyProject, variables)
    },
  })

  const handleCopy = () => {
    if (!sourceProjectPath || !destinationProjectPath || !oldNamespace || !newNamespace) {
      alert('Preencha todos os campos')
      return
    }

    copyMutation.mutate({
      sourceProjectPath,
      destinationProjectPath,
      oldNamespace,
      newNamespace,
    })
  }

  const handleReset = () => {
    setSourceProjectPath('')
    setDestinationProjectPath('')
    setOldNamespace('')
    setNewNamespace('')
    copyMutation.reset()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Copiar Projeto</h1>
        <p className="text-gray-600">
          Copie projetos completos e renomeie namespaces automaticamente
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuração da Cópia</CardTitle>
          <CardDescription>
            Informe os caminhos e namespaces para realizar a cópia do projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sourcePath" className="flex items-center gap-2">
                <FolderInput className="h-4 w-4" />
                Caminho do Projeto Origem
              </Label>
              <Input
                id="sourcePath"
                placeholder="C:\Projects\Source"
                value={sourceProjectPath}
                onChange={(e) => setSourceProjectPath(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Caminho completo do projeto que será copiado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destPath" className="flex items-center gap-2">
                <FolderOutput className="h-4 w-4" />
                Caminho do Projeto Destino
              </Label>
              <Input
                id="destPath"
                placeholder="C:\Projects\Destination"
                value={destinationProjectPath}
                onChange={(e) => setDestinationProjectPath(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Caminho onde o projeto será copiado
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="oldNs">Namespace Antigo</Label>
              <Input
                id="oldNs"
                placeholder="OldProject.Core"
                value={oldNamespace}
                onChange={(e) => setOldNamespace(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Namespace atual do projeto
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newNs">Namespace Novo</Label>
              <Input
                id="newNs"
                placeholder="NewProject.Core"
                value={newNamespace}
                onChange={(e) => setNewNamespace(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Novo namespace que substituirá o antigo
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Informações Importantes:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Todas as ocorrências do namespace antigo serão substituídas</li>
              <li>Pastas bin, obj, .vs, .git serão ignoradas automaticamente</li>
              <li>Arquivos .editorconfig, .gitattributes e .gitignore serão ignorados</li>
              <li>A estrutura completa do projeto será copiada</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              disabled={copyMutation.isPending}
              className="flex-1"
            >
              {copyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Copiando Projeto...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Projeto
                </>
              )}
            </Button>

            {copyMutation.isSuccess && (
              <Button
                onClick={handleReset}
                variant="outline"
              >
                Nova Cópia
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {copyMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Copiar Projeto</AlertTitle>
          <AlertDescription>
            {copyMutation.error?.message || 'Ocorreu um erro ao copiar o projeto'}
          </AlertDescription>
        </Alert>
      )}

      {copyMutation.isSuccess && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Projeto Copiado com Sucesso!</AlertTitle>
          <AlertDescription>
            {copyMutation.data?.copyProject?.message || 'O projeto foi copiado e os namespaces foram renomeados com sucesso.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export const Route = createFileRoute('/copy-project')({
  component: CopyProjectPage,
})
