'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Users, Building2, Calendar, DollarSign, TrendingUp, TrendingDown, ArrowRight, Activity, Cake, Gift } from 'lucide-react'
import Link from 'next/link'
import { useCache } from '@/hooks/use-cache'

interface DashboardStats {
  members: number
  activeMembers: number
  newMembersThisMonth: number
  newMembersLastMonth: number
  membersGrowthRate: number
  ministries: number
  activeMinistries: number
  upcomingEvents: number
  totalIncome: number
  totalDonations?: number
  totalExpenses: number
  balance: number
  incomeThisMonth: number
  expensesThisMonth: number
  incomeVariation: number
  expensesVariation: number
  totalAttendance: number
}

interface RecentFinance {
  id: string
  description: string
  amount: number
  type: string
  category: string | null
  date: string
  donationType?: string | null
  method?: string | null
  member?: {
    id: string
    name: string
  } | null
}

interface BirthdayMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  birthDate: string
  age: number
}

export default function DashboardPage() {
  // Cache de estatísticas do dashboard
  const { data: statsData, loading: statsLoading, refresh: refreshStats } = useCache<DashboardStats>(
    'dashboard_stats',
    async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        return await response.json()
      }
      return {
        members: 0,
        activeMembers: 0,
        newMembersThisMonth: 0,
        newMembersLastMonth: 0,
        membersGrowthRate: 0,
        ministries: 0,
        activeMinistries: 0,
        upcomingEvents: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeThisMonth: 0,
        expensesThisMonth: 0,
        incomeVariation: 0,
        expensesVariation: 0,
        totalAttendance: 0,
      }
    },
    { cacheDuration: 2 * 60 * 1000 } // 2 minutos
  )

  // Cache de finanças recentes (carregado em paralelo)
  const { data: financesData, loading: financesLoading } = useCache<RecentFinance[]>(
    'dashboard_recent_finances',
    async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/finances?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const finances = data?.data || data
        return Array.isArray(finances) ? finances.slice(0, 5) : []
      }
      return []
    },
    { cacheDuration: 2 * 60 * 1000 } // 2 minutos
  )

  // Cache de aniversariantes do dia
  const { data: birthdaysData, loading: birthdaysLoading } = useCache<BirthdayMember[]>(
    'dashboard_birthdays',
    async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ Token não encontrado no localStorage')
        return []
      }
      try {
        const response = await fetch('/api/dashboard/birthdays', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Aniversariantes recebidos:', data)
          return data.birthdays || []
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Erro ao buscar aniversariantes:', response.status, errorData)
          return []
        }
      } catch (error) {
        console.error('❌ Erro na requisição de aniversariantes:', error)
        return []
      }
    },
    { cacheDuration: 60 * 60 * 1000 } // 1 hora (aniversários não mudam durante o dia)
  )

  const stats = statsData || {
    members: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    newMembersLastMonth: 0,
    membersGrowthRate: 0,
    ministries: 0,
    activeMinistries: 0,
    upcomingEvents: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    incomeThisMonth: 0,
    expensesThisMonth: 0,
    incomeVariation: 0,
    expensesVariation: 0,
    totalAttendance: 0,
  }
  const recentFinances = financesData || []
  const birthdays = birthdaysData || []
  const loading = statsLoading || financesLoading || birthdaysLoading

  const fetchStats = async () => {
    await refreshStats()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Painel</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Membros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.members}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeMembers} ativos
                    {stats.membersGrowthRate !== 0 && (
                      <span className={`ml-2 ${stats.membersGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({stats.membersGrowthRate >= 0 ? '+' : ''}{stats.membersGrowthRate.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ministérios</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeMinistries}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.ministries} no total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">Próximos eventos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.balance)}
                  </div>
                  <p className="text-xs text-muted-foreground">Saldo atual</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.incomeThisMonth)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                    {stats.incomeVariation !== 0 && (
                      <span className={`ml-2 ${stats.incomeVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({stats.incomeVariation >= 0 ? '+' : ''}{stats.incomeVariation.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                  {stats.totalDonations && stats.totalDonations > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Doações: {formatCurrency(stats.totalDonations)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.expensesThisMonth)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                    {stats.expensesVariation !== 0 && (
                      <span className={`ml-2 ${stats.expensesVariation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ({stats.expensesVariation >= 0 ? '+' : ''}{stats.expensesVariation.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Presenças</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAttendance}</div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Aniversariantes do Dia */}
            <Card className="border-2 border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
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
              </CardHeader>
              <CardContent>
                {birthdaysLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando aniversariantes...</p>
                  </div>
                ) : birthdays.length === 0 ? (
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
                            {member.email && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {member.email}
                              </p>
                            )}
                            {member.phone && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {member.phone}
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

            {/* Últimas Transações Financeiras */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Últimas Transações</CardTitle>
                <Link href="/dashboard/finances">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentFinances.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Nenhuma transação registrada
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentFinances.map((finance) => (
                      <div
                        key={finance.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {finance.type === 'INCOME' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{finance.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{new Date(finance.date).toLocaleDateString('pt-BR')}</span>
                              {finance.category && <span>• {finance.category}</span>}
                              {finance.donationType && (
                                <span className="text-blue-600">
                                  • {finance.donationType === 'TITHE' ? 'Dízimo' : finance.donationType === 'OFFERING' ? 'Oferta' : 'Contribuição'}
                                </span>
                              )}
                              {finance.member && <span>• {finance.member.name}</span>}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${finance.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {finance.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(finance.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

