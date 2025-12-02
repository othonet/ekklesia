import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; discipleshipId: string }> | { id: string; discipleshipId: string } }
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

    // Verificar se o discipulado existe e pertence à igreja do usuário
    const existingDiscipleship = await prisma.discipleship.findFirst({
      where: {
        id: resolvedParams.discipleshipId,
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!existingDiscipleship) {
      return NextResponse.json({ error: 'Discipulado não encontrado' }, { status: 404 })
    }

    const updated = await prisma.discipleship.update({
      where: { id: resolvedParams.discipleshipId },
      data: {
        title,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'IN_PROGRESS',
        discipler: discipler || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro ao atualizar discipulado:', error)
    return NextResponse.json({ error: error.message || 'Erro ao atualizar discipulado' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; discipleshipId: string }> | { id: string; discipleshipId: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)

    // Verificar se o discipulado existe e pertence à igreja do usuário
    const existingDiscipleship = await prisma.discipleship.findFirst({
      where: {
        id: resolvedParams.discipleshipId,
        memberId: resolvedParams.id,
        churchId: user.churchId,
      },
    })

    if (!existingDiscipleship) {
      return NextResponse.json({ error: 'Discipulado não encontrado' }, { status: 404 })
    }

    await prisma.discipleship.delete({
      where: { id: resolvedParams.discipleshipId },
    })

    return NextResponse.json({ message: 'Discipulado excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir discipulado:', error)
    return NextResponse.json({ error: error.message || 'Erro ao excluir discipulado' }, { status: 500 })
  }
}

