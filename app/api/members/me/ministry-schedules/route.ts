import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca escalas de ministério do membro autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Buscar ministérios do membro
    const memberMinistries = await prisma.memberMinistry.findMany({
      where: {
        memberId: member.id,
      },
      include: {
        ministry: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    if (memberMinistries.length === 0) {
      return NextResponse.json({
        schedules: [],
        ministries: [],
        message: 'Você não está vinculado a nenhum ministério',
      })
    }

    const memberMinistryIds = memberMinistries.map(mm => mm.id)

    // Buscar escalas onde o membro está escalado
    const scheduleMembers = await prisma.ministryScheduleMember.findMany({
      where: {
        memberMinistryId: {
          in: memberMinistryIds,
        },
      },
      include: {
        schedule: {
          include: {
            ministry: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        memberMinistry: {
          include: {
            ministry: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        schedule: {
          date: 'asc',
        },
      },
    })

    // Formatar resposta
    const schedules = scheduleMembers.map(sm => ({
      id: sm.schedule.id,
      title: sm.schedule.title,
      description: sm.schedule.description,
      date: sm.schedule.date,
      startTime: sm.schedule.startTime,
      endTime: sm.schedule.endTime,
      location: sm.schedule.location,
      notes: sm.schedule.notes,
      ministry: {
        id: sm.schedule.ministry.id,
        name: sm.schedule.ministry.name,
        description: sm.schedule.ministry.description,
      },
      role: sm.role,
      confirmed: sm.confirmed,
      confirmedAt: sm.confirmedAt,
    }))

    // Filtrar apenas escalas futuras ou do último mês
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const filteredSchedules = schedules.filter(s => new Date(s.date) >= oneMonthAgo)

    return NextResponse.json({
      schedules: filteredSchedules,
      ministries: memberMinistries.map(mm => ({
        id: mm.ministry.id,
        name: mm.ministry.name,
        role: mm.role,
      })),
    })
  } catch (error: any) {
    console.error('Erro ao buscar escalas de ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar escalas' },
      { status: 500 }
    )
  }
}
