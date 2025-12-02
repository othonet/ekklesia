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
    const memberCourses = await prisma.memberCourse.findMany({
      where: {
        memberId: resolvedParams.id,
        course: {
          churchId: user.churchId,
        },
      },
      include: {
        course: true,
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(memberCourses)
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
    const { courseId, startDate, endDate, status, grade, certificate, notes } = body

    if (!courseId || !startDate) {
      return NextResponse.json({ error: 'Curso e data de início são obrigatórios' }, { status: 400 })
    }

    const memberCourse = await prisma.memberCourse.create({
      data: {
        memberId: resolvedParams.id,
        courseId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'IN_PROGRESS',
        grade,
        certificate: certificate || false,
        notes,
      },
      include: {
        course: true,
      },
    })

    return NextResponse.json(memberCourse, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

