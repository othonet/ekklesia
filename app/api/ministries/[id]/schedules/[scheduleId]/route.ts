import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

/**
 * Deleta uma escala de ministério
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> | { id: string; scheduleId: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const { id: ministryId, scheduleId } = resolvedParams

    // Verificar se o ministério pertence à igreja
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: user.churchId,
      },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    // Verificar se a escala existe e pertence ao ministério
    const schedule = await prisma.ministrySchedule.findFirst({
      where: {
        id: scheduleId,
        ministryId: ministryId,
        churchId: user.churchId,
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 })
    }

    // Deletar a escala (cascade deleta os membros associados)
    await prisma.ministrySchedule.delete({
      where: { id: scheduleId },
    })

    // Registrar log de auditoria
    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'DELETE',
      entityType: 'MINISTRY_SCHEDULE',
      entityId: scheduleId,
      description: `Escala "${schedule.title}" deletada do ministério ${ministry.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar escala:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

