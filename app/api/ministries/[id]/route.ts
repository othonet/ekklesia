import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const ministry = await prisma.ministry.findFirst({
      where: { id: params.id, churchId: user.churchId },
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
        },
      },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    return NextResponse.json(ministry)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, leaderId, active } = body

    const ministry = await prisma.ministry.findFirst({
      where: { id: params.id, churchId: user.churchId },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    // Validar que o líder é um membro cadastrado da igreja
    if (leaderId) {
      const leaderMember = await prisma.member.findFirst({
        where: {
          id: leaderId,
          churchId: user.churchId,
          deletedAt: null,
        },
      })

      if (!leaderMember) {
        return NextResponse.json(
          { error: 'Líder deve ser um membro cadastrado da igreja' },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.ministry.update({
      where: { id: params.id },
      data: {
        name,
        description,
        leaderId: leaderId || null,
        active,
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const ministry = await prisma.ministry.findFirst({
      where: { id: params.id, churchId: user.churchId },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    await prisma.ministry.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

