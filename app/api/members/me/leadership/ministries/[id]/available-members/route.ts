import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

/**
 * Busca membros disponíveis para adicionar ao ministério (apenas para líder membro)
 * Retorna membros que não estão no ministério e não são o próprio líder
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const corsHeaders = getCorsHeaders(request)
    
    // Buscar membro autenticado via JWT
    const member = await getAuthenticatedMember(request)

    if (!member) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401, headers: corsHeaders }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const ministryId = resolvedParams.id

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: member.churchId,
        leaderId: member.id,
      },
      include: {
        members: {
          select: {
            memberId: true,
          },
        },
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Buscar todos os membros da igreja que não estão no ministério
    const memberIdsInMinistry = ministry.members.map(m => m.memberId)
    memberIdsInMinistry.push(ministry.leaderId!) // Adicionar o líder também

    const availableMembers = await prisma.member.findMany({
      where: {
        churchId: member.churchId,
        deletedAt: null,
        status: 'ACTIVE',
        id: {
          notIn: memberIdsInMinistry,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      members: availableMembers,
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Erro ao buscar membros disponíveis:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar membros disponíveis' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

