'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Package, Edit, Trash2, Plus, Check, X } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface Module {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
  route: string | null
  active: boolean
  order: number
}

export default function ModulesPage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    route: '',
    order: 0,
    active: true,
  })

  useEffect(() => {
    fetchModules()
  }, [])

  async function fetchModules() {
    try {
      const response = await fetch('/api/platform/modules')
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules)
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

  const handleEdit = (module: Module) => {
    setSelectedModule(module)
    setFormData({
      name: module.name,
      description: module.description || '',
      icon: module.icon || '',
      route: module.route || '',
      order: module.order,
      active: module.active,
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedModule) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/platform/modules/${selectedModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Módulo atualizado com sucesso',
        })
        setEditDialogOpen(false)
        fetchModules()
      } else {
        const data = await response.json()
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar módulo',
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
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedModule) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/platform/modules/${selectedModule.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Módulo deletado com sucesso',
        })
        setDeleteDialogOpen(false)
        fetchModules()
      } else {
        const data = await response.json()
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao deletar módulo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao deletar módulo:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao deletar módulo',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCreate = () => {
    setSelectedModule(null)
    setFormData({
      name: '',
      description: '',
      icon: '',
      route: '',
      order: modules.length + 1,
      active: true,
    })
    setEditDialogOpen(true)
  }

  const handleCreateSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/platform/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          key: formData.name.toUpperCase().replace(/\s+/g, '_'),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Módulo criado com sucesso',
        })
        setEditDialogOpen(false)
        fetchModules()
      } else {
        const data = await response.json()
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao criar módulo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao criar módulo:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao criar módulo',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Breadcrumb
          items={[{ label: 'Módulos' }]}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Módulos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todos os módulos disponíveis no sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Módulo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle>{module.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={module.active ? 'default' : 'secondary'}>
                    {module.active ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {module.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <CardDescription className="mt-2">
                {module.description || 'Sem descrição'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Chave:</span> {module.key}
                </div>
                {module.route && (
                  <div className="text-sm">
                    <span className="font-semibold">Rota:</span> {module.route}
                  </div>
                )}
                {module.icon && (
                  <div className="text-sm">
                    <span className="font-semibold">Ícone:</span> {module.icon}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-semibold">Ordem:</span> {module.order}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(module)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedModule(module)
                      setDeleteDialogOpen(true)
                    }}
                    className="flex-1 text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para editar/criar módulo */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? 'Editar Módulo' : 'Novo Módulo'}
            </DialogTitle>
            <DialogDescription>
              {selectedModule
                ? 'Atualize as informações do módulo'
                : 'Preencha os dados para criar um novo módulo'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Membros"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do módulo"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Ícone</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ex: Users"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="route">Rota</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="Ex: /dashboard/members"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={selectedModule ? handleSave : handleCreateSave}
              disabled={saving || !formData.name}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedModule ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o módulo &quot;{selectedModule?.name}&quot;?
              <br />
              <strong className="text-destructive">
                Esta ação não pode ser desfeita!
              </strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
