import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCorsHeaders } from '@/lib/cors'
import { checkTransparencyAccess, checkPermission } from '@/lib/permissions-helpers'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

// Portal de transparência - acesso para:
// 1. Usuários autenticados com permissão transparency:read
// 2. Membros ativos que são dizimistas ou ofertantes (via token JWT)
export async function GET(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Verificar se prisma está inicializado
    if (!prisma) {
      console.error('Prisma não está inicializado')
      return NextResponse.json(
        { error: 'Erro de configuração do banco de dados. Por favor, execute: npm run db:generate' },
        { status: 500, headers: corsHeaders }
      )
    }

    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    const period = searchParams.get('period') || 'month'

    if (!churchId) {
      return NextResponse.json({ error: 'ID da igreja é obrigatório' }, { status: 400, headers: corsHeaders })
    }

    // Verificar acesso: usuário autenticado ou membro dizimista/ofertante
    const hasUserAccess = await checkPermission(request, 'transparency:read')
    const hasMemberAccess = await checkTransparencyAccess(request)
    
    if (!hasUserAccess && !hasMemberAccess) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas membros ativos dizimistas ou ofertantes podem acessar o Portal de Transparência.' },
        { status: 403, headers: corsHeaders }
      )
    }

    const now = new Date()
    let dateFilter: { gte?: Date; lte?: Date } = {}

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
      // 'all' não aplica filtro
    }

    // Buscar informações da igreja
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: {
        id: true,
        name: true,
        cnpj: true,
        address: true,
        city: true,
        state: true,
      },
    })

    if (!church) {
      return NextResponse.json({ error: 'Igreja não encontrada' }, { status: 404, headers: corsHeaders })
    }

    // Buscar todas as transações financeiras (tudo está unificado em Finance)
    const finances = await prisma.finance.findMany({
      where: {
        churchId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
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

    // Despesas por categoria (sem valores individuais sensíveis)
    const expensesByCategory: Record<string, number> = {}
    finances
      .filter((f) => f.type === 'EXPENSE')
      .forEach((f) => {
        const category = f.category || 'Outras'
        expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(f.amount)
      })

    // Doações por tipo (receitas com donationType)
    const donationsByType: Record<string, number> = {}
    finances
      .filter((f) => f.type === 'INCOME' && f.donationType)
      .forEach((f) => {
        const type = f.donationType || 'OFFERING'
        donationsByType[type] = (donationsByType[type] || 0) + Number(f.amount)
      })

    // Dados mensais (últimos 12 meses)
    const monthlyData: Record<string, { income: number; expenses: number; donations: number }> = {}
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
      monthlyData[month] = { income: 0, expenses: 0, donations: 0 }
    }

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

    return NextResponse.json({
      church: {
        name: church.name,
        cnpj: church.cnpj,
        address: church.address,
        city: church.city,
        state: church.state,
      },
      period,
      summary: {
        totalIncome,
        totalExpenses,
        totalDonations,
        totalPayments: 0, // Não é mais necessário separar
        balance,
      },
      expensesByCategory: Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        })),
      donationsByType: Object.entries(donationsByType).map(([type, amount]) => ({
        type,
        amount,
      })),
      monthlyData: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          ...data,
        })),
      lastUpdated: new Date().toISOString(),
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Erro ao gerar relatório de transparência:', error)
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao gerar relatório de transparência'
    
    if (error.message?.includes('findMany') || error.message?.includes('undefined')) {
      errorMessage = 'Erro de configuração do banco de dados. Por favor, execute: npm run db:generate && npm run db:push'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

