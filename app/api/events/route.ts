import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: { churchId: user.churchId },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, location, type, active } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Título e data são obrigatórios' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        type: type || 'OTHER',
        active: active !== undefined ? active : true,
        churchId: user.churchId,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

