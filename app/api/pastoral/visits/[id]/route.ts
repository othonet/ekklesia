import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'
import { getCorsHeaders } from '@/lib/cors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)
    const visit = await prisma.pastoralVisit.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pastor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!visit) {
      return NextResponse.json(
        { error: 'Visita não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    return NextResponse.json(
      { visit },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar visita:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar visita' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const {
      visitDate,
      visitType,
      location,
      reason,
      notes,
      actions,
      privacy,
      nextSteps,
      followUpDate,
    } = body

    const visit = await prisma.pastoralVisit.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!visit) {
      return NextResponse.json(
        { error: 'Visita não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar permissão - apenas quem criou ou admins podem editar
    if (visit.pastorId !== user.userId && user.role !== 'ADMIN' && user.role !== 'PASTOR_PRESIDENTE') {
      return NextResponse.json(
        { error: 'Acesso negado. Você só pode editar suas próprias visitas.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const updateData: any = {}
    if (visitDate) updateData.visitDate = new Date(visitDate)
    if (visitType) updateData.visitType = visitType
    if (location !== undefined) updateData.location = location || null
    if (reason) updateData.reason = reason
    if (notes !== undefined) updateData.notes = notes || null
    if (actions) updateData.actions = JSON.stringify(actions)
    if (privacy) updateData.privacy = privacy
    if (nextSteps !== undefined) updateData.nextSteps = nextSteps || null
    if (followUpDate) updateData.followUpDate = new Date(followUpDate)

    const updated = await prisma.pastoralVisit.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pastor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      { visit: updated },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar visita:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar visita' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)
    const visit = await prisma.pastoralVisit.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!visit) {
      return NextResponse.json(
        { error: 'Visita não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Apenas quem criou ou admins podem deletar
    if (visit.pastorId !== user.userId && user.role !== 'ADMIN' && user.role !== 'PASTOR_PRESIDENTE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    await prisma.pastoralVisit.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar visita:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar visita' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

