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
} from '@/components/ui/dialog'
import { Loader2, Package, Edit, Trash2, Plus } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Module {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
}

interface Plan {
  id: string
  key: string
  name: string
  description: string | null
  price: number | null
  active: boolean
  modules: Array<{
    module: Module
  }>
  _count: {
    churches: number
  }
}

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      const response = await fetch('/api/platform/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
    } finally {
      setLoading(false)
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
          items={[{ label: 'Planos' }]}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os planos e módulos disponíveis para as igrejas
            </p>
          </div>
          <Link href="/platform/plans/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {plan.description || 'Sem descrição'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={plan.active ? 'default' : 'secondary'}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline">
                    {plan._count.churches} igreja(s)
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/platform/plans/${plan.id}/edit`)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlan(plan)
                      setDeleteDialogOpen(true)
                    }}
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">Módulos incluídos:</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.modules.map((pm) => (
                    <Badge key={pm.module.id} variant="secondary">
                      {pm.module.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o plano "{selectedPlan?.name}"?
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
              onClick={async () => {
                if (!selectedPlan) return
                setDeleting(true)
                try {
                  const response = await fetch(`/api/platform/plans/${selectedPlan.id}`, {
                    method: 'DELETE',
                  })
                  if (response.ok) {
                    alert('Plano deletado com sucesso!')
                    setDeleteDialogOpen(false)
                    fetchPlans()
                  } else {
                    const data = await response.json()
                    alert(data.error || 'Erro ao deletar plano')
                  }
                } catch (error) {
                  console.error('Erro ao deletar plano:', error)
                  alert('Erro ao deletar plano')
                } finally {
                  setDeleting(false)
                }
              }}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

