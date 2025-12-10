import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'
import { getCorsHeaders } from '@/lib/cors'

type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

interface PastoralAlert {
  type: string
  severity: AlertSeverity
  title: string
  description: string
  memberId: string | null
  memberName: string
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request) }
      )
    }

    // Apenas pastores/líderes veem alertas
    const allowedRoles = ['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR', 'LEADER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const alerts: PastoralAlert[] = []

    // 1. Membros que não frequentam há muito tempo
    const daysWithoutAttendance = 30 // Configurável
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysWithoutAttendance)

    const membersWithoutAttendance = await prisma.member.findMany({
      where: {
        churchId: user.churchId,
        status: 'ACTIVE',
        deletedAt: null,
        attendances: {
          none: {
            date: {
              gte: cutoffDate,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        memberSince: true,
      },
      take: 10,
    })

    for (const member of membersWithoutAttendance) {
      const lastAttendance = await prisma.attendance.findFirst({
        where: {
          memberId: member.id,
        },
        orderBy: {
          date: 'desc',
        },
      })

      const daysAgo = lastAttendance
        ? Math.floor((Date.now() - new Date(lastAttendance.date).getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((Date.now() - new Date(member.memberSince).getTime()) / (1000 * 60 * 60 * 24))

      alerts.push({
        type: 'NO_ATTENDANCE',
        severity: daysAgo > 60 ? 'CRITICAL' : daysAgo > 30 ? 'HIGH' : 'MEDIUM',
        title: `${member.name} não frequenta há ${daysAgo} dias`,
        description: `Última presença: ${lastAttendance ? new Date(lastAttendance.date).toLocaleDateString('pt-BR') : 'Nunca'}`,
        memberId: member.id,
        memberName: member.name,
        daysAgo,
      })
    }

    // 2. Aniversários próximos (próximos 7 dias)
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const upcomingBirthdays = await prisma.member.findMany({
      where: {
        churchId: user.churchId,
        status: 'ACTIVE',
        deletedAt: null,
        birthDate: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
      },
    })

    for (const member of upcomingBirthdays) {
      if (!member.birthDate) continue

      const birthDate = new Date(member.birthDate)
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())

      let birthday = thisYearBirthday
      if (thisYearBirthday < today) {
        birthday = nextYearBirthday
      }

      const daysUntil = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil >= 0 && daysUntil <= 7) {
        // Verificar se já houve visita recente
        const recentVisit = await prisma.pastoralVisit.findFirst({
          where: {
            memberId: member.id,
            visitDate: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
            },
          },
        })

        if (!recentVisit) {
          alerts.push({
            type: 'BIRTHDAY',
            severity: daysUntil === 0 ? 'HIGH' : 'MEDIUM',
            title: `Aniversário de ${member.name} em ${daysUntil === 0 ? 'hoje' : `${daysUntil} dias`}`,
            description: `Data: ${birthday.toLocaleDateString('pt-BR')}`,
            memberId: member.id,
            memberName: member.name,
            birthday: birthday.toISOString(),
            daysUntil,
          })
        }
      }
    }

    // 3. Necessidades críticas pendentes
    const criticalNeeds = await prisma.memberNeed.findMany({
      where: {
        churchId: user.churchId,
        status: {
          in: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED'],
        },
        urgency: 'CRITICAL',
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    })

    for (const need of criticalNeeds) {
      alerts.push({
        type: 'CRITICAL_NEED',
        severity: 'CRITICAL',
        title: `Necessidade crítica: ${need.member.name}`,
        description: `${need.type} - ${need.description || 'Sem descrição'}`,
        memberId: need.memberId,
        memberName: need.member.name || 'Membro desconhecido',
        needId: need.id,
        needType: need.type,
      })
    }

    // 4. Pedidos de oração urgentes sem resposta
    const urgentPrayers = await prisma.prayerRequest.findMany({
      where: {
        churchId: user.churchId,
        status: {
          in: ['PENDING', 'PRAYING'],
        },
        urgency: {
          in: ['HIGH', 'CRITICAL'],
        },
        createdAt: {
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Há mais de 7 dias
        },
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    })

    for (const prayer of urgentPrayers) {
      const daysAgo = Math.floor((Date.now() - new Date(prayer.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      alerts.push({
        type: 'PRAYER_WITHOUT_RESPONSE',
        severity: 'HIGH',
        title: `Pedido de oração urgente sem resposta há ${daysAgo} dias`,
        description: `${prayer.requestedBy} - ${prayer.type}`,
        memberId: prayer.memberId || null,
        memberName: prayer.member?.name || prayer.requestedBy || 'Membro desconhecido',
        prayerId: prayer.id,
        daysAgo,
      })
    }

    // 5. Membros sem visita pastoral há muito tempo (3 meses)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const membersWithoutVisit = await prisma.member.findMany({
      where: {
        churchId: user.churchId,
        status: 'ACTIVE',
        deletedAt: null,
        pastoralVisits: {
          none: {
            visitDate: {
              gte: threeMonthsAgo,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        memberSince: true,
      },
      take: 10,
    })

    for (const member of membersWithoutVisit) {
      const lastVisit = await prisma.pastoralVisit.findFirst({
        where: {
          memberId: member.id,
        },
        orderBy: {
          visitDate: 'desc',
        },
      })

      const monthsAgo = lastVisit
        ? Math.floor((Date.now() - new Date(lastVisit.visitDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : Math.floor((Date.now() - new Date(member.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30))

      if (monthsAgo >= 3) {
        alerts.push({
          type: 'NO_PASTORAL_VISIT',
          severity: monthsAgo > 6 ? 'HIGH' : 'MEDIUM',
          title: `${member.name} sem visita pastoral há ${monthsAgo} meses`,
          description: `Última visita: ${lastVisit ? new Date(lastVisit.visitDate).toLocaleDateString('pt-BR') : 'Nunca'}`,
          memberId: member.id,
          memberName: member.name,
          monthsAgo,
        })
      }
    }

    // Ordenar por severidade
    const severityOrder: Record<AlertSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    alerts.sort((a, b) => {
      const aOrder = severityOrder[a.severity] ?? 999
      const bOrder = severityOrder[b.severity] ?? 999
      return aOrder - bOrder
    })

    return NextResponse.json(
      {
        alerts,
        summary: {
          total: alerts.length,
          critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
          high: alerts.filter((a) => a.severity === 'HIGH').length,
          medium: alerts.filter((a) => a.severity === 'MEDIUM').length,
        },
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar alertas' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

