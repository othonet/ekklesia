import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkModuleAccess } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions-helpers'

export async function GET(request: NextRequest) {
  try {
    // Verificar se o módulo EVENTS está ativo
    const moduleCheck = await checkModuleAccess(request, 'EVENTS')
    if (moduleCheck) return moduleCheck

    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar permissão para ler eventos
    if (!(await checkPermission(request, 'events:read'))) {
      return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para visualizar eventos.' }, { status: 403 })
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
    // Verificar se o módulo EVENTS está ativo
    const moduleCheck = await checkModuleAccess(request, 'EVENTS')
    if (moduleCheck) return moduleCheck

    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar permissão para criar eventos
    if (!(await checkPermission(request, 'events:write'))) {
      return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para criar eventos.' }, { status: 403 })
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

