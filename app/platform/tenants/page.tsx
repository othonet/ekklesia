'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Loader2, Church, Edit, Plus, Eye, Search, Trash2, UserPlus, Lock, Unlock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/breadcrumb'

interface Plan {
  id: string
  key: string
  name: string
  description: string | null
}

interface Tenant {
  id: string
  name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  cnpj: string | null
  pastorName: string | null
  plan: Plan | null
  planExpiresAt: Date | null
  planAssignedAt: Date | null
  systemEnabled: boolean
  createdAt: Date
  users?: Array<{
    id: string
    email: string
    name: string
  }>
  _count?: {
    members: number
    users: number
  }
}

export default function TenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminName, setAdminName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)

  useEffect(() => {
    fetchTenants()
    fetchPlans()
  }, [])

  async function fetchTenants() {
    try {
      const response = await fetch('/api/platform/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data.churches || [])
      }
    } catch (error) {
      console.error('Erro ao buscar tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPlans() {
    try {
      const response = await fetch('/api/platform/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
    }
  }

  async function toggleSystemStatus(tenantId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/platform/tenants/${tenantId}/system-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemEnabled: !currentStatus }),
      })

      if (response.ok) {
        // Atualizar estado local
        setTenants(tenants.map(t => 
          t.id === tenantId 
            ? { ...t, systemEnabled: !currentStatus }
            : t
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao atualizar status do sistema')
      }
    } catch (error) {
      console.error('Erro ao atualizar status do sistema:', error)
      alert('Erro ao atualizar status do sistema')
    }
  }

  function openPlanDialog(tenant: Tenant) {
    setSelectedTenant(tenant)
    setSelectedPlanId(tenant.plan?.id || '')
    setExpiresAt(
      tenant.planExpiresAt
        ? new Date(tenant.planExpiresAt).toISOString().split('T')[0]
        : ''
    )
    setDialogOpen(true)
  }

  function openViewDialog(tenant: Tenant) {
    setSelectedTenant(tenant)
    setViewDialogOpen(true)
  }

  async function openAdminDialog(tenant: Tenant) {
    setSelectedTenant(tenant)
    setLoadingAdmin(true)
    setAdminDialogOpen(true)
    
    try {
      // Buscar credenciais admin existentes
      const response = await fetch(`/api/platform/tenants/${tenant.id}/admin`)
      if (response.ok) {
        const data = await response.json()
        if (data.hasAdmin && data.admin) {
          // Se já tem admin, preencher campos para edição
          setAdminEmail(data.admin.email)
          setAdminName(data.admin.name)
          setAdminPassword('') // Não mostrar senha
          setIsEditingAdmin(true)
        } else {
          // Se não tem admin, limpar campos para criação
          setAdminEmail('')
          setAdminName('')
          setAdminPassword('')
          setIsEditingAdmin(false)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar credenciais admin:', error)
      // Em caso de erro, assumir que não tem admin
      setAdminEmail('')
      setAdminName('')
      setAdminPassword('')
      setIsEditingAdmin(false)
    } finally {
      setLoadingAdmin(false)
    }
  }

  function openDeleteDialog(tenant: Tenant) {
    setSelectedTenant(tenant)
    setDeleteDialogOpen(true)
  }

  async function saveAdminCredentials() {
    if (!selectedTenant || !adminEmail || !adminName) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    // Se está editando e não preencheu senha, não enviar senha
    if (isEditingAdmin && !adminPassword) {
      // Atualizar apenas email e nome (senha permanece a mesma)
      try {
        const response = await fetch(
          `/api/platform/tenants/${selectedTenant.id}/admin`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              adminEmail,
              adminName,
              // Não enviar senha se estiver vazia
              adminPassword: adminPassword || undefined,
            }),
          }
        )

        if (response.ok) {
          alert('Credenciais do administrador atualizadas com sucesso!')
          setAdminDialogOpen(false)
          fetchTenants() // Atualizar lista
        } else {
          const data = await response.json()
          alert(data.error || 'Erro ao atualizar credenciais')
        }
      } catch (error) {
        console.error('Erro ao atualizar credenciais:', error)
        alert('Erro ao atualizar credenciais')
      }
      return
    }

    // Se está criando ou editando com nova senha
    if (!adminPassword || adminPassword.length < 6) {
      alert('A senha é obrigatória e deve ter no mínimo 6 caracteres')
      return
    }

    try {
      const response = await fetch(
        `/api/platform/tenants/${selectedTenant.id}/admin`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail,
            adminPassword,
            adminName,
          }),
        }
      )

      if (response.ok) {
        alert(
          isEditingAdmin
            ? 'Credenciais do administrador atualizadas com sucesso!'
            : 'Credenciais do administrador criadas com sucesso!'
        )
        setAdminDialogOpen(false)
        setAdminEmail('')
        setAdminPassword('')
        setAdminName('')
        setIsEditingAdmin(false)
        fetchTenants() // Atualizar lista
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao salvar credenciais')
      }
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error)
      alert('Erro ao salvar credenciais')
    }
  }

  async function deleteTenant() {
    if (!selectedTenant) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/platform/tenants/${selectedTenant.id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        alert('Tenant deletado com sucesso!')
        setDeleteDialogOpen(false)
        fetchTenants()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao deletar tenant')
      }
    } catch (error) {
      console.error('Erro ao deletar tenant:', error)
      alert('Erro ao deletar tenant')
    } finally {
      setDeleting(false)
    }
  }

  async function updatePlan() {
    if (!selectedTenant || !selectedPlanId) return

    try {
      const response = await fetch(
        `/api/platform/tenants/${selectedTenant.id}/plan`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: selectedPlanId,
            expiresAt: expiresAt || null,
          }),
        }
      )

      if (response.ok) {
        setDialogOpen(false)
        fetchTenants()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar plano')
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      alert('Erro ao atualizar plano')
    }
  }

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          items={[{ label: 'Tenants' }]}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Tenants</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todas as igrejas cadastradas no sistema
            </p>
          </div>
          <Link href="/platform/tenants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Tenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenants ({filteredTenants.length})</CardTitle>
          <CardDescription>
            Lista de todas as igrejas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sistema</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum tenant encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => {
                  const isExpired = tenant.planExpiresAt && new Date(tenant.planExpiresAt) < new Date()
                  const hasPlan = tenant.plan !== null

                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {tenant.email && (
                            <div className="text-sm">{tenant.email}</div>
                          )}
                          {tenant.phone && (
                            <div className="text-xs text-muted-foreground">
                              {tenant.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenant.city && tenant.state
                          ? `${tenant.city}/${tenant.state}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {tenant.plan ? (
                          <Badge>{tenant.plan.name}</Badge>
                        ) : (
                          <Badge variant="secondary">Sem plano</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!hasPlan ? (
                          <Badge variant="destructive">Sem plano</Badge>
                        ) : isExpired ? (
                          <Badge variant="destructive">Expirado</Badge>
                        ) : (
                          <Badge variant="default">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tenant.systemEnabled ?? true}
                            onCheckedChange={() => toggleSystemStatus(tenant.id, tenant.systemEnabled ?? true)}
                            title={tenant.systemEnabled ? 'Sistema liberado' : 'Sistema bloqueado'}
                          />
                          {tenant.systemEnabled ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Unlock className="h-3 w-3" />
                              Liberado
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Bloqueado
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenant.users && tenant.users.length > 0 ? (
                          <div className="space-y-1">
                            <Badge variant="success" className="text-xs">
                              ✓ Configurado
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {tenant.users[0].email}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Sem credenciais
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {tenant._count?.members || 0} membros
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(tenant)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/platform/tenants/${tenant.id}/edit`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPlanDialog(tenant)}
                            title="Atribuir Plano"
                          >
                            <Church className="h-4 w-4 mr-2" />
                            Plano
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAdminDialog(tenant)}
                            title="Credenciais Admin"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(tenant)}
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para credenciais admin */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingAdmin ? 'Alterar Credenciais Admin' : 'Credenciais de Acesso Admin'}
            </DialogTitle>
            <DialogDescription>
              {isEditingAdmin
                ? `Altere as credenciais do administrador de ${selectedTenant?.name}`
                : `Configure as credenciais do administrador para ${selectedTenant?.name}`}
            </DialogDescription>
          </DialogHeader>
          {loadingAdmin ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {isEditingAdmin && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Edição de credenciais:</strong> Deixe a senha em branco para manter a senha atual.
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="adminName">Nome do Administrador *</Label>
                <Input
                  id="adminName"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Email do Administrador *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@igreja.com"
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">
                  Senha do Administrador {isEditingAdmin ? '(opcional)' : '*'}
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  required={!isEditingAdmin}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={isEditingAdmin ? "Deixe em branco para manter a senha atual" : "Mínimo 6 caracteres"}
                  minLength={isEditingAdmin ? undefined : 6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isEditingAdmin
                    ? 'Deixe em branco para manter a senha atual, ou digite uma nova senha (mínimo 6 caracteres)'
                    : 'A senha deve ter no mínimo 6 caracteres'}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setAdminDialogOpen(false)
                  setAdminEmail('')
                  setAdminPassword('')
                  setAdminName('')
                  setIsEditingAdmin(false)
                }}>
                  Cancelar
                </Button>
                <Button onClick={saveAdminCredentials}>
                  {isEditingAdmin ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o tenant "{selectedTenant?.name}"?
              <br />
              <strong className="text-destructive">
                Esta ação não pode ser desfeita!
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={deleteTenant}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar plano */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Plano</DialogTitle>
            <DialogDescription>
              Selecione o plano para {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={selectedPlanId}
                onValueChange={setSelectedPlanId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiresAt">Data de Expiração (opcional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe em branco para plano sem expiração
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={updatePlan}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar detalhes */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Tenant</DialogTitle>
            <DialogDescription>
              Informações completas de {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{selectedTenant.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CNPJ</Label>
                  <p className="font-medium">{selectedTenant.cnpj || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedTenant.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{selectedTenant.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cidade</Label>
                  <p className="font-medium">{selectedTenant.city || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <p className="font-medium">{selectedTenant.state || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Pastor</Label>
                  <p className="font-medium">{selectedTenant.pastorName || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plano</Label>
                  <p className="font-medium">
                    {selectedTenant.plan ? (
                      <Badge>{selectedTenant.plan.name}</Badge>
                    ) : (
                      'Sem plano'
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Membros</Label>
                  <p className="font-medium">
                    {selectedTenant._count?.members || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usuários</Label>
                  <p className="font-medium">
                    {selectedTenant._count?.users || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Criado em</Label>
                  <p className="font-medium">
                    {new Date(selectedTenant.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {selectedTenant.planExpiresAt && (
                  <div>
                    <Label className="text-muted-foreground">Expira em</Label>
                    <p className="font-medium">
                      {new Date(selectedTenant.planExpiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

