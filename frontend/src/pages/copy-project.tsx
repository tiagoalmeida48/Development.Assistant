import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { validateFields } from '@/utils'
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui'
import { InputWithHistory, type InputWithHistoryRef } from '@/components/ui/input-with-history'
import { Copy, Loader2, FolderInput, FolderOutput } from 'lucide-react'

export default function CopyProjectPage() {
  const [sourceProjectPath, setSourceProjectPath] = useState('')
  const [destinationProjectPath, setDestinationProjectPath] = useState('')
  const [oldNamespace, setOldNamespace] = useState('')
  const [newNamespace, setNewNamespace] = useState('')

  const sourcePathRef = useRef<InputWithHistoryRef>(null)
  const destPathRef = useRef<InputWithHistoryRef>(null)
  const oldNsRef = useRef<InputWithHistoryRef>(null)
  const newNsRef = useRef<InputWithHistoryRef>(null)

  const { loading, success, execute, reset: resetAction } = useAsyncAction()

  const handleCopy = async () => {
    if (!validateFields({ sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace })) {
      return
    }

    await execute(async () => {
      await api.project.copyProject(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace)
      toast.success('Projeto copiado com sucesso!', {
        description: 'O projeto foi copiado e os namespaces foram renomeados.'
      })
    })
  }

  const handleReset = () => {
    setSourceProjectPath('')
    setDestinationProjectPath('')
    setOldNamespace('')
    setNewNamespace('')
    resetAction()
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl text-secondary-foreground font-bold mb-2">Copiar Projeto</h1>
      </div>

      <Card className="shadow-sm hover:shadow-md border-border transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configuração da Cópia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sourcePath" className="flex items-center gap-1.5 text-sm font-medium">
                <FolderInput className="h-4 w-4" />
                Projeto Origem
              </Label>
              <InputWithHistory
                ref={sourcePathRef}
                id="sourcePath"
                placeholder="C:\Projects\Source"
                value={sourceProjectPath}
                onValueChange={setSourceProjectPath}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destPath" className="flex items-center gap-1.5 text-sm font-medium">
                <FolderOutput className="h-4 w-4" />
                Projeto Destino
              </Label>
              <InputWithHistory
                ref={destPathRef}
                id="destPath"
                placeholder="C:\Projects\Destination"
                value={destinationProjectPath}
                onValueChange={setDestinationProjectPath}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="oldNs" className="text-sm font-medium">Namespace Antigo</Label>
              <InputWithHistory
                ref={oldNsRef}
                id="oldNs"
                placeholder="OldProject.Core"
                value={oldNamespace}
                onValueChange={setOldNamespace}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newNs" className="text-sm font-medium">Namespace Novo</Label>
              <InputWithHistory
                ref={newNsRef}
                id="newNs"
                placeholder="NewProject.Core"
                value={newNamespace}
                onValueChange={setNewNamespace}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              disabled={loading}
              className="flex-1 h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Copiando...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>

            {success && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-10"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
