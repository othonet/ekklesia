import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/api-helpers'
import { getCorsHeaders } from '@/lib/cors'

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

    // Apenas pastores/líderes podem atualizar
    const allowedRoles = ['ADMIN', 'PASTOR_PRESIDENTE', 'PASTOR', 'LEADER']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { status, helpingMinistryId, helpingUserId, history } = body

    const need = await prisma.memberNeed.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!need) {
      return NextResponse.json(
        { error: 'Necessidade não encontrada' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'ATTENDED') {
        updateData.attendedAt = new Date()
      }
    }
    if (helpingMinistryId !== undefined) updateData.helpingMinistryId = helpingMinistryId || null
    if (helpingUserId !== undefined) updateData.helpingUserId = helpingUserId || null
    if (history) updateData.history = history

    const updated = await prisma.memberNeed.update({
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
        helpingMinistry: {
          select: {
            id: true,
            name: true,
          },
        },
        helpingUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      { need: updated },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar necessidade:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar necessidade' },
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

    // Apenas admins podem deletar
    if (user.role !== 'ADMIN' && user.role !== 'PASTOR_PRESIDENTE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)
    await prisma.memberNeed.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar necessidade:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar necessidade' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

