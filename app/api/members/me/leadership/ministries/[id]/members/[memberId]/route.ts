import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedMember } from '@/lib/member-auth'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

/**
 * Remove um membro do ministério (apenas para líder membro)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
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
    const { id: ministryId, memberId } = resolvedParams

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: member.churchId,
        leaderId: member.id,
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Verificar se existe a associação
    const memberMinistry = await prisma.memberMinistry.findUnique({
      where: {
        memberId_ministryId: {
          memberId: memberId,
          ministryId: ministryId,
        },
      },
    })

    if (!memberMinistry) {
      return NextResponse.json(
        { error: 'Membro não está associado a este ministério' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Remover a associação
    await prisma.memberMinistry.delete({
      where: {
        id: memberMinistry.id,
      },
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Erro ao remover membro do ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao remover membro do ministério' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

