import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMemberToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyMemberToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Buscar dados completos do membro
    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
      include: {
        church: {
          select: {
            id: true,
            name: true,
          },
        },
        ministries: {
          include: {
            ministry: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        certificates: {
          where: {
            active: true,
            revoked: false,
          },
          orderBy: {
            issuedDate: 'desc',
          },
        },
        attendances: {
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!member || member.deletedAt) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Remover senha e dados sensíveis
    const { password, cpf, rg, ...memberData } = member

    return NextResponse.json(memberData)
  } catch (error: any) {
    console.error('Erro ao buscar dados do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados do membro' },
      { status: 500 }
    )
  }
}

