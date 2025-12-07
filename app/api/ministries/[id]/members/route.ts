import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'

/**
 * Busca membros de um ministério específico
 * Endpoint para uso do app mobile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const ministryId = resolvedParams.id

    // Buscar ministério e verificar se o membro pertence a ele
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: member.churchId,
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o membro autenticado pertence a este ministério
    const memberBelongsToMinistry = ministry.members.some(
      mm => mm.memberId === member.id
    ) || ministry.leaderId === member.id

    if (!memberBelongsToMinistry) {
      return NextResponse.json(
        { error: 'Você não tem acesso a este ministério' },
        { status: 403 }
      )
    }

    // Formatar resposta
    const members = ministry.members.map((mm) => ({
      id: mm.member.id,
      name: mm.member.name,
      email: mm.member.email,
      role: mm.role,
      joinedAt: mm.joinedAt,
      leader: ministry.leader ? {
        id: ministry.leader.id,
        name: ministry.leader.name,
        email: ministry.leader.email,
      } : null,
    }))

    return NextResponse.json({
      ministry: {
        id: ministry.id,
        name: ministry.name,
        description: ministry.description,
        leader: ministry.leader ? {
          id: ministry.leader.id,
          name: ministry.leader.name,
          email: ministry.leader.email,
        } : null,
      },
      members,
    })
  } catch (error: any) {
    console.error('Erro ao buscar membros do ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar membros do ministério' },
      { status: 500 }
    )
  }
}

