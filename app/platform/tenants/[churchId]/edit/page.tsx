'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  key: string
  name: string
}

interface Tenant {
  id: string
  name: string
  cnpj: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  website: string | null
  pastorName: string | null
  planId: string | null
}

export default function EditTenantPage() {
  const router = useRouter()
  const params = useParams()
  const churchId = params.churchId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState<Tenant>({
    id: '',
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    pastorName: '',
    planId: '',
  })

  useEffect(() => {
    fetchTenant()
    fetchPlans()
  }, [churchId])

  async function fetchTenant() {
    try {
      const response = await fetch('/api/platform/tenants')
      if (response.ok) {
        const data = await response.json()
        const tenant = data.churches.find((c: Tenant) => c.id === churchId)
        if (tenant) {
          setFormData({
            id: tenant.id,
            name: tenant.name,
            cnpj: tenant.cnpj || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            address: tenant.address || '',
            city: tenant.city || '',
            state: tenant.state || '',
            zipCode: tenant.zipCode || '',
            website: tenant.website || '',
            pastorName: tenant.pastorName || '',
            planId: tenant.planId || '',
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar tenant:', error)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/platform/tenants/${churchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          planId: formData.planId || null,
        }),
      })

      if (response.ok) {
        alert('Tenant atualizado com sucesso!')
        router.push('/platform/tenants')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar tenant')
      }
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error)
      alert('Erro ao atualizar tenant')
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
          items={[
            { label: 'Tenants', href: '/platform/tenants' },
            { label: 'Editar Tenant' },
          ]}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold">Editar Tenant</h1>
        <p className="text-muted-foreground mt-2">
          Edite os dados da igreja
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Igreja</CardTitle>
            <CardDescription>
              Atualize os dados da igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, cnpj: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="pastorName">Nome do Pastor</Label>
                <Input
                  id="pastorName"
                  value={formData.pastorName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, pastorName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="planId">Plano</Label>
                <Select
                  value={formData.planId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, planId: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem plano</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Link href={`/platform/tenants/${churchId}/modules`}>
                <Button type="button" variant="outline">
                  Gerenciar Módulos
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href="/platform/tenants">
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

