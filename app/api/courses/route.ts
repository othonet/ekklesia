import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar permissão para ler cursos
    if (!(await checkPermission(request, 'courses:read'))) {
      return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para visualizar cursos.' }, { status: 403 })
    }

    const courses = await prisma.course.findMany({
      where: { churchId: user.churchId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(courses)
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

    // Verificar permissão para criar cursos
    if (!(await checkPermission(request, 'courses:write'))) {
      return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para criar cursos.' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, duration, active } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        duration: duration ? parseInt(duration) : null,
        active: active !== undefined ? active : true,
        churchId: user.churchId,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

