'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  key: string
  name: string
}

export default function NewTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState({
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
    fetchPlans()
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/churches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          planId: formData.planId || null,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/admin/tenants')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao criar tenant')
      }
    } catch (error) {
      console.error('Erro ao criar tenant:', error)
      alert('Erro ao criar tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/dashboard/admin/tenants">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Novo Tenant</h1>
        <p className="text-muted-foreground mt-2">
          Cadastre uma nova igreja no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Igreja</CardTitle>
          <CardDescription>
            Preencha os dados da igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.cnpj}
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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="pastorName">Nome do Pastor</Label>
                <Input
                  id="pastorName"
                  value={formData.pastorName}
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
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="planId">Plano Inicial</Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, planId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem plano</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/admin/tenants">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Tenant
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

