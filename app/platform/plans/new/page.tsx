'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

interface Module {
  id: string
  key: string
  name: string
  description: string | null
}

export default function NewPlanPage() {
  const router = useRouter()
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
    fetchModules()
  }, [])

  async function fetchModules() {
    try {
      const response = await fetch('/api/platform/modules')
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules || [])
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
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/platform/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Plano criado com sucesso',
        })
        router.push('/platform/plans')
      } else {
        const data = await response.json()
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao criar plano',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao criar plano',
        variant: 'destructive',
      })
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: 'Planos', href: '/platform/plans' },
            { label: 'Novo Plano' },
          ]}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold">Novo Plano</h1>
        <p className="text-muted-foreground mt-2">
          Crie um novo plano para as igrejas
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações do Plano
            </CardTitle>
            <CardDescription>
              Preencha os dados para criar um novo plano
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
                      setFormData({ ...formData, key: e.target.value.toUpperCase() })
                    }
                    placeholder="BASIC, INTERMEDIATE, MASTER"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Chave única do plano (maiúsculas, sem espaços)
                  </p>
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
                    placeholder="Plano Básico"
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
                    placeholder="Descrição do plano"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
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
                <p className="text-sm text-muted-foreground mb-2">
                  Selecione os módulos que estarão disponíveis neste plano
                </p>
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
                {modules.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Nenhum módulo disponível. Crie módulos primeiro em{' '}
                    <Link href="/platform/modules" className="text-primary hover:underline">
                      Gerenciar Módulos
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Link href="/platform/plans">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={saving || !formData.key || !formData.name}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Plano
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
