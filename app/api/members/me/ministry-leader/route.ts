import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

/**
 * Verifica se o membro autenticado é líder de algum ministério
 * Retorna informações dos ministérios onde é líder
 */
export async function GET(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Buscar ministérios onde o membro é líder
    const ministries = await prisma.ministry.findMany({
      where: {
        leaderId: member.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
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
    })

    return NextResponse.json(
      {
        isLeader: ministries.length > 0,
        ministries: ministries.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          membersCount: m.members.length,
          upcomingSchedulesCount: m.schedules.length,
        })),
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Erro ao verificar líder de ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar líder de ministério' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

