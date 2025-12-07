import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyDeletionScheduled } from '@/lib/notifications'
import { getAuthenticatedMember } from '@/lib/member-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Motivo da solicitação é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Criar solicitação de exclusão
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + 30) // 30 dias conforme LGPD

    const dataRequest = await prisma.dataRequest.create({
      data: {
        memberId: member.id,
        requestType: 'DELETE',
        status: 'PENDING',
        scheduledDeletionAt: deletionDate,
        notes: reason,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Registrar log de auditoria (sem userId pois é ação do próprio membro)
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: member.email || null,
        action: 'DELETE_REQUEST',
        entityType: 'MEMBER',
        entityId: member.id,
        description: `Solicitação de exclusão de dados por ${member.name} - Motivo: ${reason}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Enviar notificação sobre exclusão agendada
    if (member.email) {
      try {
        await notifyDeletionScheduled(member.email, member.name, deletionDate)
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de exclusão criada com sucesso. Você receberá um email de confirmação.',
      scheduledDeletionAt: deletionDate,
      requestId: dataRequest.id,
      canCancelUntil: deletionDate.toISOString(),
    })
  } catch (error: any) {
    console.error('Erro ao criar solicitação de exclusão:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar solicitação de exclusão' },
      { status: 500 }
    )
  }
}
