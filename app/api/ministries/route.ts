import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const ministries = await prisma.ministry.findMany({
      where: { churchId: user.churchId },
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          include: {
            member: true,
          },
        },
      },
    })

    return NextResponse.json(ministries)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ministérios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, leader, active } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const ministry = await prisma.ministry.create({
      data: {
        name,
        description,
        leader,
        active: active !== undefined ? active : true,
        churchId: user.churchId,
      },
    })

    return NextResponse.json(ministry, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar ministério' },
      { status: 500 }
    )
  }
}

