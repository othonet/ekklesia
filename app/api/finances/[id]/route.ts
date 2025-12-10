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

    const { id } = await Promise.resolve(params)

    const finance = await prisma.finance.findFirst({
      where: { id, churchId: user.churchId },
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

    if (!finance) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    }

    const financeData = {
      ...finance,
      amount: Number(finance.amount),
    }

    return NextResponse.json(financeData)
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

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { description, amount, type, category, date, donationType, method, memberId } = body

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { error: 'Descrição, valor, tipo e data são obrigatórios' },
        { status: 400 }
      )
    }

    // Normalizar donationType: remover 'none' e strings vazias
    const normalizedDonationType = (() => {
      if (!donationType) return null
      const dt = String(donationType)
      if (dt === '' || dt === 'none') return null
      if (dt === 'TITHE' || dt === 'OFFERING' || dt === 'CONTRIBUTION') {
        return dt as 'TITHE' | 'OFFERING' | 'CONTRIBUTION'
      }
      return null
    })()

    const finance = await prisma.finance.findFirst({
      where: { id, churchId: user.churchId },
    })

    if (!finance) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    }

    const updated = await prisma.finance.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(amount),
        type,
        category: category && category !== '' ? category : null,
        date: new Date(date),
        donationType: normalizedDonationType,
        method: method && method !== '' ? method : null,
        memberId: memberId && memberId !== '' && memberId !== 'none' ? memberId : null,
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

    const financeData = {
      ...updated,
      amount: Number(updated.amount),
    }

    return NextResponse.json(financeData)
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

    const { id } = await Promise.resolve(params)

    const finance = await prisma.finance.findFirst({
      where: { id, churchId: user.churchId },
    })

    if (!finance) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    }

    await prisma.finance.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

