import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const memberMinistries = await prisma.memberMinistry.findMany({
      where: {
        memberId: resolvedParams.id,
        ministry: {
          churchId: user.churchId,
        },
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

    return NextResponse.json(memberMinistries)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { ministryId, role } = body

    if (!ministryId) {
      return NextResponse.json({ error: 'Ministério é obrigatório' }, { status: 400 })
    }

    // Verificar se o ministério pertence à igreja
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: ministryId,
        churchId: user.churchId,
      },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    // Verificar se já existe a associação
    const existing = await prisma.memberMinistry.findUnique({
      where: {
        memberId_ministryId: {
          memberId: resolvedParams.id,
          ministryId: ministryId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Membro já está associado a este ministério' }, { status: 400 })
    }

    const memberMinistry = await prisma.memberMinistry.create({
      data: {
        memberId: resolvedParams.id,
        ministryId: ministryId,
        role: role || null,
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
    })

    return NextResponse.json(memberMinistry, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao associar membro ao ministério:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const { searchParams } = new URL(request.url)
    const ministryId = searchParams.get('ministryId')

    if (!ministryId) {
      return NextResponse.json({ error: 'ID do ministério é obrigatório' }, { status: 400 })
    }

    const memberMinistry = await prisma.memberMinistry.findUnique({
      where: {
        memberId_ministryId: {
          memberId: resolvedParams.id,
          ministryId: ministryId,
        },
      },
      include: {
        ministry: {
          select: {
            churchId: true,
          },
        },
      },
    })

    if (!memberMinistry || memberMinistry.ministry.churchId !== user.churchId) {
      return NextResponse.json({ error: 'Associação não encontrada' }, { status: 404 })
    }

    await prisma.memberMinistry.delete({
      where: {
        memberId_ministryId: {
          memberId: resolvedParams.id,
          ministryId: ministryId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
