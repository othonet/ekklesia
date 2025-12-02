import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const budgets = await prisma.budget.findMany({
      where: { churchId: user.churchId },
      orderBy: { createdAt: 'desc' },
    })

    // Calcular spentAmount para cada orçamento
    const budgetsData = await Promise.all(
      budgets.map(async (budget) => {
        // Buscar despesas que correspondem ao orçamento
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

        // Atualizar o orçamento com o valor gasto calculado
        const updatedBudget = await prisma.budget.update({
          where: { id: budget.id },
          data: { spentAmount },
        })

        return {
          ...updatedBudget,
          totalAmount: Number(updatedBudget.totalAmount),
          spentAmount: Number(updatedBudget.spentAmount),
        }
      })
    )

    return NextResponse.json(budgetsData)
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

    const body = await request.json()
    const { name, description, startDate, endDate, totalAmount, category } = body

    if (!name || !startDate || !endDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Nome, datas e valor total são obrigatórios' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount: parseFloat(totalAmount),
        category: category || null,
        churchId: user.churchId,
      },
    })

    const budgetData = {
      ...budget,
      totalAmount: Number(budget.totalAmount),
      spentAmount: Number(budget.spentAmount),
    }

    return NextResponse.json(budgetData, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

