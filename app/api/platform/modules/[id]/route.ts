import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

// Obter módulo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)

    const moduleData = await prisma.module.findUnique({
      where: { id },
    })

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    return NextResponse.json(
      { module: moduleData },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao buscar módulo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Atualizar módulo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { name, description, icon, route, order, active } = body

    const updatedModuleData = await prisma.module.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(route !== undefined && { route }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(
      { module: updatedModuleData },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar módulo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Deletar módulo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores da plataforma.' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { id } = await Promise.resolve(params)

    // Verificar se o módulo está sendo usado em algum plano
    const planModules = await prisma.planModule.findMany({
      where: { moduleId: id },
    })

    if (planModules.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar módulo que está sendo usado em planos' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Verificar se o módulo está sendo usado em igrejas
    const churchModules = await prisma.churchModule.findMany({
      where: { moduleId: id },
    })

    if (churchModules.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar módulo que está sendo usado por igrejas' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    await prisma.module.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Módulo deletado com sucesso' },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao deletar módulo:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}
