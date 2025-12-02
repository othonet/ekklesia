import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca certificados do membro autenticado via JWT
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

    // Buscar certificados do membro
    const certificates = await prisma.certificate.findMany({
      where: {
        memberId: member.id,
        active: true,
        revoked: false,
      },
      include: {
        baptism: {
          select: {
            date: true,
            location: true,
            minister: true,
          },
        },
        course: {
          select: {
            name: true,
            description: true,
          },
        },
        event: {
          select: {
            title: true,
            date: true,
            type: true,
          },
        },
        church: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { issuedDate: 'desc' },
    })

    return NextResponse.json(certificates)
  } catch (error: any) {
    console.error('Erro ao buscar certificados:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar certificados' },
      { status: 500 }
    )
  }
}
