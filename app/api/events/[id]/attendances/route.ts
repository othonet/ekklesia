import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

/**
 * Lista confirmações de presença de um evento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)

    // Verificar se o evento pertence à igreja
    const event = await prisma.event.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    // Buscar todas as confirmações de presença do evento
    const attendances = await prisma.attendance.findMany({
      where: {
        eventId: resolvedParams.id,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Separar confirmados e não confirmados
    const confirmed = attendances.filter(a => a.present)
    const notConfirmed = attendances.filter(a => !a.present)

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
      },
      total: attendances.length,
      confirmed: confirmed.length,
      notConfirmed: notConfirmed.length,
      attendances: attendances.map(a => ({
        id: a.id,
        member: {
          id: a.member.id,
          name: a.member.name,
          email: a.member.email,
          phone: a.member.phone,
        },
        present: a.present,
        date: a.date,
        createdAt: a.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('Erro ao buscar confirmações de presença:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

