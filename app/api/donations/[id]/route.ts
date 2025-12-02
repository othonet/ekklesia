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
    const donation = await prisma.donation.findFirst({
      where: { id: resolvedParams.id, churchId: user.churchId },
      include: { 
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    })

    if (!donation) {
      return NextResponse.json({ error: 'Doação não encontrada' }, { status: 404 })
    }

    // Converter Decimal para número
    const donationData = {
      ...donation,
      amount: Number(donation.amount),
    }

    return NextResponse.json(donationData)
  } catch (error: any) {
    console.error('Erro ao buscar doação:', error)
    return NextResponse.json({ error: error.message || 'Erro ao buscar doação' }, { status: 500 })
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
    const { amount, date, method, notes, memberId } = body

    if (!amount || !date) {
      return NextResponse.json(
        { error: 'Valor e data são obrigatórios' },
        { status: 400 }
      )
    }

    const donation = await prisma.donation.findFirst({
      where: { id: resolvedParams.id, churchId: user.churchId },
    })

    if (!donation) {
      return NextResponse.json({ error: 'Doação não encontrada' }, { status: 404 })
    }

    const updated = await prisma.donation.update({
      where: { id: resolvedParams.id },
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        method: method || null,
        notes: notes || null,
        memberId: memberId && memberId !== '' ? memberId : null,
      },
      include: { 
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    })

    // Converter Decimal para número
    const updatedData = {
      ...updated,
      amount: Number(updated.amount),
    }

    return NextResponse.json(updatedData)
  } catch (error: any) {
    console.error('Erro ao atualizar doação:', error)
    return NextResponse.json({ error: error.message || 'Erro ao atualizar doação' }, { status: 500 })
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
    const donation = await prisma.donation.findFirst({
      where: { id: resolvedParams.id, churchId: user.churchId },
    })

    if (!donation) {
      return NextResponse.json({ error: 'Doação não encontrada' }, { status: 404 })
    }

    await prisma.donation.delete({ where: { id: resolvedParams.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar doação:', error)
    return NextResponse.json({ error: error.message || 'Erro ao deletar doação' }, { status: 500 })
  }
}

