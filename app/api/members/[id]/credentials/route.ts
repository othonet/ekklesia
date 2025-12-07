import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { hashPassword } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)

    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { email, password } = body as {
      email?: string
      password: string
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const member = await prisma.member.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
        deletedAt: null,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Se for enviado um e-mail novo, garantir unicidade
    let newEmail = member.email
    if (email && email.trim() !== '') {
      const existing = await prisma.member.findFirst({
        where: {
          email: email.trim(),
          churchId: user.churchId,
          deletedAt: null,
          NOT: { id: member.id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe outro membro com este e-mail.' },
          { status: 400 }
        )
      }

      newEmail = email.trim()
    }

    const hashedPassword = await hashPassword(password)

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        email: newEmail,
        password: hashedPassword,
      },
    })

    await createAuditLog({
      userId: user.userId,
      userEmail: user.email,
      action: 'UPDATE',
      entityType: 'MEMBER',
      entityId: member.id,
      description: `Definição/atualização de credenciais de acesso para o membro: ${member.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      success: true,
      message: 'Credenciais definidas/atualizadas com sucesso.',
      memberId: updated.id,
      hasEmail: !!updated.email,
    })
  } catch (error: any) {
    console.error('Erro ao definir credenciais do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao definir credenciais do membro' },
      { status: 500 }
    )
  }
}


