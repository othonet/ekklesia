import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, createErrorResponse, createSuccessResponse, checkSystemEnabled } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar se o sistema está habilitado
    const systemCheck = await checkSystemEnabled(request)
    if (systemCheck) return systemCheck

    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      members,
      activeMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      ministries,
      activeMinistries,
      upcomingEvents,
      finances,
      financesThisMonth,
      financesLastMonth,
      totalAttendance,
    ] = await Promise.all([
      prisma.member.count({
        where: { churchId: user.churchId, deletedAt: null },
      }),
      prisma.member.count({
        where: { churchId: user.churchId, status: 'ACTIVE', deletedAt: null },
      }),
      prisma.member.count({
        where: {
          churchId: user.churchId,
          deletedAt: null,
          createdAt: { gte: thisMonthStart },
        },
      }),
      prisma.member.count({
        where: {
          churchId: user.churchId,
          deletedAt: null,
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
      prisma.ministry.count({
        where: { churchId: user.churchId },
      }),
      prisma.ministry.count({
        where: { churchId: user.churchId, active: true },
      }),
      prisma.event.count({
        where: {
          churchId: user.churchId,
          active: true,
          date: { gte: new Date() },
        },
      }),
      prisma.finance.findMany({
        where: { churchId: user.churchId },
        select: { type: true, amount: true, donationType: true },
      }),
      prisma.finance.findMany({
        where: {
          churchId: user.churchId,
          date: { gte: thisMonthStart },
        },
        select: { type: true, amount: true },
      }),
      prisma.finance.findMany({
        where: {
          churchId: user.churchId,
          date: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        select: { type: true, amount: true },
      }),
      prisma.attendance.count({
        where: {
          member: { churchId: user.churchId },
          date: { gte: thisMonthStart },
        },
      }),
    ])

    // Tudo está unificado em Finance agora
    const totalIncome = finances
      .filter(f => f.type === 'INCOME')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    const totalExpenses = finances
      .filter(f => f.type === 'EXPENSE')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    // Calcular doações separadamente para exibição (opcional)
    const totalDonations = finances
      .filter(f => f.type === 'INCOME' && f.donationType)
      .reduce((sum, f) => sum + Number(f.amount), 0)

    // Saldo = receitas - despesas (tudo unificado)
    const balance = totalIncome - totalExpenses

    // Finanças deste mês
    const incomeThisMonth = financesThisMonth
      .filter(f => f.type === 'INCOME')
      .reduce((sum, f) => sum + Number(f.amount), 0)
    const expensesThisMonth = financesThisMonth
      .filter(f => f.type === 'EXPENSE')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    // Finanças do mês passado
    const incomeLastMonth = financesLastMonth
      .filter(f => f.type === 'INCOME')
      .reduce((sum, f) => sum + Number(f.amount), 0)
    const expensesLastMonth = financesLastMonth
      .filter(f => f.type === 'EXPENSE')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    // Calcular variações
    const incomeVariation = incomeLastMonth > 0
      ? ((incomeThisMonth - incomeLastMonth) / incomeLastMonth) * 100
      : incomeThisMonth > 0 ? 100 : 0

    const expensesVariation = expensesLastMonth > 0
      ? ((expensesThisMonth - expensesLastMonth) / expensesLastMonth) * 100
      : expensesThisMonth > 0 ? 100 : 0

    const membersGrowthRate = newMembersLastMonth > 0
      ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100
      : newMembersThisMonth > 0 ? 100 : 0

    return createSuccessResponse({
      members,
      activeMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      membersGrowthRate: Math.round(membersGrowthRate * 100) / 100,
      ministries,
      activeMinistries,
      upcomingEvents,
      totalIncome,
      totalDonations,
      totalExpenses,
      balance,
      incomeThisMonth,
      expensesThisMonth,
      incomeLastMonth,
      expensesLastMonth,
      incomeVariation: Math.round(incomeVariation * 100) / 100,
      expensesVariation: Math.round(expensesVariation * 100) / 100,
      totalAttendance,
    })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return createErrorResponse(error.message || 'Erro ao buscar estatísticas', 500)
  }
}

