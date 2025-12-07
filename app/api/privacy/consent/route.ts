import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { granted } = body

    if (typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'Parâmetro "granted" deve ser true ou false' },
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

    // Atualizar consentimento do membro
    await prisma.member.update({
      where: { id: member.id },
      data: {
        dataConsent: granted,
        consentDate: granted ? new Date() : null,
      },
    })

    // Criar ou atualizar registro de consentimento
    const existingConsent = await prisma.memberConsent.findFirst({
      where: {
        memberId: member.id,
        consentType: 'DATA_PROCESSING',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existingConsent && !existingConsent.revokedAt) {
      // Atualizar consentimento existente
      await prisma.memberConsent.update({
        where: { id: existingConsent.id },
        data: {
          granted,
          grantedAt: granted ? new Date() : existingConsent.grantedAt,
          revokedAt: granted ? null : new Date(),
        },
      })
    } else {
      // Criar novo registro de consentimento
      await prisma.memberConsent.create({
        data: {
          memberId: member.id,
          consentType: 'DATA_PROCESSING',
          granted,
          grantedAt: granted ? new Date() : null,
          revokedAt: granted ? null : new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })
    }

    // Registrar log de auditoria (sem userId pois é ação do próprio membro)
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: member.email || null,
        action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
        entityType: 'MEMBER',
        entityId: member.id,
        description: granted 
          ? `Consentimento para tratamento de dados pessoais concedido por ${member.name}`
          : `Consentimento para tratamento de dados pessoais revogado por ${member.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: granted 
        ? 'Consentimento concedido com sucesso'
        : 'Consentimento revogado com sucesso',
      dataConsent: granted,
      consentDate: granted ? new Date() : null,
    })
  } catch (error: any) {
    console.error('Erro ao processar consentimento:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar consentimento' },
      { status: 500 }
    )
  }
}

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

    // Buscar consentimentos
    const consents = await prisma.memberConsent.findMany({
      where: {
        memberId: member.id,
        consentType: 'DATA_PROCESSING',
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      dataConsent: member.dataConsent,
      consentDate: member.consentDate,
      consents,
    })
  } catch (error: any) {
    console.error('Erro ao buscar consentimento:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar consentimento' },
      { status: 500 }
    )
  }
}
