import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'

/**
 * Remove um membro do ministério (apenas para líder)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId || !user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { id: ministryId, memberId } = resolvedParams

    // Buscar o membro líder correspondente ao usuário através do email
    const leaderMember = await prisma.member.findUnique({
      where: {
        email: user.email,
        churchId: user.churchId,
      },
      select: {
        id: true,
      },
    })

    if (!leaderMember) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: user.churchId,
        leaderId: leaderMember.id,
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403 }
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
        { status: 404 }
      )
    }

    // Remover a associação
    await prisma.memberMinistry.delete({
      where: {
        id: memberMinistry.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao remover membro do ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao remover membro do ministério' },
      { status: 500 }
    )
  }
}

/**
 * Atualiza o papel/função de um membro no ministério (apenas para líder)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId || !user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { id: ministryId, memberId } = resolvedParams
    const body = await request.json()
    const { role } = body

    // Buscar o membro líder correspondente ao usuário através do email
    const leaderMember = await prisma.member.findUnique({
      where: {
        email: user.email,
        churchId: user.churchId,
      },
      select: {
        id: true,
      },
    })

    if (!leaderMember) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o ministério existe e se o membro é líder
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: user.churchId,
        leaderId: leaderMember.id,
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403 }
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
        { status: 404 }
      )
    }

    // Atualizar o papel
    const updated = await prisma.memberMinistry.update({
      where: {
        id: memberMinistry.id,
      },
      data: {
        role: role || null,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: updated.id,
      memberId: updated.member.id,
      name: updated.member.name,
      email: updated.member.email,
      phone: updated.member.phone,
      status: updated.member.status,
      role: updated.role,
      joinedAt: updated.joinedAt,
    })
  } catch (error: any) {
    console.error('Erro ao atualizar papel do membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar papel do membro' },
      { status: 500 }
    )
  }
}

