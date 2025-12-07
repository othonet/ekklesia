import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Lista eventos da igreja para o membro autenticado
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

    // Buscar apenas eventos futuros da igreja do membro
    const now = new Date()
    const events = await prisma.event.findMany({
      where: {
        churchId: member.churchId,
        active: true,
        // Apenas eventos futuros (não incluir eventos que já ocorreram)
        date: {
          gte: now,
        },
      },
      include: {
        attendances: {
          where: {
            memberId: member.id,
          },
          select: {
            id: true,
            present: true,
            date: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Formatar resposta com informação de presença
    const formattedEvents = events.map((event) => {
      const attendance = event.attendances[0] // Pode haver apenas uma presença por evento
      // hasAttendance deve ser true apenas se a presença foi confirmada (present === true)
      const hasAttendance = attendance ? attendance.present === true : false
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        type: event.type,
        hasAttendance: hasAttendance,
        attendance: attendance ? {
          id: attendance.id,
          present: attendance.present,
          date: attendance.date,
        } : null,
      }
    })

    return NextResponse.json(formattedEvents)
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar eventos' },
      { status: 500 }
    )
  }
}

