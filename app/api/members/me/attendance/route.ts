import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca frequência do membro autenticado via JWT
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

    // Buscar frequência do membro
    const attendances = await prisma.attendance.findMany({
      where: {
        memberId: member.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(attendances)
  } catch (error: any) {
    console.error('Erro ao buscar frequência:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar frequência' },
      { status: 500 }
    )
  }
}
