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

    const event = await prisma.event.findFirst({
      where: { id: params.id, churchId: user.churchId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(event)
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
    const { title, description, date, location, type, active } = body

    const event = await prisma.event.findFirst({
      where: { id: params.id, churchId: user.churchId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        type,
        active,
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

    const event = await prisma.event.findFirst({
      where: { id: params.id, churchId: user.churchId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    await prisma.event.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

