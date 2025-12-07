import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions-helpers'

/**
 * API de Analytics e Relatórios
 * Retorna indicadores de crescimento, frequência, finanças e muito mais
 */
export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return createErrorResponse('Não autorizado', 401)
    }

    // Verificar permissão para ler analytics
    if (!(await checkPermission(request, 'analytics:read'))) {
      return createErrorResponse('Acesso negado. Você não tem permissão para visualizar analytics.', 403)
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year, all
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calcular período
    const now = new Date()
    let dateFilter: { gte?: Date; lte?: Date } = {}
    
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else {
      switch (period) {
        case 'month':
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          }
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          dateFilter = {
            gte: new Date(now.getFullYear(), quarter * 3, 1),
            lte: new Date(now.getFullYear(), (quarter + 1) * 3, 0),
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
    }

    const whereBase = { churchId: user.churchId, deletedAt: null }

    // 1. INDICADORES DE MEMBROS
    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      visitors,
      newMembersThisPeriod,
      newMembersLastPeriod,
      membersByStatus,
      membersGrowth,
    ] = await Promise.all([
      // Total de membros
      prisma.member.count({
        where: whereBase,
      }),
      // Membros ativos
      prisma.member.count({
        where: { ...whereBase, status: 'ACTIVE' },
      }),
      // Membros inativos
      prisma.member.count({
        where: { ...whereBase, status: 'INACTIVE' },
      }),
      // Visitantes
      prisma.member.count({
        where: { ...whereBase, status: 'VISITOR' },
      }),
      // Novos membros no período
      prisma.member.count({
        where: {
          ...whereBase,
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
      }),
      // Novos membros no período anterior (para comparação)
      prisma.member.count({
        where: {
          ...whereBase,
          createdAt: Object.keys(dateFilter).length > 0 ? {
            gte: new Date(new Date(dateFilter.gte!).getTime() - (new Date(dateFilter.lte!).getTime() - new Date(dateFilter.gte!).getTime())),
            lte: new Date(dateFilter.gte!),
          } : undefined,
        },
      }),
      // Membros por status
      prisma.member.groupBy({
        by: ['status'],
        where: whereBase,
        _count: true,
      }),
      // Crescimento mensal de membros (últimos 12 meses) - usando Prisma para evitar problemas de nome de tabela
      (async () => {
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        
        const members = await prisma.member.findMany({
          where: {
            churchId: user.churchId,
            deletedAt: null,
            createdAt: { gte: twelveMonthsAgo },
          },
          select: { createdAt: true },
        })
        
        const grouped = members.reduce((acc, m) => {
          const month = m.createdAt.toISOString().slice(0, 7) // YYYY-MM
          acc[month] = (acc[month] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return Object.entries(grouped)
          .map(([month, count]) => ({ month, count: BigInt(count) }))
          .sort((a, b) => a.month.localeCompare(b.month))
      })(),
    ])

    // 2. INDICADORES DE FREQUÊNCIA
    const [
      totalAttendance,
      averageAttendance,
      attendanceByMonth,
      mostFrequentMembers,
    ] = await Promise.all([
      // Total de presenças registradas
      prisma.attendance.count({
        where: {
          member: { churchId: user.churchId },
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
      }),
      // Média de presenças por evento
      prisma.attendance.groupBy({
        by: ['eventId'],
        where: {
          member: { churchId: user.churchId },
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        _count: true,
      }).then(results => {
        const counts = results.map(r => Number(r._count))
        return counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0
      }),
      // Presenças por mês (últimos 12 meses)
      (async () => {
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        
        const attendances = await prisma.attendance.findMany({
          where: {
            member: {
              churchId: user.churchId,
              deletedAt: null,
            },
            date: { gte: twelveMonthsAgo },
          },
          select: { date: true },
        })
        
        const grouped = attendances.reduce((acc, a) => {
          const month = a.date.toISOString().slice(0, 7) // YYYY-MM
          acc[month] = (acc[month] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return Object.entries(grouped)
          .map(([month, count]) => ({ month, count: BigInt(count) }))
          .sort((a, b) => a.month.localeCompare(b.month))
      })(),
      // Membros mais frequentes (top 10)
      prisma.attendance.groupBy({
        by: ['memberId'],
        where: {
          member: { churchId: user.churchId },
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        _count: true,
        orderBy: { _count: { memberId: 'desc' } },
        take: 10,
      }).then(async (results) => {
        const memberIds = results.map(r => r.memberId)
        const members = await prisma.member.findMany({
          where: { id: { in: memberIds } },
          select: { id: true, name: true },
        })
        return results.map(r => ({
          memberId: r.memberId,
          memberName: members.find(m => m.id === r.memberId)?.name || 'Desconhecido',
          count: Number(r._count),
        }))
      }),
    ])

    // 3. INDICADORES FINANCEIROS
    const finances = await prisma.finance.findMany({
      where: {
        churchId: user.churchId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
    })

    const totalIncome = finances
      .filter(f => f.type === 'INCOME')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    const totalExpenses = finances
      .filter(f => f.type === 'EXPENSE')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    const totalDonations = finances
      .filter(f => f.type === 'INCOME' && f.donationType)
      .reduce((sum, f) => sum + Number(f.amount), 0)

    const balance = totalIncome - totalExpenses

    // Finanças por mês (últimos 12 meses)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const allFinances = await prisma.finance.findMany({
      where: {
        churchId: user.churchId,
        date: { gte: twelveMonthsAgo },
      },
      select: {
        date: true,
        type: true,
        amount: true,
        donationType: true,
      },
    })
    
    const financesByMonth = allFinances.reduce((acc, f) => {
      const month = f.date.toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, income: 0, expenses: 0, donations: 0 }
      }
      const amount = Number(f.amount)
      if (f.type === 'INCOME') {
        acc[month].income += amount
        if (f.donationType) {
          acc[month].donations += amount
        }
      } else {
        acc[month].expenses += amount
      }
      return acc
    }, {} as Record<string, { month: string; income: number; expenses: number; donations: number }>)
    
    const financesByMonthArray = Object.values(financesByMonth).sort((a, b) => a.month.localeCompare(b.month))

    // 4. INDICADORES DE MINISTÉRIOS E EVENTOS
    const [
      totalMinistries,
      activeMinistries,
      totalEvents,
      upcomingEvents,
      eventsThisPeriod,
    ] = await Promise.all([
      prisma.ministry.count({
        where: { churchId: user.churchId },
      }),
      prisma.ministry.count({
        where: { churchId: user.churchId, active: true },
      }),
      prisma.event.count({
        where: { churchId: user.churchId },
      }),
      prisma.event.count({
        where: {
          churchId: user.churchId,
          active: true,
          date: { gte: new Date() },
        },
      }),
      prisma.event.count({
        where: {
          churchId: user.churchId,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
      }),
    ])

    // 5. CALCULAR TAXAS DE CRESCIMENTO
    const membersGrowthRate = newMembersLastPeriod > 0
      ? ((newMembersThisPeriod - newMembersLastPeriod) / newMembersLastPeriod) * 100
      : newMembersThisPeriod > 0 ? 100 : 0

    // 6. TOP DOADORES
    const topDonors = await prisma.finance.groupBy({
      by: ['memberId'],
      where: {
        churchId: user.churchId,
        type: 'INCOME',
        donationType: { not: null },
        memberId: { not: null },
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    }).then(async (results) => {
      const memberIds = results.map(r => r.memberId).filter(Boolean) as string[]
      if (memberIds.length === 0) return []
      
      const members = await prisma.member.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true },
      })
      
      return results
        .filter(r => r.memberId)
        .map(r => ({
          memberId: r.memberId!,
          memberName: members.find(m => m.id === r.memberId)?.name || 'Desconhecido',
          total: Number(r._sum.amount || 0),
        }))
    })

    return createSuccessResponse({
      period: {
        type: period,
        startDate: dateFilter.gte?.toISOString(),
        endDate: dateFilter.lte?.toISOString(),
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: inactiveMembers,
        visitors,
        newThisPeriod: newMembersThisPeriod,
        newLastPeriod: newMembersLastPeriod,
        growthRate: Math.round(membersGrowthRate * 100) / 100,
        byStatus: membersByStatus.map(m => ({
          status: m.status,
          count: m._count,
        })),
        growthByMonth: membersGrowth.map(m => ({
          month: m.month,
          count: Number(m.count),
        })),
      },
      attendance: {
        total: totalAttendance,
        average: Math.round(averageAttendance * 100) / 100,
        byMonth: attendanceByMonth.map(a => ({
          month: a.month,
          count: Number(a.count),
        })),
        mostFrequent: mostFrequentMembers,
      },
      finances: {
        totalIncome,
        totalExpenses,
        totalDonations,
        balance,
        byMonth: financesByMonthArray.map(f => ({
          month: f.month,
          income: f.income,
          expenses: f.expenses,
          donations: f.donations,
        })),
        topDonors,
      },
      ministries: {
        total: totalMinistries,
        active: activeMinistries,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        thisPeriod: eventsThisPeriod,
      },
    })
  } catch (error: any) {
    console.error('Erro ao buscar analytics:', error)
    return createErrorResponse(error.message || 'Erro ao buscar analytics', 500)
  }
}

