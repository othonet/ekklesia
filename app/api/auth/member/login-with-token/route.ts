import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMemberToken } from '@/lib/auth'
import { getMemberByPrivacyToken } from '@/lib/privacy-helpers'

/**
 * Endpoint para fazer login usando token de privacidade
 * Converte o privacy token em JWT para uso no app mobile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { privacyToken } = body

    if (!privacyToken) {
      return NextResponse.json(
        { error: 'Token de privacidade é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar membro pelo token de privacidade
    const member = await prisma.member.findFirst({
      where: {
        privacyToken: privacyToken,
        deletedAt: null,
        OR: [
          { privacyTokenExpiresAt: null },
          { privacyTokenExpiresAt: { gte: new Date() } },
        ],
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Token de privacidade inválido ou expirado' },
        { status: 401 }
      )
    }

    // Gerar JWT token para o membro
    const token = generateMemberToken({
      memberId: member.id,
      email: member.email || '',
      churchId: member.churchId,
    })

    // Remover senha e dados sensíveis
    const { password, cpf, rg, cpfEncrypted, rgEncrypted, privacyToken: _, privacyTokenExpiresAt: __, ...memberData } = member

    // Registrar log de acesso
    await prisma.auditLog.create({
      data: {
        userId: null,
        userEmail: member.email || null,
        action: 'LOGIN',
        entityType: 'MEMBER',
        entityId: member.id,
        description: `Login via token de privacidade por ${member.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      token,
      member: memberData,
    })
  } catch (error: any) {
    console.error('Erro no login com token de privacidade:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}

