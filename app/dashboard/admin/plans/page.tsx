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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

export default function PlansAdminPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedModules, setSelectedModules] = useState<string[]>([])

  useEffect(() => {
    fetchPlans()
    fetchModules()
  }, [])

  async function fetchPlans() {
    try {
      const response = await fetch('/api/admin/plans')
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

  async function fetchModules() {
    try {
      const response = await fetch('/api/admin/modules')
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules)
      }
    } catch (error) {
      console.error('Erro ao buscar módulos:', error)
    }
  }

  function toggleModule(moduleId: string) {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    )
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
          <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os planos e módulos disponíveis para as igrejas
          </p>
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
    </div>
  )
}

