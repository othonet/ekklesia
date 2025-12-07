'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Church, Users, Package, TrendingUp, Plus, Cake, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  totalChurches: number
  totalMembers: number
  totalPlans: number
  activeChurches: number
}

interface BirthdayMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  birthDate: string
  age: number
  church: {
    id: string
    name: string
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBirthdays, setLoadingBirthdays] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchBirthdays()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats')
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

  async function fetchBirthdays() {
    try {
      const response = await fetch('/api/admin/birthdays')
      if (response.ok) {
        const data = await response.json()
        setBirthdays(data.birthdays || [])
      }
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error)
    } finally {
      setLoadingBirthdays(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie tenants, planos e módulos do sistema
          </p>
        </div>
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

          {/* Aniversariantes do Dia */}
          {!loadingBirthdays && (
            <Card className="mb-8 border-2 border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
                  <Cake className="h-5 w-5" />
                  Aniversariantes do Dia
                  {birthdays.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-pink-200 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                      {birthdays.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Membros que fazem aniversário hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                {birthdays.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum aniversariante hoje</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {birthdays.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">{member.name}</h4>
                              <Badge variant="outline" className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700">
                                {member.age} {member.age === 1 ? 'ano' : 'anos'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {member.church.name}
                            </p>
                            {member.email && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <Gift className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ações Rápidas */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push('/dashboard/admin/tenants')}>
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

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push('/dashboard/admin/plans')}>
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

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push('/dashboard/admin/tenants/new')}>
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

