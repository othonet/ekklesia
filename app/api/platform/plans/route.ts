import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

// Listar todos os planos
export async function GET(request: NextRequest) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const plans = await prisma.plan.findMany({
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
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(
      { plans },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao listar planos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao listar planos' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Criar novo plano
export async function POST(request: NextRequest) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const body = await request.json()
    const { key, name, description, price, moduleIds } = body

    if (!key || !name) {
      return NextResponse.json(
        { error: 'key e name são obrigatórios' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        key,
        name,
        description,
        price: price ? parseFloat(price) : null,
        modules: {
          create: moduleIds?.map((moduleId: string) => ({
            moduleId,
          })) || [],
        },
      },
      include: {
        modules: {
          include: {
            module: true,
          },
        },
      },
    })

    return NextResponse.json(
      { plan },
      { status: 201, headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao criar plano:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar plano' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

