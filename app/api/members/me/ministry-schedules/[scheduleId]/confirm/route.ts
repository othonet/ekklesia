import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Confirma ou cancela presença do membro em uma escala
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> | { scheduleId: string } }
) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { confirmed } = body

    if (typeof confirmed !== 'boolean') {
      return NextResponse.json(
        { error: 'Parâmetro "confirmed" deve ser true ou false' },
        { status: 400 }
      )
    }

    // Buscar a escala e verificar se o membro está escalado
    const scheduleMember = await prisma.ministryScheduleMember.findFirst({
      where: {
        scheduleId: resolvedParams.scheduleId,
        memberMinistry: {
          memberId: member.id,
        },
      },
      include: {
        schedule: {
          include: {
            ministry: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!scheduleMember) {
      return NextResponse.json(
        { error: 'Você não está escalado para esta atividade' },
        { status: 404 }
      )
    }

    // Atualizar confirmação
    const updated = await prisma.ministryScheduleMember.update({
      where: { id: scheduleMember.id },
      data: {
        confirmed,
        confirmedAt: confirmed ? new Date() : null,
      },
      include: {
        schedule: {
          include: {
            ministry: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: member.email || null,
        action: 'UPDATE',
        entityType: 'MINISTRY_SCHEDULE_MEMBER',
        entityId: updated.id,
        description: `Membro ${member.name} ${confirmed ? 'confirmou' : 'cancelou'} presença na escala "${updated.schedule.title}"`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: confirmed ? 'Presença confirmada com sucesso' : 'Presença cancelada com sucesso',
      scheduleMember: updated,
    })
  } catch (error: any) {
    console.error('Erro ao confirmar presença na escala:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao confirmar presença' },
      { status: 500 }
    )
  }
}

