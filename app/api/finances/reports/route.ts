import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || 'month' // month, year, all

    const now = new Date()
    let dateFilter: { gte?: Date; lte?: Date } = {}

    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else {
      // Filtro padrão baseado no período
      switch (period) {
        case 'month':
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          }
          break
        case 'year':
          dateFilter = {
            gte: new Date(now.getFullYear(), 0, 1),
            lte: new Date(now.getFullYear(), 11, 31),
          }
          break
        // 'all' não aplica filtro de data
      }
    }

    // Buscar todas as transações financeiras (tudo está unificado em Finance)
    const finances = await prisma.finance.findMany({
      where: {
        churchId: user.churchId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Calcular totais (tudo está em Finance agora)
    const totalIncome = finances
      .filter((f) => f.type === 'INCOME')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    const totalExpenses = finances
      .filter((f) => f.type === 'EXPENSE')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    // Doações são receitas com donationType
    const totalDonations = finances
      .filter((f) => f.type === 'INCOME' && f.donationType)
      .reduce((sum, f) => sum + Number(f.amount), 0)

    const balance = totalIncome - totalExpenses

    // Agrupar por categoria
    const expensesByCategory: Record<string, number> = {}
    finances
      .filter((f) => f.type === 'EXPENSE')
      .forEach((f) => {
        const category = f.category || 'Sem categoria'
        expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(f.amount)
      })

    // Agrupar por tipo de doação (receitas com donationType)
    const donationsByType: Record<string, number> = {}
    finances
      .filter((f) => f.type === 'INCOME' && f.donationType)
      .forEach((f) => {
        const type = f.donationType || 'OFFERING'
        donationsByType[type] = (donationsByType[type] || 0) + Number(f.amount)
      })

    // Agrupar por método de pagamento (receitas com método)
    const paymentsByMethod: Record<string, number> = {}
    finances
      .filter((f) => f.type === 'INCOME' && f.method)
      .forEach((f) => {
        const method = f.method || 'Outros'
        paymentsByMethod[method] = (paymentsByMethod[method] || 0) + Number(f.amount)
      })

    // Dados mensais para gráfico
    const monthlyData: Record<string, { income: number; expenses: number; donations: number }> = {}
    finances.forEach((f) => {
      const month = new Date(f.date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0, donations: 0 }
      }
      if (f.type === 'INCOME') {
        monthlyData[month].income += Number(f.amount)
        if (f.donationType) {
          monthlyData[month].donations += Number(f.amount)
        }
      } else {
        monthlyData[month].expenses += Number(f.amount)
      }
    })

    // Top 10 doadores (receitas com membro associado)
    const topDonors: Array<{ memberId: string; memberName: string; total: number }> = []
    const donorTotals: Record<string, { name: string; total: number }> = {}

    finances
      .filter((f) => f.type === 'INCOME' && f.memberId && f.member)
      .forEach((f) => {
        if (!donorTotals[f.memberId!]) {
          donorTotals[f.memberId!] = { name: f.member!.name, total: 0 }
        }
        donorTotals[f.memberId!].total += Number(f.amount)
      })

    Object.entries(donorTotals)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10)
      .forEach(([memberId, data]) => {
        topDonors.push({
          memberId,
          memberName: data.name,
          total: data.total,
        })
      })

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        totalDonations,
        totalPayments: 0, // Não é mais necessário separar
        balance,
      },
      expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount,
      })),
      donationsByType: Object.entries(donationsByType).map(([type, amount]) => ({
        type,
        amount,
      })),
      paymentsByMethod: Object.entries(paymentsByMethod).map(([method, amount]) => ({
        method,
        amount,
      })),
      monthlyData: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          ...data,
        })),
      topDonors,
    })
  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

