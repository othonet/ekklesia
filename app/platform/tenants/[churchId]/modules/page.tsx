'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Plus, X, Calendar, Check, XCircle, Package } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface Module {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
  route: string | null
  source?: 'plan' | 'custom'
  active?: boolean
  assignedAt?: string
  expiresAt?: string | null
  assignedBy?: string | null
}

interface ModulesData {
  church: {
    id: string
    name: string
  }
  plan: {
    id: string
    name: string
    key: string
  } | null
  activeModules: Module[]
  availableModules: Module[]
}

export default function TenantModulesPage() {
  const params = useParams()
  const router = useRouter()
  const churchId = params.churchId as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ModulesData | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    fetchModules()
  }, [churchId])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/platform/tenants/${churchId}/modules`)

      if (res.ok) {
        const modulesData = await res.json()
        setData(modulesData)
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar módulos',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar módulos:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar módulos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = async () => {
    if (!selectedModule) return

    try {
      const res = await fetch(`/api/platform/tenants/${churchId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          action: 'add',
          expiresAt: expiresAt || null,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Módulo atribuído com sucesso',
        })
        setAddDialogOpen(false)
        setSelectedModule(null)
        setExpiresAt('')
        fetchModules()
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao atribuir módulo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar módulo:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atribuir módulo',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveModule = async (moduleId: string) => {
    if (!confirm('Remover este módulo da igreja?')) return

    try {
      const res = await fetch(`/api/platform/tenants/${churchId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          action: 'remove',
        }),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Módulo removido com sucesso',
        })
        fetchModules()
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao remover módulo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao remover módulo:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover módulo',
        variant: 'destructive',
      })
    }
  }

  const handleToggleModule = async (module: Module, active: boolean) => {
    try {
      const res = await fetch(`/api/platform/tenants/${churchId}/modules/${module.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: `Módulo ${active ? 'ativado' : 'desativado'} com sucesso`,
        })
        fetchModules()
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao atualizar módulo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar módulo',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sem expiração'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const isExpired = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Plataforma', href: '/platform' },
          { label: 'Igrejas', href: '/platform/tenants' },
          { label: data.church.name, href: `/platform/tenants/${churchId}/edit` },
          { label: 'Módulos', href: '#' },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Módulos - {data.church.name}</h1>
          <p className="text-muted-foreground">
            Gerencie módulos individuais desta igreja (além do plano)
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Módulo
        </Button>
      </div>

      {/* Plano Atual */}
      {data.plan && (
        <Card>
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <CardDescription>
              Módulos do plano são gerenciados através do plano. Módulos individuais têm prioridade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{data.plan.name}</span>
              <Badge variant="outline">{data.plan.key}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Módulos Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos Ativos</CardTitle>
          <CardDescription>
            Módulos disponíveis para esta igreja (do plano + individuais)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.activeModules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum módulo ativo
            </p>
          ) : (
            <div className="space-y-3">
              {data.activeModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{module.name}</span>
                      <Badge variant={module.source === 'custom' ? 'default' : 'outline'}>
                        {module.source === 'custom' ? 'Individual' : 'Plano'}
                      </Badge>
                      {module.source === 'custom' && module.active === false && (
                        <Badge variant="secondary">Desativado</Badge>
                      )}
                      {module.expiresAt && isExpired(module.expiresAt) && (
                        <Badge variant="destructive">Expirado</Badge>
                      )}
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    )}
                    {module.source === 'custom' && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {module.assignedAt && (
                          <span>Atribuído em: {formatDate(module.assignedAt)}</span>
                        )}
                        {module.expiresAt && (
                          <span className={isExpired(module.expiresAt) ? 'text-red-600' : ''}>
                            Expira em: {formatDate(module.expiresAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {module.source === 'custom' && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={module.active !== false}
                        onCheckedChange={(checked) => handleToggleModule(module, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveModule(module.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Módulos Disponíveis */}
      {data.availableModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Módulos Disponíveis</CardTitle>
            <CardDescription>
              Módulos que podem ser adicionados individualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.availableModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <span className="font-medium">{module.name}</span>
                    {module.description && (
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedModule(module)
                      setAddDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Adicionar Módulo */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedModule ? (
              <>
                <div>
                  <Label>Módulo</Label>
                  <p className="font-semibold">{selectedModule.name}</p>
                  {selectedModule.description && (
                    <p className="text-sm text-muted-foreground">{selectedModule.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Data de Expiração (Opcional)</Label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para sem expiração
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Selecione o Módulo</Label>
                <Select
                  value={selectedModule ? (selectedModule as Module).id : ''}
                  onValueChange={(value) => {
                    if (!data) return
                    const foundModule = data.availableModules.find((m: Module) => m.id === value)
                    setSelectedModule(foundModule ?? null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.availableModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false)
              setSelectedModule(null)
              setExpiresAt('')
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddModule}
              disabled={!selectedModule}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

