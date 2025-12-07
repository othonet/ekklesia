import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

export async function POST(request: NextRequest) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Buscar solicitação de exclusão pendente
    const deletionRequest = await prisma.dataRequest.findFirst({
      where: {
        memberId: member.id,
        requestType: 'DELETE',
        status: 'PENDING',
      },
      orderBy: { requestedAt: 'desc' },
    })

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'Nenhuma solicitação de exclusão pendente encontrada' },
        { status: 404 }
      )
    }

    // Verificar se ainda está dentro do período de graça
    if (deletionRequest.scheduledDeletionAt && new Date() >= deletionRequest.scheduledDeletionAt) {
      return NextResponse.json(
        { error: 'Período de cancelamento expirado. A exclusão não pode mais ser cancelada.' },
        { status: 400 }
      )
    }

    // Cancelar solicitação de exclusão
    await prisma.dataRequest.update({
      where: { id: deletionRequest.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: 'Cancelado pelo usuário',
      },
    })

    // Remover soft delete se existir
    if (member.deletedAt) {
      await prisma.member.update({
        where: { id: member.id },
        data: {
          deletedAt: null,
        },
      })
    }

    // Registrar log de auditoria (sem userId pois é ação do próprio membro)
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: member.email || null,
        action: 'DELETE_CANCELLED',
        entityType: 'MEMBER',
        entityId: member.id,
        description: `Cancelamento de solicitação de exclusão de dados por ${member.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitação de exclusão cancelada com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao cancelar exclusão:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao cancelar exclusão' },
      { status: 500 }
    )
  }
}
