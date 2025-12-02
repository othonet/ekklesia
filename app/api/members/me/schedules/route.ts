import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

// Headers CORS
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() })
}

/**
 * Busca escalas do membro autenticado via JWT
 * Endpoint para uso do app mobile
 */
export async function GET(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { 
          status: 401,
          headers: getCorsHeaders(),
        }
      )
    }

    // Buscar escalas do membro através dos ministérios
    const schedules = await prisma.ministrySchedule.findMany({
      where: {
        assignedMembers: {
          some: {
            memberMinistry: {
              memberId: member.id,
            },
          },
        },
      },
      include: {
        ministry: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assignedMembers: {
          where: {
            memberMinistry: {
              memberId: member.id,
            },
          },
          include: {
            memberMinistry: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Transformar dados para o formato esperado pelo app mobile
    const transformedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      ministryId: schedule.ministryId,
      ministryName: schedule.ministry.name,
      title: schedule.title,
      description: schedule.description,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      role: schedule.assignedMembers[0]?.role || schedule.assignedMembers[0]?.memberMinistry?.role || null,
      status: schedule.active ? (schedule.date >= new Date() ? 'SCHEDULED' : 'COMPLETED') : 'CANCELLED',
      createdAt: schedule.createdAt,
    }))

    return NextResponse.json(
      transformedSchedules,
      { headers: getCorsHeaders() }
    )
  } catch (error: any) {
    console.error('Erro ao buscar escalas do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar escalas' },
      { 
        status: 500,
        headers: getCorsHeaders(),
      }
    )
  }
}

