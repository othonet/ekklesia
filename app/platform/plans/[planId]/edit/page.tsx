'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Module {
  id: string
  key: string
  name: string
  description: string | null
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
}

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.planId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    price: '',
    active: true,
    moduleIds: [] as string[],
  })

  useEffect(() => {
    fetchPlan()
    fetchModules()
  }, [planId])

  async function fetchPlan() {
    try {
      const response = await fetch('/api/platform/plans')
      if (response.ok) {
        const data = await response.json()
        const plan = data.plans.find((p: Plan) => p.id === planId)
        if (plan) {
          setFormData({
            key: plan.key,
            name: plan.name,
            description: plan.description || '',
            price: plan.price?.toString() || '',
            active: plan.active,
            moduleIds: plan.modules.map((pm) => pm.module.id),
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchModules() {
    try {
      const response = await fetch('/api/platform/modules')
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules || [])
      }
    } catch (error) {
      console.error('Erro ao buscar módulos:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/platform/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      })

      if (response.ok) {
        alert('Plano atualizado com sucesso!')
        router.push('/platform/plans')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar plano')
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      alert('Erro ao atualizar plano')
    } finally {
      setSaving(false)
    }
  }

  function toggleModule(moduleId: string) {
    setFormData((prev) => ({
      ...prev,
      moduleIds: prev.moduleIds.includes(moduleId)
        ? prev.moduleIds.filter((id) => id !== moduleId)
        : [...prev.moduleIds, moduleId],
    }))
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
          items={[
            { label: 'Planos', href: '/platform/plans' },
            { label: 'Editar Plano' },
          ]}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold">Editar Plano</h1>
        <p className="text-muted-foreground mt-2">
          Edite os dados do plano
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
            <CardDescription>
              Atualize os dados do plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key">Key *</Label>
                  <Input
                    id="key"
                    required
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({ ...formData, key: e.target.value })
                    }
                    placeholder="BASIC, INTERMEDIATE, MASTER"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>

              <div>
                <Label>Módulos Incluídos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {modules.map((module) => (
                    <div key={module.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`module-${module.id}`}
                        checked={formData.moduleIds.includes(module.id)}
                        onChange={() => toggleModule(module.id)}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor={`module-${module.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {module.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Link href="/platform/plans">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

