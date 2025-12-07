import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'

/**
 * Lista membros de um ministério (apenas para líder)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
    const ministryId = resolvedParams.id

    // Buscar o membro correspondente ao usuário através do email
    const member = await prisma.member.findUnique({
      where: {
        email: user.email,
        churchId: user.churchId,
      },
      select: {
        id: true,
      },
    })

    if (!member) {
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
        leaderId: member.id,
      },
      include: {
        members: {
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
          orderBy: {
            joinedAt: 'desc',
          },
        },
      },
    })

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministério não encontrado ou você não é líder deste ministério' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      members: ministry.members.map(mm => ({
        id: mm.id,
        memberId: mm.member.id,
        name: mm.member.name,
        email: mm.member.email,
        phone: mm.member.phone,
        status: mm.member.status,
        role: mm.role,
        joinedAt: mm.joinedAt,
      })),
    })
  } catch (error: any) {
    console.error('Erro ao buscar membros do ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar membros do ministério' },
      { status: 500 }
    )
  }
}

/**
 * Associa um membro ao ministério (apenas para líder)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
    const ministryId = resolvedParams.id
    const body = await request.json()
    const { memberId, role } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      )
    }

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

    // Verificar se o membro a ser associado existe e pertence à mesma igreja
    const memberToAdd = await prisma.member.findFirst({
      where: {
        id: memberId,
        churchId: user.churchId,
        deletedAt: null,
      },
    })

    if (!memberToAdd) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o membro já é líder deste ministério
    if (ministry.leaderId === memberId) {
      return NextResponse.json(
        { error: 'Este membro já é líder deste ministério e não pode ser associado como membro comum' },
        { status: 400 }
      )
    }

    // Verificar se já existe a associação
    const existing = await prisma.memberMinistry.findUnique({
      where: {
        memberId_ministryId: {
          memberId: memberId,
          ministryId: ministryId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Membro já está associado a este ministério' },
        { status: 400 }
      )
    }

    // Criar a associação
    const memberMinistry = await prisma.memberMinistry.create({
      data: {
        memberId: memberId,
        ministryId: ministryId,
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
      id: memberMinistry.id,
      memberId: memberMinistry.member.id,
      name: memberMinistry.member.name,
      email: memberMinistry.member.email,
      phone: memberMinistry.member.phone,
      status: memberMinistry.member.status,
      role: memberMinistry.role,
      joinedAt: memberMinistry.joinedAt,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao associar membro ao ministério:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao associar membro ao ministério' },
      { status: 500 }
    )
  }
}

