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
    const prayer = await prisma.prayerRequest.findFirst({
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
      },
    })

    if (!prayer) {
      return NextResponse.json(
        { error: 'Pedido de oração não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    return NextResponse.json(
      {
        ...prayer,
        prayingUsers: prayer.prayingUsers ? JSON.parse(prayer.prayingUsers) : [],
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar pedido de oração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pedido de oração' },
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
    const { status, prayingUsers, answer } = body

    const prayer = await prisma.prayerRequest.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!prayer) {
      return NextResponse.json(
        { error: 'Pedido de oração não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (prayingUsers) updateData.prayingUsers = JSON.stringify(prayingUsers)
    if (answer) {
      updateData.answer = answer
      if (status === 'ANSWERED') {
        updateData.answeredAt = new Date()
      }
    }

    const updated = await prisma.prayerRequest.update({
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
      },
    })

    return NextResponse.json(
      {
        ...updated,
        prayingUsers: updated.prayingUsers ? JSON.parse(updated.prayingUsers) : [],
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar pedido de oração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar pedido de oração' },
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
    await prisma.prayerRequest.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar pedido de oração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar pedido de oração' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

