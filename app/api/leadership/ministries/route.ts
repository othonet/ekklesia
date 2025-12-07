import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'

/**
 * Busca os ministérios onde o usuário atual é líder
 * O usuário é identificado através do email, buscando o Member correspondente
 */
export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId || !user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar o membro correspondente ao usuário através do email
    const member = await prisma.member.findUnique({
      where: {
        email: user.email,
        churchId: user.churchId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!member) {
      // Se não encontrar membro, retorna lista vazia (usuário pode não ser membro)
      return NextResponse.json({
        isLeader: false,
        ministries: [],
      })
    }

    // Buscar ministérios onde o membro é líder
    const ministries = await prisma.ministry.findMany({
      where: {
        leaderId: member.id,
        churchId: user.churchId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        createdAt: true,
        members: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
              },
            },
          },
        },
        schedules: {
          where: {
            active: true,
            date: {
              gte: new Date(), // Apenas escalas futuras
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 5, // Limitar a 5 próximas escalas
          include: {
            assignedMembers: {
              include: {
                memberMinistry: {
                  include: {
                    member: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      isLeader: ministries.length > 0,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
      ministries: ministries.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        active: m.active,
        createdAt: m.createdAt,
        membersCount: m.members.length,
        members: m.members.map(mm => ({
          id: mm.member.id,
          name: mm.member.name,
          email: mm.member.email,
          phone: mm.member.phone,
          status: mm.member.status,
          role: mm.role,
          joinedAt: mm.joinedAt,
        })),
        upcomingSchedules: m.schedules.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
          assignedMembers: s.assignedMembers.map(am => ({
            id: am.memberMinistry.member.id,
            name: am.memberMinistry.member.name,
            email: am.memberMinistry.member.email,
          })),
        })),
        upcomingSchedulesCount: m.schedules.length,
      })),
    })
  } catch (error: any) {
    console.error('Erro ao buscar ministérios de liderança:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ministérios de liderança' },
      { status: 500 }
    )
  }
}

