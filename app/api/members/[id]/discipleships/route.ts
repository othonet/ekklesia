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
    const discipleships = await prisma.discipleship.findMany({
      where: {
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(discipleships)
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
    const { title, startDate, endDate, status, discipler, notes } = body

    if (!title || !startDate) {
      return NextResponse.json({ error: 'Título e data de início são obrigatórios' }, { status: 400 })
    }

    const discipleship = await prisma.discipleship.create({
      data: {
        memberId: resolvedParams.id,
        title,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'IN_PROGRESS',
        discipler,
        notes,
        churchId: user.churchId,
      },
    })

    return NextResponse.json(discipleship, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

