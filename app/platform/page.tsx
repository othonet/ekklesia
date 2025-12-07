'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Church, Users, Package, TrendingUp, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/breadcrumb'

interface Stats {
  totalChurches: number
  totalMembers: number
  totalPlans: number
  activeChurches: number
}

export default function PlatformDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/platform/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Breadcrumb items={[{ label: 'Dashboard' }]} className="mb-4" />
        <h1 className="text-3xl font-bold">Plataforma Multitenancy</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie tenants, planos e módulos do sistema
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Igrejas
                </CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalChurches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeChurches || 0} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Membros
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Em todas as igrejas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planos Disponíveis
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Planos configurados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Igrejas Ativas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeChurches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Com plano ativo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push('/platform/tenants')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  Gerenciar Tenants
                </CardTitle>
                <CardDescription>
                  Visualizar, criar e editar igrejas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push('/platform/plans')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gerenciar Planos
                </CardTitle>
                <CardDescription>
                  Configurar planos e módulos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push('/platform/tenants/new')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Novo Tenant
                </CardTitle>
                <CardDescription>
                  Cadastrar nova igreja
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

