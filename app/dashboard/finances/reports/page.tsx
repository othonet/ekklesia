'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface ReportData {
  summary: {
    totalIncome: number
    totalExpenses: number
    totalDonations: number
    totalPayments: number
    balance: number
  }
  expensesByCategory: Array<{ category: string; amount: number }>
  donationsByType: Array<{ type: string; amount: number }>
  paymentsByMethod: Array<{ method: string; amount: number }>
  monthlyData: Array<{ month: string; income: number; expenses: number; donations: number }>
  topDonors: Array<{ memberId: string; memberName: string; total: number }>
}

export default function FinancialReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchReport()
  }, [period, startDate, endDate])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      } else {
        params.append('period', period)
      }

      const res = await fetch(`/api/finances/reports?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
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

  const getDonationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TITHE: 'Dízimo',
      OFFERING: 'Oferta',
      CONTRIBUTION: 'Contribuição',
    }
    return labels[type] || type
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      BANK_SLIP: 'Boleto',
      CASH: 'Dinheiro',
      TRANSFER: 'Transferência',
    }
    return labels[method] || method
  }

  const exportReport = () => {
    if (!reportData) return

    const doc = new jsPDF('portrait', 'mm', 'a4')
    let yPos = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - (margin * 2)

    // Cabeçalho
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const periodLabel = period === 'month' ? 'Este Mês' : period === 'year' ? 'Este Ano' : period === 'all' ? 'Todos os Períodos' : `Período: ${startDate} a ${endDate}`
    doc.text(`Período: ${periodLabel}`, margin, yPos)
    yPos += 5
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos)
    yPos += 15

    // Resumo
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo', margin, yPos)
    yPos += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const summaryItems = [
      ['Receitas', formatCurrency(reportData.summary.totalIncome), 'green'],
      ['Despesas', formatCurrency(reportData.summary.totalExpenses), 'red'],
      ['Doações', formatCurrency(reportData.summary.totalDonations), 'blue'],
      ['Pagamentos Online', formatCurrency(reportData.summary.totalPayments), 'purple'],
      ['Saldo', formatCurrency(reportData.summary.balance), reportData.summary.balance >= 0 ? 'green' : 'red'],
    ]

    summaryItems.forEach(([label, value, color]) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.setTextColor(0, 0, 0)
      doc.text(`${label}:`, margin, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(value, margin + 80, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 8
    })

    yPos += 10

    // Despesas por Categoria
    if (reportData.expensesByCategory.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Despesas por Categoria', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      reportData.expensesByCategory
        .sort((a, b) => b.amount - a.amount)
        .forEach((item) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(`${item.category || 'Sem categoria'}:`, margin, yPos)
          doc.setFont('helvetica', 'bold')
          doc.text(formatCurrency(item.amount), margin + 100, yPos)
          doc.setFont('helvetica', 'normal')
          yPos += 7
        })
      yPos += 5
    }

    // Doações por Tipo
    if (reportData.donationsByType.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Doações por Tipo', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      reportData.donationsByType
        .sort((a, b) => b.amount - a.amount)
        .forEach((item) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(`${getDonationTypeLabel(item.type)}:`, margin, yPos)
          doc.setFont('helvetica', 'bold')
          doc.text(formatCurrency(item.amount), margin + 100, yPos)
          doc.setFont('helvetica', 'normal')
          yPos += 7
        })
      yPos += 5
    }

    // Pagamentos por Método
    if (reportData.paymentsByMethod.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Pagamentos por Método', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      reportData.paymentsByMethod
        .sort((a, b) => b.amount - a.amount)
        .forEach((item) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(`${getPaymentMethodLabel(item.method)}:`, margin, yPos)
          doc.setFont('helvetica', 'bold')
          doc.text(formatCurrency(item.amount), margin + 100, yPos)
          doc.setFont('helvetica', 'normal')
          yPos += 7
        })
      yPos += 5
    }

    // Top 10 Doadores
    if (reportData.topDonors.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Top 10 Doadores', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      reportData.topDonors.forEach((donor, index) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`#${index + 1} ${donor.memberName}:`, margin, yPos)
        doc.setFont('helvetica', 'bold')
        doc.text(formatCurrency(donor.total), margin + 100, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 7
      })
      yPos += 5
    }

    // Evolução Mensal
    if (reportData.monthlyData.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Evolução Mensal', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      reportData.monthlyData.forEach((month) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        const totalIncome = month.income + month.donations
        const balance = totalIncome - month.expenses

        doc.setFont('helvetica', 'bold')
        doc.text(month.month, margin, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 6

        doc.text(`  Receitas: ${formatCurrency(totalIncome)}`, margin + 5, yPos)
        yPos += 6
        doc.text(`  Despesas: ${formatCurrency(month.expenses)}`, margin + 5, yPos)
        yPos += 6
        doc.setFont('helvetica', 'bold')
        doc.text(`  Saldo: ${formatCurrency(balance)}`, margin + 5, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 10
      })
    }

    // Salvar PDF
    const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
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
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="rounded-lg border p-6 space-y-4">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-4">
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                <div className="space-y-3">
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

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Erro ao carregar relatório</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
            <p className="text-muted-foreground">Análise detalhada das finanças</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Este Mês</SelectItem>
                    <SelectItem value="year">Este Ano</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {period === 'custom' && (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(reportData.summary.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(reportData.summary.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doações</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(reportData.summary.totalDonations)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Online</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(reportData.summary.totalPayments)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  reportData.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(reportData.summary.balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Despesas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.expensesByCategory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma despesa registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {reportData.expensesByCategory
                    .sort((a, b) => b.amount - a.amount)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.category}</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doações por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Doações por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.donationsByType.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma doação registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {reportData.donationsByType
                    .sort((a, b) => b.amount - a.amount)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{getDonationTypeLabel(item.type)}</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagamentos por Método */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos por Método</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.paymentsByMethod.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum pagamento online registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {reportData.paymentsByMethod
                    .sort((a, b) => b.amount - a.amount)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{getPaymentMethodLabel(item.method)}</span>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top 10 Doadores */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Doadores</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.topDonors.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum doador registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {reportData.topDonors.map((donor, index) => (
                    <div key={donor.memberId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-sm">{donor.memberName}</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(donor.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum dado disponível para o período selecionado
              </p>
            ) : (
              <div className="space-y-4">
                {reportData.monthlyData.map((month, index) => {
                  const total = month.income + month.donations
                  const maxValue = Math.max(
                    ...reportData.monthlyData.map(
                      (m) => m.income + m.donations + m.expenses
                    )
                  )

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex gap-4">
                          <span className="text-green-600">
                            +{formatCurrency(month.income + month.donations)}
                          </span>
                          <span className="text-red-600">
                            -{formatCurrency(month.expenses)}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(total - month.expenses)}
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-green-600"
                            style={{
                              width: `${((month.income + month.donations) / maxValue) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-red-600"
                            style={{
                              width: `${(month.expenses / maxValue) * 100}%`,
                            }}
                          />
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

