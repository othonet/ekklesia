import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca ministérios do membro autenticado via JWT
 * Endpoint para uso do app mobile
 */
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

    // Buscar ministérios do membro
    const memberMinistries = await prisma.memberMinistry.findMany({
      where: {
        memberId: member.id,
      },
      include: {
        ministry: {
          select: {
            id: true,
            name: true,
            description: true,
            active: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    // Formatar resposta
    const ministries = memberMinistries.map((mm) => ({
      id: mm.ministry.id,
      name: mm.ministry.name,
      description: mm.ministry.description,
      role: mm.role,
      joinedAt: mm.joinedAt,
    }))

    return NextResponse.json(ministries)
  } catch (error: any) {
    console.error('Erro ao buscar ministérios:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ministérios' },
      { status: 500 }
    )
  }
}
