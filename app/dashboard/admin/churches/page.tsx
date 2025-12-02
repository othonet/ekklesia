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
import { Loader2, Church, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Plan {
  id: string
  key: string
  name: string
  description: string | null
}

interface Church {
  id: string
  name: string
  email: string | null
  city: string | null
  state: string | null
  plan: Plan | null
  planExpiresAt: Date | null
}

export default function ChurchesAdminPage() {
  const router = useRouter()
  const [churches, setChurches] = useState<Church[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')

  useEffect(() => {
    fetchChurches()
    fetchPlans()
  }, [])

  async function fetchChurches() {
    try {
      const response = await fetch('/api/admin/churches')
      if (response.ok) {
        const data = await response.json()
        setChurches(data.churches)
      }
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPlans() {
    try {
      const response = await fetch('/api/admin/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
    }
  }

  function openDialog(church: Church) {
    setSelectedChurch(church)
    setSelectedPlanId(church.plan?.id || '')
    setExpiresAt(
      church.planExpiresAt
        ? new Date(church.planExpiresAt).toISOString().split('T')[0]
        : ''
    )
    setDialogOpen(true)
  }

  async function updatePlan() {
    if (!selectedChurch || !selectedPlanId) return

    try {
      const response = await fetch(
        `/api/admin/churches/${selectedChurch.id}/plan`,
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
        fetchChurches()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar plano')
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      alert('Erro ao atualizar plano')
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Igrejas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os planos atribuídos a cada igreja
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Igrejas</CardTitle>
          <CardDescription>Lista de todas as igrejas cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cidade/Estado</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churches.map((church) => (
                <TableRow key={church.id}>
                  <TableCell className="font-medium">{church.name}</TableCell>
                  <TableCell>{church.email || '-'}</TableCell>
                  <TableCell>
                    {church.city && church.state
                      ? `${church.city}/${church.state}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {church.plan ? (
                      <Badge>{church.plan.name}</Badge>
                    ) : (
                      <Badge variant="secondary">Sem plano</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {church.planExpiresAt
                      ? new Date(church.planExpiresAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(church)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Plano
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Plano</DialogTitle>
            <DialogDescription>
              Selecione o plano para {selectedChurch?.name}
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
    </div>
  )
}

