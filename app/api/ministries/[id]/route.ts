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
    const { name, description, leader, active } = body

    const ministry = await prisma.ministry.findFirst({
      where: { id: params.id, churchId: user.churchId },
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }

    const updated = await prisma.ministry.update({
      where: { id: params.id },
      data: { name, description, leader, active },
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

