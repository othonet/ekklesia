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
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Church, Edit, Plus, Eye, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  createdAt: Date
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
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTenants()
    fetchPlans()
  }, [])

  async function fetchTenants() {
    try {
      const response = await fetch('/api/admin/churches')
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
      const response = await fetch('/api/admin/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
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

  async function updatePlan() {
    if (!selectedTenant || !selectedPlanId) return

    try {
      const response = await fetch(
        `/api/admin/churches/${selectedTenant.id}/plan`,
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Tenants</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todas as igrejas cadastradas no sistema
          </p>
        </div>
        <Link href="/dashboard/admin/tenants/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tenant
          </Button>
        </Link>
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
                <TableHead>Membros</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        {tenant._count?.members || 0} membros
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(tenant)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPlanDialog(tenant)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Plano
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

