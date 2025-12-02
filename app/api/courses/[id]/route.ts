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
    const course = await prisma.course.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
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
    const { name, description, duration, active } = body

    const course = await prisma.course.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    const updated = await prisma.course.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        description,
        duration: duration ? parseInt(duration) : null,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
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
    const course = await prisma.course.findFirst({
      where: {
        id: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    await prisma.course.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

