import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se é admin ou pastor
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
    })

    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'PASTOR')) {
      return NextResponse.json(
        { error: 'Apenas administradores podem acessar este relatório' },
        { status: 403 }
      )
    }

    // Buscar membros com consentimento pendente
    const members = await prisma.member.findMany({
      where: {
        churchId: user.churchId,
        dataConsent: false,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        consentDate: true,
        status: true,
      },
    })

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: 'VIEW',
        entityType: 'MEMBER_PENDING_CONSENT_REPORT',
        description: `Visualização de relatório de membros com consentimento pendente (${members.length} membros)`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      total: members.length,
      members,
    })
  } catch (error: any) {
    console.error('Erro ao buscar membros com consentimento pendente:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar membros' },
      { status: 500 }
    )
  }
}

