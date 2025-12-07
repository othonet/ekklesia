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

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Calcular valor gasto baseado nas despesas do período
    const expenses = await prisma.finance.findMany({
      where: {
        churchId: user.churchId,
        type: 'EXPENSE',
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
        ...(budget.category && { category: budget.category }),
      },
    })

    const spentAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    // Atualizar orçamento com valor gasto
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: { spentAmount },
    })

    const budgetData = {
      ...updatedBudget,
      totalAmount: Number(updatedBudget.totalAmount),
      spentAmount: Number(updatedBudget.spentAmount),
    }

    return NextResponse.json(budgetData)
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
    const { name, description, startDate, endDate, totalAmount, category, active } = body

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(totalAmount && { totalAmount: parseFloat(totalAmount) }),
        ...(category !== undefined && { category }),
        ...(active !== undefined && { active }),
      },
    })

    const budgetData = {
      ...updatedBudget,
      totalAmount: Number(updatedBudget.totalAmount),
      spentAmount: Number(updatedBudget.spentAmount),
    }

    return NextResponse.json(budgetData)
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

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Orçamento excluído com sucesso' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

