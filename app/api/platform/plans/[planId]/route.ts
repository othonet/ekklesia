import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

// Atualizar plano
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> | { planId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { planId } = await Promise.resolve(params)
    const body = await request.json()
    const { key, name, description, price, active, moduleIds } = body

    if (!key || !name) {
      return NextResponse.json(
        { error: 'key e name são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se o plano existe
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se key já existe em outro plano
    if (key !== existingPlan.key) {
      const planWithKey = await prisma.plan.findUnique({
        where: { key },
      })

      if (planWithKey) {
        return NextResponse.json(
          { error: 'Key já está em uso por outro plano' },
          { status: 400, headers: getCorsHeaders(request) }
        )
      }
    }

    // Atualizar plano
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        key,
        name,
        description,
        price: price ? parseFloat(price) : null,
        active: active !== undefined ? active : existingPlan.active,
      },
      include: {
        modules: {
          include: {
            module: true,
          },
        },
      },
    })

    // Atualizar módulos se fornecido
    if (moduleIds && Array.isArray(moduleIds)) {
      // Remover módulos antigos
      await prisma.planModule.deleteMany({
        where: { planId: planId },
      })

      // Adicionar novos módulos
      if (moduleIds.length > 0) {
        await prisma.planModule.createMany({
          data: moduleIds.map((moduleId: string) => ({
            planId: planId,
            moduleId: moduleId,
          })),
        })
      }

      // Buscar plano atualizado com módulos
      const planWithModules = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          modules: {
            include: {
              module: true,
            },
          },
        },
      })

      return NextResponse.json(
        { plan: planWithModules },
        { headers: getCorsHeaders(request) }
      )
    }

    return NextResponse.json(
      { plan: updatedPlan },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar plano' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Obter plano específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> | { planId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { planId } = await Promise.resolve(params)

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        modules: {
          include: {
            module: true,
          },
        },
        _count: {
          select: {
            churches: true,
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    return NextResponse.json(
      { plan },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar plano:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar plano' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Deletar plano
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> | { planId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { planId } = await Promise.resolve(params)

    // Verificar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            churches: true,
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se há igrejas usando este plano
    if (plan._count.churches > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir plano. ${plan._count.churches} igreja(s) estão usando este plano.` 
        },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Deletar plano (os módulos serão deletados em cascata)
    await prisma.plan.delete({
      where: { id: planId },
    })

    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar plano:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar plano' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

