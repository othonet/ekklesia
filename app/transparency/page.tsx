'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, DollarSign, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransparencyData {
  church: {
    name: string
    cnpj: string | null
    address: string | null
    city: string | null
    state: string | null
  }
  period: string
  summary: {
    totalIncome: number
    totalExpenses: number
    totalDonations: number
    totalPayments: number
    balance: number
  }
  expensesByCategory: Array<{ category: string; amount: number; percentage: number }>
  donationsByType: Array<{ type: string; amount: number }>
  monthlyData: Array<{ month: string; income: number; expenses: number; donations: number }>
  lastUpdated: string
}

export default function TransparencyPage() {
  const [data, setData] = useState<TransparencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [churchId, setChurchId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Primeiro, verificar se há churchId na URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlChurchId = params.get('churchId')
      if (urlChurchId) {
        setChurchId(urlChurchId)
        localStorage.setItem('churchId', urlChurchId)
        return
      }
    }
  }, [])

  // Depois, buscar churchId de outras fontes se não houver na URL
  useEffect(() => {
    // Se já temos churchId da URL, não fazer nada
    if (churchId) return

    // Buscar churchId do token do usuário autenticado
    const getChurchIdFromToken = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // Tentar decodificar o token para pegar o churchId
          const tokenParts = token.split('.')
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]))
              if (payload.churchId) {
                setChurchId(payload.churchId)
                return
              }
            } catch (e) {
              // Token não pode ser decodificado, continuar
            }
          }
        }

        // Se não conseguir do token, tentar do localStorage
        const storedChurchId = localStorage.getItem('churchId')
        if (storedChurchId) {
          setChurchId(storedChurchId)
          return
        }

        // Se não houver churchId, buscar da primeira igreja disponível (para desenvolvimento)
        // Em produção, isso deveria ser removido ou exigir autenticação
        try {
          const churchesRes = await fetch('/api/transparency/churches')
          if (churchesRes.ok) {
            const churches = await churchesRes.json()
            if (churches.length > 0) {
              setChurchId(churches[0].id)
              localStorage.setItem('churchId', churches[0].id)
              return
            }
          }
        } catch (e) {
          console.error('Erro ao buscar igrejas:', e)
        }

        // Se não conseguir nenhum churchId, definir erro
        setError('Não foi possível identificar a igreja. Por favor, faça login ou configure o ID da igreja na URL: /transparency?churchId=SEU_ID')
        setLoading(false)
      } catch (err) {
        console.error('Erro ao buscar churchId:', err)
        setError('Erro ao carregar dados. Por favor, tente novamente.')
        setLoading(false)
      }
    }

    getChurchIdFromToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executar apenas uma vez na montagem

  useEffect(() => {
    if (churchId) {
      fetchData()
    }
  }, [churchId, period])

  const fetchData = async () => {
    if (!churchId) return
    
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/transparency?churchId=${churchId}&period=${period}`)
      if (res.ok) {
        const transparencyData = await res.json()
        setData(transparencyData)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        let errorMsg = errorData.error || 'Erro ao buscar dados de transparência'
        
        // Mensagens mais específicas para erros comuns
        if (errorMsg.includes('findMany') || errorMsg.includes('undefined') || errorMsg.includes('db:generate')) {
          errorMsg = 'O banco de dados precisa ser atualizado. Por favor, execute no terminal: npm run db:generate && npm run db:push'
        }
        
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError('Erro ao conectar com o servidor. Por favor, tente novamente.')
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

  const exportReport = () => {
    if (!data) return

    const csv = [
      ['Portal de Transparência - Prestação de Contas'],
      ['Igreja:', data.church.name],
      ['CNPJ:', data.church.cnpj || 'N/D'],
      ['Período:', period === 'month' ? 'Este Mês' : period === 'year' ? 'Este Ano' : 'Todos'],
      [''],
      ['Resumo Financeiro'],
      ['Receitas', formatCurrency(data.summary.totalIncome)],
      ['Despesas', formatCurrency(data.summary.totalExpenses)],
      ['Doações', formatCurrency(data.summary.totalDonations)],
      ['Pagamentos Online', formatCurrency(data.summary.totalPayments)],
      ['Saldo', formatCurrency(data.summary.balance)],
      [''],
      ['Despesas por Categoria'],
      ...data.expensesByCategory.map((e) => [
        e.category,
        formatCurrency(e.amount),
        `${e.percentage.toFixed(2)}%`,
      ]),
      [''],
      ['Doações por Tipo'],
      ...data.donationsByType.map((d) => [getDonationTypeLabel(d.type), formatCurrency(d.amount)]),
    ]

    const csvContent = csv.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `prestacao-contas-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }


  if (loading && !error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-64 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Carregando dados de transparência...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Erro ao Carregar Dados</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'Não foi possível carregar os dados de transparência.'}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Para acessar o portal de transparência, você precisa:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Fazer login no sistema, ou</li>
                <li>Acessar com o ID da igreja na URL: <code className="bg-muted px-2 py-1 rounded">/transparency?churchId=SEU_ID</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Portal de Transparência
            </h1>
            <p className="text-muted-foreground mt-1">
              Prestação de Contas - {data.church.name}
            </p>
            {data.church.cnpj && (
              <p className="text-sm text-muted-foreground">CNPJ: {data.church.cnpj}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.totalIncome)}
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
                {formatCurrency(data.summary.totalExpenses)}
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
                {formatCurrency(data.summary.totalDonations)}
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
                {formatCurrency(data.summary.totalPayments)}
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
                  data.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(data.summary.balance)}
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
              {data.expensesByCategory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma despesa registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {data.expensesByCategory.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.category}</span>
                        <div className="flex gap-2">
                          <span className="font-semibold text-red-600">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="text-muted-foreground">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
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
              {data.donationsByType.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma doação registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {data.donationsByType.map((item, index) => (
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
        </div>

        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Últimos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum dado disponível
              </p>
            ) : (
              <div className="space-y-4">
                {data.monthlyData.map((month, index) => {
                  const total = month.income + month.donations
                  const maxValue = Math.max(
                    ...data.monthlyData.map((m) => m.income + m.donations + m.expenses)
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

        {/* Informações de Atualização */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Última atualização:{' '}
                  {new Date(data.lastUpdated).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs">
                Este portal apresenta informações financeiras de forma transparente para os membros
                da igreja.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

