'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Download,
  BarChart3,
  Activity,
  Target,
  Award
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import { exportAnalyticsReport } from '@/lib/export-excel'
import { jsPDF } from 'jspdf'

interface AnalyticsData {
  period: {
    type: string
    startDate?: string
    endDate?: string
  }
  members: {
    total: number
    active: number
    inactive: number
    visitors: number
    newThisPeriod: number
    newLastPeriod: number
    growthRate: number
    byStatus: Array<{ status: string; count: number }>
    growthByMonth: Array<{ month: string; count: number }>
  }
  attendance: {
    total: number
    average: number
    byMonth: Array<{ month: string; count: number }>
    mostFrequent: Array<{ memberId: string; memberName: string; count: number }>
  }
  finances: {
    totalIncome: number
    totalExpenses: number
    totalDonations: number
    balance: number
    byMonth: Array<{ month: string; income: number; expenses: number; donations: number }>
    topDonors: Array<{ memberId: string; memberName: string; total: number }>
  }
  ministries: {
    total: number
    active: number
  }
  events: {
    total: number
    upcoming: number
    thisPeriod: number
  }
}

export default function AnalyticsPage() {
  const { fetchWithAuth } = useApi()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [period, startDate, endDate])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      } else {
        params.append('period', period)
      }

      const { data: analyticsData, response } = await fetchWithAuth(
        `/api/analytics?${params.toString()}`,
        { showErrorToast: false }
      )

      if (response.ok) {
        setData(analyticsData)
      }
    } catch (error) {
      // Erro já tratado pelo hook
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleExportExcel = () => {
    if (!data) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhum dado disponível para exportar',
      })
      return
    }

    try {
      exportAnalyticsReport(data)
      toast({
        variant: 'success',
        title: 'Sucesso',
        description: 'Relatório exportado para Excel com sucesso',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao exportar relatório',
      })
    }
  }

  const handleExportPDF = () => {
    if (!data) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhum dado disponível para exportar',
      })
      return
    }

    try {
      const doc = new jsPDF()
      let yPos = 20

      // Título
      doc.setFontSize(18)
      doc.text('Relatório de Analytics', 14, yPos)
      yPos += 10

      doc.setFontSize(12)
      doc.text(`Período: ${period === 'month' ? 'Mensal' : period === 'quarter' ? 'Trimestral' : period === 'year' ? 'Anual' : 'Personalizado'}`, 14, yPos)
      yPos += 10

      // Membros
      doc.setFontSize(14)
      doc.text('Indicadores de Membros', 14, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text(`Total: ${data.members.total}`, 14, yPos)
      yPos += 6
      doc.text(`Ativos: ${data.members.active}`, 14, yPos)
      yPos += 6
      doc.text(`Taxa de Crescimento: ${data.members.growthRate.toFixed(2)}%`, 14, yPos)
      yPos += 10

      // Finanças
      doc.setFontSize(14)
      doc.text('Indicadores Financeiros', 14, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text(`Receitas: ${formatCurrency(data.finances.totalIncome)}`, 14, yPos)
      yPos += 6
      doc.text(`Despesas: ${formatCurrency(data.finances.totalExpenses)}`, 14, yPos)
      yPos += 6
      doc.text(`Saldo: ${formatCurrency(data.finances.balance)}`, 14, yPos)
      yPos += 6
      doc.text(`Doações: ${formatCurrency(data.finances.totalDonations)}`, 14, yPos)
      yPos += 10

      // Presenças
      doc.setFontSize(14)
      doc.text('Indicadores de Frequência', 14, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text(`Total de Presenças: ${data.attendance.total}`, 14, yPos)
      yPos += 6
      doc.text(`Média de Presenças: ${data.attendance.average.toFixed(2)}`, 14, yPos)

      doc.save(`relatorio_analytics_${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast({
        variant: 'success',
        title: 'Sucesso',
        description: 'Relatório exportado para PDF com sucesso',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao exportar relatório PDF',
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-muted animate-pulse rounded" />
              <div className="h-5 w-96 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
              <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
          <div className="rounded-lg border p-6 space-y-4">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-4">
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics e Relatórios</h1>
            <p className="text-muted-foreground">Indicadores de crescimento e performance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="quarter">Trimestral</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                    <SelectItem value="all">Todo o Período</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores de Membros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.members.total}</div>
              <p className="text-xs text-muted-foreground">
                {data.members.active} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              {data.members.growthRate >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.members.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.members.growthRate >= 0 ? '+' : ''}{data.members.growthRate.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.members.newThisPeriod} novos no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Presenças</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.attendance.total}</div>
              <p className="text-xs text-muted-foreground">
                Média: {data.attendance.average.toFixed(1)} por evento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Financeiro</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.finances.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.finances.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas: {formatCurrency(data.finances.totalIncome)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Tabelas */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Membros Mais Frequentes */}
          <Card>
            <CardHeader>
              <CardTitle>Membros Mais Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              {data.attendance.mostFrequent.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
              ) : (
                <div className="space-y-2">
                  {data.attendance.mostFrequent.slice(0, 10).map((member, index) => (
                    <div key={member.memberId} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm">{member.memberName}</span>
                      </div>
                      <span className="text-sm font-semibold">{member.count} presenças</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Doadores */}
          <Card>
            <CardHeader>
              <CardTitle>Top Doadores</CardTitle>
            </CardHeader>
            <CardContent>
              {data.finances.topDonors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
              ) : (
                <div className="space-y-2">
                  {data.finances.topDonors.slice(0, 10).map((donor, index) => (
                    <div key={donor.memberId} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{donor.memberName}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(donor.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Crescimento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Membros (Últimos 12 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.members.growthByMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-2">
                {data.members.growthByMonth.map((month) => (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(month.count / Math.max(...data.members.growthByMonth.map(m => m.count))) * 100}%` }}
                        >
                          {month.count > 0 && (
                            <span className="text-xs font-medium text-primary-foreground">{month.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-right">{month.count}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finanças Mensais */}
        <Card>
          <CardHeader>
            <CardTitle>Finanças Mensais (Últimos 12 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.finances.byMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-4">
                {data.finances.byMonth.map((month) => {
                  const balance = month.income - month.expenses
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                        <span className={`text-sm font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Saldo: {formatCurrency(balance)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Receitas: </span>
                          <span className="font-semibold text-green-600">{formatCurrency(month.income)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Despesas: </span>
                          <span className="font-semibold text-red-600">{formatCurrency(month.expenses)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Doações: </span>
                          <span className="font-semibold text-blue-600">{formatCurrency(month.donations)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

