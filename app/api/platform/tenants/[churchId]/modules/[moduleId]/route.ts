import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPlatformAdmin } from '@/lib/platform-auth'
import { getCorsHeaders } from '@/lib/cors'

/**
 * Atualiza módulo individual de uma igreja
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string; moduleId: string }> | { churchId: string; moduleId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId, moduleId } = await Promise.resolve(params)
    const body = await request.json()
    const { active, expiresAt } = body

    const churchModule = await prisma.churchModule.findUnique({
      where: {
        churchId_moduleId: {
          churchId,
          moduleId,
        },
      },
    })

    if (!churchModule) {
      return NextResponse.json(
        { error: 'Módulo não encontrado para esta igreja' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    const updated = await prisma.churchModule.update({
      where: { id: churchModule.id },
      data: {
        ...(active !== undefined && { active }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
      include: {
        module: true,
      },
    })

    return NextResponse.json(
      { module: updated },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao atualizar módulo da igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

/**
 * Remove módulo individual de uma igreja
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ churchId: string; moduleId: string }> | { churchId: string; moduleId: string } }
) {
  try {
    if (!(await isPlatformAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403, headers: getCorsHeaders(request) }
      )
    }

    const { churchId, moduleId } = await Promise.resolve(params)

    const churchModule = await prisma.churchModule.findUnique({
      where: {
        churchId_moduleId: {
          churchId,
          moduleId,
        },
      },
    })

    if (!churchModule) {
      return NextResponse.json(
        { error: 'Módulo não encontrado para esta igreja' },
        { status: 404, headers: getCorsHeaders(request) }
      )
    }

    await prisma.churchModule.delete({
      where: { id: churchModule.id },
    })

    return NextResponse.json(
      { message: 'Módulo removido com sucesso' },
      { headers: getCorsHeaders(request) }
    )
  } catch (error: any) {
    console.error('Erro ao remover módulo da igreja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao remover módulo' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

